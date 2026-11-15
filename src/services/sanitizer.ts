import net from 'node:net';

export function sanitizeText(input: string, maxLength = 8000): string {
  if (typeof input !== 'string') return '';
  // Strip null bytes and non-printable control chars except newline/tab
  const cleaned = input
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Redacts potential sensitive banking credentials (e.g., 12-16 digit card numbers,
 * explicit CVV/PIN/OTP sequences) before persisting user-submitted text in the database.
 */
export function redactSensitiveCredentials(text: string): string {
  let redacted = text;
  // Mask 13-19 digit sequences separated by spaces or dashes (potential card numbers)
  redacted = redacted.replace(
    /\b(?:\d[ -]*?){13,19}\b/g,
    '[REDACTED_CARD_SEQUENCE]'
  );
  // Mask explicit OTP / PIN / CVV disclosures like "OTP is 482910" or "CVV: 412"
  redacted = redacted.replace(
    /\b(otp|pin|cvv|mpin|upi\s*pin|password)\s*[:=\-]?\s*([0-9]{3,8})\b/gi,
    '$1: [REDACTED]'
  );
  return redacted;
}

export function isPrivateOrReservedIp(ip: string): boolean {
  if (!net.isIP(ip)) return true;

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 100 && b >= 64 && b <= 127) return true; // Carrier-grade NAT 100.64.0.0/10
    if (a === 127) return true; // Loopback 127.0.0.0/8
    if (a === 169 && b === 254) return true; // Link-local / Cloud metadata 169.254.0.0/16
    if (a === 172 && b >= 16 && b <= 31) return true; // Private 172.16.0.0/12
    if (a === 192 && b === 168) return true; // Private 192.168.0.0/16
    if (a === 192 && b === 0 && parts[2] === 0) return true; // IETF protocol
    if (a === 192 && b === 0 && parts[2] === 2) return true; // TEST-NET-1
    if (a === 198 && (b === 18 || b === 19)) return true; // Benchmarking
    if (a >= 224) return true; // Multicast & Reserved
    return false;
  }

  // IPv6 checks
  const normalized = ip.toLowerCase();
  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('::ffff:127.') ||
    normalized.startsWith('::ffff:10.') ||
    normalized.startsWith('::ffff:192.168.') ||
    normalized.startsWith('::ffff:169.254.')
  ) {
    return true;
  }
  return false;
}

export function validateExternalUrl(rawInput: string): { valid: boolean; url?: URL; error?: string } {
  const cleaned = sanitizeText(rawInput, 2048);
  if (!cleaned) {
    return { valid: false, error: 'Please provide a URL to scan.' };
  }

  const candidate = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { valid: false, error: 'Invalid URL format. Enter a valid http:// or https:// web address.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only http:// and https:// protocols are permitted for inspection.' };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata.google.internal'
  ) {
    return { valid: false, error: 'Internal, localhost, and private network addresses are blocked for security.' };
  }

  if (net.isIP(host) && isPrivateOrReservedIp(host)) {
    return { valid: false, error: 'Private or reserved IP ranges cannot be scanned.' };
  }

  return { valid: true, url: parsed };
}
