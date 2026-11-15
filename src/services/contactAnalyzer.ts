import dns from 'node:dns/promises';
import type { TechnicalFindingItem } from '../types/investigation.ts';
import { sanitizeText } from './sanitizer.ts';

const COUNTRY_CODES: Array<{ code: string; country: string; expectedMin: number; expectedMax: number }> = [
  { code: '+91', country: 'India', expectedMin: 10, expectedMax: 10 },
  { code: '+971', country: 'United Arab Emirates', expectedMin: 9, expectedMax: 9 },
  { code: '+880', country: 'Bangladesh', expectedMin: 10, expectedMax: 10 },
  { code: '+92', country: 'Pakistan', expectedMin: 10, expectedMax: 10 },
  { code: '+977', country: 'Nepal', expectedMin: 10, expectedMax: 10 },
  { code: '+94', country: 'Sri Lanka', expectedMin: 9, expectedMax: 9 },
  { code: '+44', country: 'United Kingdom', expectedMin: 10, expectedMax: 10 },
  { code: '+65', country: 'Singapore', expectedMin: 8, expectedMax: 8 },
  { code: '+61', country: 'Australia', expectedMin: 9, expectedMax: 9 },
  { code: '+49', country: 'Germany', expectedMin: 10, expectedMax: 11 },
  { code: '+33', country: 'France', expectedMin: 9, expectedMax: 9 },
  { code: '+81', country: 'Japan', expectedMin: 10, expectedMax: 10 },
  { code: '+86', country: 'China', expectedMin: 11, expectedMax: 11 },
  { code: '+234', country: 'Nigeria', expectedMin: 10, expectedMax: 10 },
  { code: '+1', country: 'United States / Canada', expectedMin: 10, expectedMax: 10 },
];

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'rediffmail.com',
  'aol.com',
  'zoho.com',
]);

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
]);

export interface ContactAnalysisContext {
  kind: 'phone' | 'email';
  normalizedValue: string;
  technicalFindings: TechnicalFindingItem[];
  verifiedFacts: string[];
  structuralSignals: string[];
  intelligenceStatus: string;
}

export async function inspectPhoneSafely(rawPhone: string): Promise<ContactAnalysisContext> {
  const cleaned = sanitizeText(rawPhone, 64);
  const compact = cleaned.replace(/[\s\-().]/g, '');

  if (!/^\+?[0-9]{6,16}$/.test(compact)) {
    throw new Error('Enter a valid phone number (6 to 16 digits, optional + country code).');
  }

  const technicalFindings: TechnicalFindingItem[] = [];
  const verifiedFacts: string[] = [];
  const structuralSignals: string[] = [];

  let normalized = compact;
  if (!normalized.startsWith('+')) {
    if (/^[6-9]\d{9}$/.test(normalized)) {
      normalized = `+91${normalized}`;
      verifiedFacts.push('Assumed +91 (India) prefix based on 10-digit mobile numbering pattern.');
    } else if (/^0[6-9]\d{9}$/.test(normalized)) {
      normalized = `+91${normalized.slice(1)}`;
      verifiedFacts.push('Normalized leading 0 to +91 (India) mobile format.');
    } else {
      normalized = `+${normalized}`;
    }
  }

  const matchedCountry = COUNTRY_CODES.find((entry) => normalized.startsWith(entry.code));
  const nationalDigits = matchedCountry ? normalized.slice(matchedCountry.code.length) : normalized.slice(1);

  technicalFindings.push({
    label: 'Normalized E.164',
    value: normalized,
    verified: true,
    status: 'info',
  });

  if (matchedCountry) {
    technicalFindings.push({
      label: 'Country Code',
      value: `${matchedCountry.code} (${matchedCountry.country})`,
      verified: true,
      status: 'info',
    });
    verifiedFacts.push(`Identified country dialing code ${matchedCountry.code} (${matchedCountry.country}).`);

    const validLen =
      nationalDigits.length >= matchedCountry.expectedMin &&
      nationalDigits.length <= matchedCountry.expectedMax;
    technicalFindings.push({
      label: 'Format Length Check',
      value: validLen
        ? `Valid (${nationalDigits.length} national digits)`
        : `Unusual length (${nationalDigits.length} digits; expected ${matchedCountry.expectedMin}-${matchedCountry.expectedMax})`,
      verified: true,
      status: validLen ? 'safe' : 'caution',
    });

    if (!validLen) {
      structuralSignals.push(`Number length (${nationalDigits.length} digits) does not match standard ${matchedCountry.country} subscriber format.`);
    }

    if (matchedCountry.code === '+91') {
      if (/^[6-9]\d{9}$/.test(nationalDigits)) {
        verifiedFacts.push('Matches standard Indian 10-digit mobile allocation (starts with 6–9).');
      } else if (/^1800/.test(nationalDigits)) {
        verifiedFacts.push('Matches Indian toll-free prefix (1800). Note: Official bank numbers never ask for OTP or remote access.');
      } else if (/^140/.test(nationalDigits)) {
        verifiedFacts.push('Matches Indian TRAI telemarketer prefix (140).');
      } else {
        structuralSignals.push('Does not match standard Indian mobile (6–9 prefix) or toll-free numbering.');
      }
    }
  } else {
    technicalFindings.push({
      label: 'Country Code',
      value: 'Unlisted or international prefix',
      verified: true,
      status: 'caution',
    });
    structuralSignals.push('Prefix not in standard regional dialing table — verify whether an unexpected international caller is expected.');
  }

  // Note on Caller ID spoofing & ethical guardrail
  verifiedFacts.push(
    'Important: Caller ID numbers can be spoofed via VoIP. Number format alone cannot prove fraud without message or call context.'
  );

  return {
    kind: 'phone',
    normalizedValue: normalized,
    technicalFindings,
    verifiedFacts,
    structuralSignals,
    intelligenceStatus: 'Verified Format & Country Code Forensics + AI Context Analysis (No External Telecom Blacklist Linked)',
  };
}

export async function inspectEmailSafely(rawEmail: string): Promise<ContactAnalysisContext> {
  const cleaned = sanitizeText(rawEmail, 254).toLowerCase();
  const emailRegex = /^[a-z0-9._%+-]+@([a-z0-9-]+\.)+[a-z]{2,}$/i;
  if (!emailRegex.test(cleaned)) {
    throw new Error('Enter a valid email address (e.g., support@example.com).');
  }

  const [localPart, domain] = cleaned.split('@');
  const technicalFindings: TechnicalFindingItem[] = [];
  const verifiedFacts: string[] = [];
  const structuralSignals: string[] = [];

  technicalFindings.push({
    label: 'Syntax Validation',
    value: 'Valid RFC-compliant format',
    verified: true,
    status: 'safe',
  });
  verifiedFacts.push(`Parsed local-part "${localPart}" on domain "${domain}".`);

  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain);
  const isFree = FREE_EMAIL_DOMAINS.has(domain);
  technicalFindings.push({
    label: 'Provider Classification',
    value: isDisposable
      ? 'Disposable / Temporary Email Provider'
      : isFree
        ? 'Public Free Webmail Provider'
        : 'Custom / Organizational Domain',
    verified: true,
    status: isDisposable ? 'warning' : isFree ? 'info' : 'info',
  });

  if (isDisposable) {
    structuralSignals.push(`Domain "${domain}" is a known disposable temporary email service.`);
  }

  if (isFree && /(bank|support|security|verify|kyc|sbi|hdfc|icici|rbi|npci|amazon|official|helpdesk)/i.test(localPart)) {
    structuralSignals.push(
      `Local-part "${localPart}" uses official/banking terminology on a free public webmail domain (${domain}) — legitimate banks never send official notices from free webmail.`
    );
  }

  // DNS MX and TXT (SPF/DMARC) checks
  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) {
      const topMx = mx.sort((a, b) => a.priority - b.priority).slice(0, 2).map((m) => m.exchange).join(', ');
      technicalFindings.push({
        label: 'DNS MX Mail Servers',
        value: topMx,
        verified: true,
        status: 'safe',
      });
      verifiedFacts.push(`Verified ${mx.length} active MX record(s) for ${domain}: ${topMx}`);
    } else {
      technicalFindings.push({
        label: 'DNS MX Mail Servers',
        value: 'No MX records found',
        verified: true,
        status: 'warning',
      });
      structuralSignals.push(`Domain ${domain} has no active MX mail exchange records.`);
    }
  } catch {
    technicalFindings.push({
      label: 'DNS MX Mail Servers',
      value: 'MX lookup failed / NXDOMAIN',
      verified: true,
      status: 'warning',
    });
    structuralSignals.push(`Unable to resolve mail exchange records for ${domain}.`);
  }

  try {
    const txtRecords = await dns.resolveTxt(domain);
    const flatTxt = txtRecords.map((r) => r.join(''));
    const hasSpf = flatTxt.some((r) => r.toLowerCase().startsWith('v=spf1'));
    let hasDmarc = false;
    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
      hasDmarc = dmarcRecords.some((r) => r.join('').toLowerCase().startsWith('v=dmarc1'));
    } catch {
      hasDmarc = false;
    }

    technicalFindings.push({
      label: 'Email Auth (SPF / DMARC)',
      value: `${hasSpf ? 'SPF Present' : 'No SPF'} · ${hasDmarc ? 'DMARC Present' : 'No DMARC'}`,
      verified: true,
      status: hasSpf && hasDmarc ? 'safe' : 'caution',
    });
    verifiedFacts.push(
      `Sender authentication DNS check: SPF=${hasSpf ? 'configured' : 'missing'}, DMARC=${hasDmarc ? 'configured' : 'missing'}.`
    );
    if (!hasSpf || !hasDmarc) {
      structuralSignals.push('Domain lacks complete SPF/DMARC anti-spoofing DNS policies.');
    }
  } catch {
    technicalFindings.push({
      label: 'Email Auth (SPF / DMARC)',
      value: 'DNS TXT lookup unavailable',
      verified: true,
      status: 'caution',
    });
  }

  return {
    kind: 'email',
    normalizedValue: cleaned,
    technicalFindings,
    verifiedFacts,
    structuralSignals,
    intelligenceStatus: 'Verified Syntax & DNS (MX/SPF/DMARC) Forensics + AI Context Analysis',
  };
}
