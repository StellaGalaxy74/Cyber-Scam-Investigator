import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_INVESTIGATIONS } from './src/data/sampleInvestigations.ts';
import {
  addChatMessage,
  clearUserChatMessages,
  clearUserInvestigations,
  createInvestigation,
  deleteUserInvestigation,
  getUserInvestigationByCode,
  listUserChatMessages,
  listUserInvestigations,
} from './src/db/investigations.ts';
import { getOrCreateUser, updateUserProfile } from './src/db/users.ts';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  analyzeContactWithAi,
  analyzeMessageWithAi,
  analyzeScreenshotWithAi,
  analyzeUrlWithAi,
  generateAssistantResponse,
} from './src/services/aiInvestigator.ts';
import { inspectEmailSafely, inspectPhoneSafely } from './src/services/contactAnalyzer.ts';
import { redactSensitiveCredentials, sanitizeText } from './src/services/sanitizer.ts';
import { inspectUrlSafely } from './src/services/urlAnalyzer.ts';
import type { InvestigationReport } from './src/types/investigation.ts';

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? Number(process.env.PORT) || 3000 : 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please pause briefly and try again.' },
});

const scanLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Investigation rate limit reached. Please wait a few minutes before running more scans.' },
});

app.use('/api', apiLimiter);

// Secure in-memory file upload configuration (never writes untrusted payloads to disk or executes them)
const ALLOWED_UPLOAD_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 6 * 1024 * 1024, // 6 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Upload PNG, JPG, WEBP, PDF, or TXT evidence only.'));
    }
  },
});

async function persistInvestigationIfAllowed(
  userRecord: { id: number; saveHistory: boolean },
  report: InvestigationReport
): Promise<InvestigationReport> {
  const sanitizedSubmitted = redactSensitiveCredentials(report.submittedContent);
  const safeReport: InvestigationReport = {
    ...report,
    submittedContent: sanitizedSubmitted,
  };

  if (!userRecord.saveHistory) {
    return safeReport;
  }

  await createInvestigation({
    investigationCode: safeReport.investigationCode,
    userId: userRecord.id,
    type: safeReport.type,
    submittedContent: sanitizedSubmitted,
    threatCategory: safeReport.threatCategory,
    riskScore: safeReport.riskScore,
    threatClassification: safeReport.threatClassification,
    scamProbability: safeReport.scamProbability,
    confidenceLevel: safeReport.confidenceLevel,
    intelligenceStatus: safeReport.intelligenceStatus,
    reportJson: {
      summary: safeReport.summary,
      suspiciousKeywords: safeReport.suspiciousKeywords,
      psychologicalTechniques: safeReport.psychologicalTechniques,
      financialWarningSigns: safeReport.financialWarningSigns,
      redFlags: safeReport.redFlags,
      supportingEvidence: safeReport.supportingEvidence,
      recommendedActions: safeReport.recommendedActions,
      safetyWarnings: safeReport.safetyWarnings,
      technicalFindings: safeReport.technicalFindings,
      evidenceSplit: safeReport.evidenceSplit,
      ocrExtractedText: safeReport.ocrExtractedText,
    },
  });

  return safeReport;
}

// Health & Public Samples
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/samples', (_req, res) => {
  res.json({ samples: SAMPLE_INVESTIGATIONS });
});

// User Profile & Auth Sync
app.get('/api/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || 'user@investigator.local';
    const displayName = typeof req.user!.name === 'string' ? req.user!.name : undefined;
    const user = await getOrCreateUser(uid, email, displayName);
    res.json({ profile: user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load profile.' });
  }
});

app.patch('/api/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || 'user@investigator.local';
    await getOrCreateUser(uid, email);

    const displayName =
      typeof req.body?.displayName === 'string' ? sanitizeText(req.body.displayName, 80) : undefined;
    const countryCode =
      typeof req.body?.countryCode === 'string' ? sanitizeText(req.body.countryCode, 10) : undefined;
    const preferredRegion =
      typeof req.body?.preferredRegion === 'string' ? sanitizeText(req.body.preferredRegion, 60) : undefined;
    const saveHistory =
      typeof req.body?.saveHistory === 'boolean' ? req.body.saveHistory : undefined;

    const updated = await updateUserProfile(uid, {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(countryCode !== undefined ? { countryCode } : {}),
      ...(preferredRegion !== undefined ? { preferredRegion } : {}),
      ...(saveHistory !== undefined ? { saveHistory } : {}),
    });

    res.json({ profile: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update settings.' });
  }
});

// 1. Message Scam Analyzer
app.post('/api/investigate/message', requireAuth, scanLimiter, async (req: AuthRequest, res) => {
  try {
    const rawContent = sanitizeText(req.body?.content, 6000);
    const channel = sanitizeText(req.body?.channel || 'SMS / WhatsApp', 40) || 'SMS / WhatsApp';
    if (!rawContent || rawContent.length < 8) {
      return res.status(400).json({ error: 'Please paste at least 8 characters of message text to analyze.' });
    }

    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const safeForModel = redactSensitiveCredentials(rawContent);
    const report = await analyzeMessageWithAi(safeForModel, channel);
    const savedReport = await persistInvestigationIfAllowed(user, report);

    res.json({ report: savedReport, persisted: user.saveHistory });
  } catch (error) {
    console.error('Message investigation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to complete message analysis.',
    });
  }
});

// 2. URL & Website Scanner
app.post('/api/investigate/url', requireAuth, scanLimiter, async (req: AuthRequest, res) => {
  try {
    const rawUrl = sanitizeText(req.body?.url, 2048);
    if (!rawUrl) {
      return res.status(400).json({ error: 'Please enter a website URL to inspect.' });
    }

    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const urlContext = await inspectUrlSafely(rawUrl);
    const report = await analyzeUrlWithAi(urlContext);
    const savedReport = await persistInvestigationIfAllowed(user, report);

    res.json({ report: savedReport, persisted: user.saveHistory });
  } catch (error) {
    console.error('URL investigation error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to inspect URL.';
    const status = msg.includes('Invalid URL') || msg.includes('blocked') || msg.includes('Private') ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

// 3. Phone & Email Investigator
app.post('/api/investigate/contact', requireAuth, scanLimiter, async (req: AuthRequest, res) => {
  try {
    const kind = req.body?.kind === 'email' ? 'email' : 'phone';
    const value = sanitizeText(req.body?.value, 254);
    const notes = sanitizeText(req.body?.notes || '', 1000);

    if (!value) {
      return res.status(400).json({ error: `Please enter a ${kind === 'email' ? 'valid email address' : 'phone number'}.` });
    }

    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const context =
      kind === 'email' ? await inspectEmailSafely(value) : await inspectPhoneSafely(value);
    const report = await analyzeContactWithAi(context, redactSensitiveCredentials(notes));
    const savedReport = await persistInvestigationIfAllowed(user, report);

    res.json({ report: savedReport, persisted: user.saveHistory });
  } catch (error) {
    console.error('Contact investigation error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to investigate contact identifier.';
    const status = msg.includes('Enter a valid') ? 400 : 500;
    res.status(status).json({ error: msg });
  }
});

// 4. Screenshot & File OCR Investigator
app.post(
  '/api/investigate/screenshot',
  requireAuth,
  scanLimiter,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Invalid file upload.' });
      }
      next();
    });
  },
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please select an image or PDF screenshot to analyze.' });
      }
      const userContext = sanitizeText(req.body?.context || '', 1000);
      const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');

      const report = await analyzeScreenshotWithAi(
        req.file.buffer,
        req.file.mimetype,
        sanitizeText(req.file.originalname, 120) || 'uploaded_evidence',
        redactSensitiveCredentials(userContext)
      );
      const savedReport = await persistInvestigationIfAllowed(user, report);

      res.json({ report: savedReport, persisted: user.saveHistory });
    } catch (error) {
      console.error('Screenshot investigation error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to extract text and analyze screenshot.',
      });
    }
  }
);

// 5. Investigation History CRUD
app.get('/api/investigations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const items = await listUserInvestigations(user.id, 60);
    res.json({ investigations: items });
  } catch (error) {
    console.error('List investigations error:', error);
    res.status(500).json({ error: 'Failed to load investigation history.' });
  }
});

app.get('/api/investigations/:code', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const item = await getUserInvestigationByCode(user.id, sanitizeText(String(req.params.code), 40));
    if (!item) {
      return res.status(404).json({ error: 'Investigation not found.' });
    }
    res.json({ investigation: item });
  } catch (error) {
    console.error('Get investigation error:', error);
    res.status(500).json({ error: 'Failed to retrieve investigation.' });
  }
});

app.delete('/api/investigations/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid investigation ID.' });
    }
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const deleted = await deleteUserInvestigation(user.id, id);
    if (!deleted) {
      return res.status(404).json({ error: 'Investigation record not found.' });
    }
    res.json({ deleted: true, id });
  } catch (error) {
    console.error('Delete investigation error:', error);
    res.status(500).json({ error: 'Failed to delete investigation.' });
  }
});

app.delete('/api/investigations', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    await clearUserInvestigations(user.id);
    res.json({ cleared: true });
  } catch (error) {
    console.error('Clear investigations error:', error);
    res.status(500).json({ error: 'Failed to clear investigation history.' });
  }
});

// 6. AI Investigation Assistant Chat
app.get('/api/chat', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const messages = await listUserChatMessages(user.id, 40);
    res.json({ messages });
  } catch (error) {
    console.error('Load chat error:', error);
    res.status(500).json({ error: 'Failed to load assistant chat.' });
  }
});

app.post('/api/chat', requireAuth, scanLimiter, async (req: AuthRequest, res) => {
  try {
    const message = sanitizeText(req.body?.message, 2500);
    if (!message) {
      return res.status(400).json({ error: 'Please enter a question for the AI Investigation Assistant.' });
    }

    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    const safeUserMessage = redactSensitiveCredentials(message);

    const priorMessages = await listUserChatMessages(user.id, 20);
    const reply = await generateAssistantResponse(
      priorMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      safeUserMessage
    );

    if (user.saveHistory) {
      await addChatMessage(user.id, 'user', safeUserMessage);
      await addChatMessage(user.id, 'assistant', reply);
    }

    const updatedMessages = user.saveHistory
      ? await listUserChatMessages(user.id, 40)
      : [
          ...priorMessages,
          { role: 'user', content: safeUserMessage },
          { role: 'assistant', content: reply },
        ];

    res.json({ reply, messages: updatedMessages });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Assistant could not respond right now.',
    });
  }
});

app.delete('/api/chat', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await getOrCreateUser(req.user!.uid, req.user!.email || 'user@investigator.local');
    await clearUserChatMessages(user.id);
    res.json({ cleared: true });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear assistant conversation.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Cyber Scam Investigator running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
