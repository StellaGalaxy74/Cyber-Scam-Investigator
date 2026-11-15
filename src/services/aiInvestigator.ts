import { GoogleGenAI, Type } from '@google/genai';
import type {
  ChatMessageItem,
  ConfidenceLevel,
  InvestigationReport,
  TechnicalFindingItem,
  ThreatClassification,
} from '../types/investigation.ts';
import type { ContactAnalysisContext } from './contactAnalyzer.ts';
import type { UrlAnalysisContext } from './urlAnalyzer.ts';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const REPORT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    threatCategory: {
      type: Type.STRING,
      description:
        'Specific scam or safety category, e.g., UPI/Banking Phishing, Fake Job Offer, Digital Arrest Impersonation, Investment/Crypto Scam, Lottery/Prize Fraud, Legitimate / Low-Risk Communication, Unverified Contact.',
    },
    riskScore: {
      type: Type.INTEGER,
      description: 'Integer risk score from 0 to 100.',
    },
    threatClassification: {
      type: Type.STRING,
      description: 'Must be exactly one of: LOW, MEDIUM, HIGH, CRITICAL.',
    },
    scamProbability: {
      type: Type.INTEGER,
      description: 'Integer percentage likelihood (0-100) that this represents a scam or malicious attempt.',
    },
    confidenceLevel: {
      type: Type.STRING,
      description: 'Assessment confidence based on available evidence. Must be one of: LOW, MEDIUM, HIGH.',
    },
    summary: {
      type: Type.STRING,
      description: 'Clear 2-3 sentence plain-language summary of the forensic assessment.',
    },
    suspiciousKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exact suspicious phrases, urgency triggers, or deceptive terms observed.',
    },
    psychologicalTechniques: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Manipulation tactics (e.g., Artificial Urgency, Authority Impersonation, Fear/Threat, Greed/Windfall, Scarcity).',
    },
    financialWarningSigns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Payment/financial red flags (e.g., UPI collect request, advance fee, gift cards, APK sideloading, credential harvesting).',
    },
    redFlags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Concrete behavioral or technical red flags.',
    },
    supportingEvidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific observations from the submitted content supporting the assessment.',
    },
    recommendedActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Actionable protective steps for the user.',
    },
    safetyWarnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Important ethical & safety disclaimers (e.g., AI prediction is advisory, never share OTP/PIN/CVV, report financial loss immediately to bank and 1930).',
    },
    ocrExtractedText: {
      type: Type.STRING,
      description: 'For uploaded images/documents only: verbatim extracted text observed in the file.',
    },
  },
  required: [
    'threatCategory',
    'riskScore',
    'threatClassification',
    'scamProbability',
    'confidenceLevel',
    'summary',
    'suspiciousKeywords',
    'psychologicalTechniques',
    'financialWarningSigns',
    'redFlags',
    'supportingEvidence',
    'recommendedActions',
    'safetyWarnings',
  ],
};

interface AiStructuredReport {
  threatCategory: string;
  riskScore: number;
  threatClassification: string;
  scamProbability: number;
  confidenceLevel: string;
  summary: string;
  suspiciousKeywords: string[];
  psychologicalTechniques: string[];
  financialWarningSigns: string[];
  redFlags: string[];
  supportingEvidence: string[];
  recommendedActions: string[];
  safetyWarnings: string[];
  ocrExtractedText?: string;
}

function normalizeClassification(val: string, score: number): ThreatClassification {
  const upper = (val || '').toUpperCase();
  if (upper === 'LOW' || upper === 'MEDIUM' || upper === 'HIGH' || upper === 'CRITICAL') {
    return upper;
  }
  if (score >= 80) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function normalizeConfidence(val: string): ConfidenceLevel {
  const upper = (val || '').toUpperCase();
  if (upper === 'LOW' || upper === 'MEDIUM' || upper === 'HIGH') return upper;
  return 'MEDIUM';
}

function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const ETHICAL_SYSTEM_INSTRUCTION = `You are a senior digital forensics investigator and cybersecurity analyst for Smart Cyber Scam Investigator.
Follow these strict evidentiary rules:
1. Never fabricate threat intelligence, database hits, or external blacklist results.
2. Treat your analysis as a probabilistic AI forensic assessment, never definitive legal proof or accusation against a private individual.
3. For phone numbers or emails provided WITHOUT suspicious message context, never label them as fraudulent unless verified technical anomalies (like disposable mail domains or invalid structure) exist; keep riskScore conservative and explain what additional context is needed.
4. Explain technical cybersecurity concepts in clear, everyday language.
5. Always include practical protective actions and remind users never to share OTPs, PINs, CVVs, or passwords, and to call 1930 / cybercrime.gov.in (India) or their bank immediately if money has been lost.`;

export function generateInvestigationCode(): string {
  const year = new Date().getFullYear();
  const hex = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `INV-${year}-${hex}`;
}

export async function analyzeMessageWithAi(
  content: string,
  channel: string
): Promise<InvestigationReport> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `Analyze the following suspicious ${channel} message for cyber scam, phishing, social engineering, and financial fraud indicators.\n\nMessage Content:\n"""\n${content}\n"""`,
    config: {
      systemInstruction: ETHICAL_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: REPORT_RESPONSE_SCHEMA,
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as AiStructuredReport;
  const riskScore = clampScore(parsed.riskScore);
  const scamProbability = clampScore(parsed.scamProbability);
  const threatClassification = normalizeClassification(parsed.threatClassification, riskScore);
  const confidenceLevel = normalizeConfidence(parsed.confidenceLevel);

  const technicalFindings: TechnicalFindingItem[] = [
    { label: 'Channel Submitted', value: channel, verified: true, status: 'info' },
    { label: 'Payload Length', value: `${content.length} characters`, verified: true, status: 'info' },
    {
      label: 'Embedded Links Detected',
      value: (content.match(/https?:\/\/[^\s]+/gi) || []).length > 0
        ? `${(content.match(/https?:\/\/[^\s]+/gi) || []).length} URL(s) observed`
        : 'None',
      verified: true,
      status: (content.match(/https?:\/\/[^\s]+/gi) || []).length > 0 ? 'caution' : 'safe',
    },
  ];

  return {
    investigationCode: generateInvestigationCode(),
    createdAt: new Date().toISOString(),
    type: 'message',
    submittedContent: content,
    threatCategory: parsed.threatCategory || 'General Message Assessment',
    riskScore,
    threatClassification,
    scamProbability,
    confidenceLevel,
    intelligenceStatus: 'AI NLP & Behavioral Forensics (No External Reputation Feed Queried)',
    summary: parsed.summary,
    suspiciousKeywords: parsed.suspiciousKeywords || [],
    psychologicalTechniques: parsed.psychologicalTechniques || [],
    financialWarningSigns: parsed.financialWarningSigns || [],
    redFlags: parsed.redFlags || [],
    supportingEvidence: parsed.supportingEvidence || [],
    recommendedActions: parsed.recommendedActions || [],
    safetyWarnings: parsed.safetyWarnings || [],
    technicalFindings,
    evidenceSplit: {
      verifiedFacts: technicalFindings.map((f) => `${f.label}: ${f.value}`),
      suspiciousIndicators: [...(parsed.redFlags || []), ...(parsed.financialWarningSigns || [])].slice(0, 8),
      aiAssessments: [
        parsed.summary,
        `Estimated scam likelihood: ${scamProbability}% (Confidence: ${confidenceLevel}).`,
      ],
    },
  };
}

export async function analyzeUrlWithAi(context: UrlAnalysisContext): Promise<InvestigationReport> {
  const ai = getAiClient();
  const prompt = `Analyze this URL using ONLY the verified technical facts and lexical observations below (do NOT claim you visited or fetched the webpage HTML, and do NOT invent external blacklist hits).\n\nSubmitted URL: ${context.normalizedUrl}\nHostname: ${context.hostname}\nVerified Technical Facts:\n${context.verifiedFacts.map((f) => `- ${f}`).join('\n')}\nLexical / Spoofing Signals:\n${context.lexicalSignals.length ? context.lexicalSignals.map((s) => `- ${s}`).join('\n') : '- None detected locally'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction: ETHICAL_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: REPORT_RESPONSE_SCHEMA,
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as AiStructuredReport;
  const riskScore = clampScore(parsed.riskScore);
  const scamProbability = clampScore(parsed.scamProbability);

  return {
    investigationCode: generateInvestigationCode(),
    createdAt: new Date().toISOString(),
    type: 'url',
    submittedContent: context.normalizedUrl,
    threatCategory: parsed.threatCategory || 'URL & Domain Assessment',
    riskScore,
    threatClassification: normalizeClassification(parsed.threatClassification, riskScore),
    scamProbability,
    confidenceLevel: normalizeConfidence(parsed.confidenceLevel),
    intelligenceStatus: context.intelligenceStatus,
    summary: parsed.summary,
    suspiciousKeywords: parsed.suspiciousKeywords || [],
    psychologicalTechniques: parsed.psychologicalTechniques || [],
    financialWarningSigns: parsed.financialWarningSigns || [],
    redFlags: parsed.redFlags || [],
    supportingEvidence: parsed.supportingEvidence || [],
    recommendedActions: parsed.recommendedActions || [],
    safetyWarnings: parsed.safetyWarnings || [],
    technicalFindings: context.technicalFindings,
    evidenceSplit: {
      verifiedFacts: context.verifiedFacts,
      suspiciousIndicators: [...context.lexicalSignals, ...(parsed.redFlags || [])].slice(0, 8),
      aiAssessments: [
        parsed.summary,
        `AI phishing/scam assessment: ${scamProbability}% likelihood (Confidence: ${normalizeConfidence(parsed.confidenceLevel)}).`,
      ],
    },
  };
}

export async function analyzeContactWithAi(
  context: ContactAnalysisContext,
  additionalNotes?: string
): Promise<InvestigationReport> {
  const ai = getAiClient();
  const prompt = `Analyze this ${context.kind === 'phone' ? 'phone number' : 'email address'} using ONLY the verified technical facts below and any user-supplied context. Remember: never accuse a phone number or email of fraud without concrete supporting evidence.\n\nTarget (${context.kind}): ${context.normalizedValue}\nUser Context: ${additionalNotes || 'None provided'}\nVerified Technical Facts:\n${context.verifiedFacts.map((f) => `- ${f}`).join('\n')}\nStructural Signals:\n${context.structuralSignals.length ? context.structuralSignals.map((s) => `- ${s}`).join('\n') : '- No structural anomalies detected'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction: ETHICAL_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: REPORT_RESPONSE_SCHEMA,
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as AiStructuredReport;
  const riskScore = clampScore(parsed.riskScore);
  const scamProbability = clampScore(parsed.scamProbability);

  return {
    investigationCode: generateInvestigationCode(),
    createdAt: new Date().toISOString(),
    type: 'email_phone',
    submittedContent: additionalNotes
      ? `${context.normalizedValue} (${additionalNotes.slice(0, 120)})`
      : context.normalizedValue,
    threatCategory: parsed.threatCategory || 'Contact Identifier Assessment',
    riskScore,
    threatClassification: normalizeClassification(parsed.threatClassification, riskScore),
    scamProbability,
    confidenceLevel: normalizeConfidence(parsed.confidenceLevel),
    intelligenceStatus: context.intelligenceStatus,
    summary: parsed.summary,
    suspiciousKeywords: parsed.suspiciousKeywords || [],
    psychologicalTechniques: parsed.psychologicalTechniques || [],
    financialWarningSigns: parsed.financialWarningSigns || [],
    redFlags: parsed.redFlags || [],
    supportingEvidence: parsed.supportingEvidence || [],
    recommendedActions: parsed.recommendedActions || [],
    safetyWarnings: parsed.safetyWarnings || [],
    technicalFindings: context.technicalFindings,
    evidenceSplit: {
      verifiedFacts: context.verifiedFacts,
      suspiciousIndicators: [...context.structuralSignals, ...(parsed.redFlags || [])].slice(0, 8),
      aiAssessments: [
        parsed.summary,
        `Assessment confidence: ${normalizeConfidence(parsed.confidenceLevel)}.`,
      ],
    },
  };
}

export async function analyzeScreenshotWithAi(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  userContext?: string
): Promise<InvestigationReport> {
  const ai = getAiClient();

  let contents: unknown;
  if (mimeType === 'text/plain') {
    const textBody = fileBuffer.toString('utf8').slice(0, 12000);
    contents = `Extract key text and analyze this uploaded text file (${fileName}) for cyber scams, phishing, fake invoices, or payment fraud.\nUser Context: ${userContext || 'None'}\n\nFile Text:\n"""\n${textBody}\n"""`;
  } else {
    const base64Data = fileBuffer.toString('base64');
    contents = {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        {
          text: `Perform complete OCR text extraction (populate ocrExtractedText verbatim with visible text) and analyze this uploaded ${mimeType} evidence (${fileName}) for cyber scam indicators, fake payment receipts, phishing emails, fraudulent WhatsApp/SMS screenshots, or impersonation.\nUser Context: ${userContext || 'None provided'}`,
        },
      ],
    };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: contents as Parameters<typeof ai.models.generateContent>[0]['contents'],
    config: {
      systemInstruction: ETHICAL_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: REPORT_RESPONSE_SCHEMA,
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as AiStructuredReport;
  const riskScore = clampScore(parsed.riskScore);
  const scamProbability = clampScore(parsed.scamProbability);
  const extractedText = parsed.ocrExtractedText || '';

  const technicalFindings: TechnicalFindingItem[] = [
    { label: 'Uploaded Evidence', value: fileName, verified: true, status: 'info' },
    { label: 'File Format', value: mimeType, verified: true, status: 'info' },
    { label: 'File Size', value: `${(fileBuffer.length / 1024).toFixed(1)} KB`, verified: true, status: 'info' },
    {
      label: 'OCR Extraction',
      value: extractedText ? `${extractedText.length} characters extracted` : 'Visual layout analyzed',
      verified: true,
      status: 'safe',
    },
  ];

  return {
    investigationCode: generateInvestigationCode(),
    createdAt: new Date().toISOString(),
    type: 'screenshot',
    submittedContent: `File: ${fileName}${userContext ? ` — ${userContext.slice(0, 120)}` : ''}`,
    threatCategory: parsed.threatCategory || 'Visual Evidence Forensics',
    riskScore,
    threatClassification: normalizeClassification(parsed.threatClassification, riskScore),
    scamProbability,
    confidenceLevel: normalizeConfidence(parsed.confidenceLevel),
    intelligenceStatus: 'Multimodal OCR Extraction + AI Visual & Behavioral Forensics',
    summary: parsed.summary,
    suspiciousKeywords: parsed.suspiciousKeywords || [],
    psychologicalTechniques: parsed.psychologicalTechniques || [],
    financialWarningSigns: parsed.financialWarningSigns || [],
    redFlags: parsed.redFlags || [],
    supportingEvidence: parsed.supportingEvidence || [],
    recommendedActions: parsed.recommendedActions || [],
    safetyWarnings: parsed.safetyWarnings || [],
    technicalFindings,
    ocrExtractedText: extractedText,
    evidenceSplit: {
      verifiedFacts: [
        `File inspected in isolated memory buffer without execution (${fileName}, ${mimeType}).`,
        extractedText ? `OCR extracted ${extractedText.length} characters of visible text.` : 'Image visual cues inspected.',
      ],
      suspiciousIndicators: [...(parsed.redFlags || []), ...(parsed.financialWarningSigns || [])].slice(0, 8),
      aiAssessments: [
        parsed.summary,
        `Estimated scam likelihood: ${scamProbability}% (Confidence: ${normalizeConfidence(parsed.confidenceLevel)}).`,
      ],
    },
  };
}

export async function generateAssistantResponse(
  history: ChatMessageItem[],
  userMessage: string
): Promise<string> {
  const ai = getAiClient();
  const formattedHistory = history.slice(-12).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chat = ai.chats.create({
    model: 'gemini-4-hydrogen',
    history: formattedHistory,
    config: {
      systemInstruction: `You are the AI Investigation Assistant inside Smart Cyber Scam Investigator.
Your role:
- Help ordinary people evaluate suspicious messages, UPI/bank requests, emails, job offers, and links.
- Explain cybersecurity terms (like phishing, typosquatting, SIM swap, remote access APK, UPI collect request) in plain, calm language.
- Provide immediate step-by-step protective actions.
- If the user mentions financial loss or unauthorized transactions in India, ALWAYS highlight:
  1. Immediately call their bank/payment provider to freeze the account or card.
  2. Call the India National Cyber Crime Helpline 1930 immediately (Golden Hour response).
  3. File a formal report at https://cybercrime.gov.in/ and preserve UTR/transaction IDs, uncropped screenshots, and sender details.
- Never ask the user for their OTP, PIN, CVV, or banking password.
- Format responses cleanly with short paragraphs and numbered action steps.`,
    },
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text || 'I could not generate a response right now. Please try again.';
}
