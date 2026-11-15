import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import type { TechnicalFindingItem } from '../types/investigation.ts';
import { isPrivateOrReservedIp, validateExternalUrl } from './sanitizer.ts';

const BRAND_TARGETS = [
  'sbi',
  'onlinesbi',
  'hdfcbank',
  'icicibank',
  'axisbank',
  'kotak',
  'paytm',
  'phonepe',
  'npci',
  'rbi',
  'incometax',
  'uidai',
  'epfindia',
  'indiapost',
  'amazon',
  'flipkart',
  'google',
  'microsoft',
  'apple',
  'paypal',
  'whatsapp',
  'instagram',
];

const URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rb.gy',
  'cutt.ly',
  'shorturl.at',
  'tiny.cc',
]);

const SUSPICIOUS_TLDS = new Set([
  '.xyz',
  '.top',
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.gq',
  '.click',
  '.zip',
  '.mov',
  '.work',
  '.buzz',
  '.cfd',
  '.sbs',
]);

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms)),
  ]);
}

async function inspectTlsCertificate(
  hostname: string,
  resolvedIp: string,
  port: number
): Promise<{
  checked: boolean;
  authorized?: boolean;
  authorizationError?: string;
  issuer?: string;
  subject?: string;
  validTo?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: resolvedIp,
        port,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 3500,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const authorized = socket.authorized;
          const authError = socket.authorizationError ? String(socket.authorizationError) : undefined;
          socket.end();
          const toSingleString = (val: string | string[] | undefined): string | undefined =>
            Array.isArray(val) ? val[0] : val;
          resolve({
            checked: true,
            authorized,
            authorizationError: authError,
            issuer: toSingleString(cert?.issuer?.O) || toSingleString(cert?.issuer?.CN) || 'Unknown issuer',
            subject: toSingleString(cert?.subject?.CN) || hostname,
            validTo: cert?.valid_to || undefined,
          });
        } catch {
          socket.destroy();
          resolve({ checked: false, error: 'Certificate metadata unreadable' });
        }
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ checked: false, error: 'TLS handshake timed out' });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ checked: false, error: err.message });
    });
  });
}

async function queryExternalThreatFeeds(targetUrl: string): Promise<{
  feedsChecked: string[];
  findings: string[];
  externalConfigured: boolean;
}> {
  const feedsChecked: string[] = [];
  const findings: string[] = [];
  const gsbKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  const vtKey = process.env.VIRUSTOTAL_API_KEY;

  if (gsbKey) {
    feedsChecked.push('Google Safe Browsing v4');
    try {
      const resp = await withTimeout(
        fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(gsbKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: { clientId: 'smart-cyber-scam-investigator', clientVersion: '1.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: targetUrl }],
            },
          }),
        }),
        4000
      );
      if (resp.ok) {
        const data = (await resp.json()) as { matches?: Array<{ threatType?: string }> };
        if (data.matches && data.matches.length > 0) {
          findings.push(`Google Safe Browsing flagged: ${data.matches.map((m) => m.threatType).join(', ')}`);
        } else {
          findings.push('Google Safe Browsing returned no active blocklist matches at scan time.');
        }
      }
    } catch {
      findings.push('Google Safe Browsing lookup failed or timed out.');
    }
  }

  if (vtKey) {
    feedsChecked.push('VirusTotal URL API v3');
    try {
      const urlId = Buffer.from(targetUrl).toString('base64url');
      const resp = await withTimeout(
        fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
          headers: { 'x-apikey': vtKey },
        }),
        4000
      );
      if (resp.ok) {
        const data = (await resp.json()) as {
          data?: { attributes?: { last_analysis_stats?: { malicious?: number; suspicious?: number } } };
        };
        const stats = data.data?.attributes?.last_analysis_stats;
        if (stats) {
          findings.push(
            `VirusTotal engine report: ${stats.malicious ?? 0} malicious, ${stats.suspicious ?? 0} suspicious detections.`
          );
        }
      } else if (resp.status === 404) {
        findings.push('VirusTotal has no prior cached report for this exact URL.');
      }
    } catch {
      findings.push('VirusTotal lookup failed or timed out.');
    }
  }

  return {
    feedsChecked,
    findings,
    externalConfigured: Boolean(gsbKey || vtKey),
  };
}

export interface UrlAnalysisContext {
  normalizedUrl: string;
  hostname: string;
  protocol: string;
  technicalFindings: TechnicalFindingItem[];
  verifiedFacts: string[];
  lexicalSignals: string[];
  intelligenceStatus: string;
}

export async function inspectUrlSafely(rawUrl: string): Promise<UrlAnalysisContext> {
  const validation = validateExternalUrl(rawUrl);
  if (!validation.valid || !validation.url) {
    throw new Error(validation.error || 'Invalid URL.');
  }

  const parsed = validation.url;
  const hostname = parsed.hostname.toLowerCase();
  const technicalFindings: TechnicalFindingItem[] = [];
  const verifiedFacts: string[] = [];
  const lexicalSignals: string[] = [];

  // 1. Protocol check
  const isHttps = parsed.protocol === 'https:';
  technicalFindings.push({
    label: 'Transport Protocol',
    value: isHttps ? 'HTTPS (Encrypted transport)' : 'HTTP (Unencrypted plaintext)',
    verified: true,
    status: isHttps ? 'safe' : 'warning',
  });
  verifiedFacts.push(`Protocol inspected: ${parsed.protocol.replace(':', '').toUpperCase()}`);

  // 2. Lexical / Spoofing checks
  if (parsed.username || parsed.password) {
    lexicalSignals.push('URL contains embedded userinfo (@) credentials/deception syntax.');
    technicalFindings.push({
      label: 'Userinfo Syntax',
      value: 'Contains @ credential/obfuscation segment',
      verified: true,
      status: 'warning',
    });
  }

  if (net.isIP(hostname)) {
    lexicalSignals.push('URL points directly to a raw IP address instead of a registered domain name.');
    technicalFindings.push({
      label: 'Host Format',
      value: `Raw IP address (${hostname})`,
      verified: true,
      status: 'warning',
    });
  }

  if (hostname.includes('xn--')) {
    lexicalSignals.push('Punycode (xn--) internationalized domain detected — potential homograph lookalike attack.');
    technicalFindings.push({
      label: 'IDN / Punycode',
      value: 'Punycode prefix detected (xn--)',
      verified: true,
      status: 'warning',
    });
  }

  if (URL_SHORTENERS.has(hostname)) {
    lexicalSignals.push(`Known URL shortener (${hostname}) masks the final destination.`);
    technicalFindings.push({
      label: 'Link Obfuscation',
      value: `Shortener domain (${hostname})`,
      verified: true,
      status: 'caution',
    });
  }

  const labels = hostname.split('.');
  if (labels.length >= 4) {
    lexicalSignals.push(`Deep subdomain nesting (${labels.length} levels) often used to mimic trusted brands.`);
    technicalFindings.push({
      label: 'Subdomain Depth',
      value: `${labels.length} domain levels`,
      verified: true,
      status: 'caution',
    });
  }

  const tld = labels.length > 1 ? `.${labels[labels.length - 1]}` : '';
  if (SUSPICIOUS_TLDS.has(tld)) {
    lexicalSignals.push(`High-abuse top-level domain (${tld}) frequently observed in disposable phishing kits.`);
    technicalFindings.push({
      label: 'Top-Level Domain',
      value: `${tld} (High-risk TLD pattern)`,
      verified: true,
      status: 'caution',
    });
  }

  // Lookalike check against core domain label
  const registrableLabel = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
  for (const brand of BRAND_TARGETS) {
    const dist = levenshtein(registrableLabel, brand);
    if (dist > 0 && dist <= 2 && registrableLabel.length >= 4) {
      lexicalSignals.push(`Domain "${registrableLabel}" closely resembles trusted brand "${brand}" (typosquatting distance ${dist}).`);
    } else if (hostname.includes(brand) && registrableLabel !== brand && !hostname.endsWith(`.${brand}.com`) && !hostname.endsWith(`.${brand}.co.in`) && !hostname.endsWith(`.${brand}.in`)) {
      lexicalSignals.push(`Trusted brand keyword "${brand}" appears in a third-party domain (${hostname}).`);
    }
  }

  // 3. Safe DNS resolution + SSRF re-verification
  let resolvedPublicIp: string | null = null;
  if (net.isIP(hostname)) {
    resolvedPublicIp = hostname;
  } else {
    try {
      const lookup = await withTimeout(dns.lookup(hostname, { all: true }), 3500);
      const ips = lookup.map((r) => r.address);
      const hasPrivate = ips.some((ip) => isPrivateOrReservedIp(ip));
      if (hasPrivate) {
        throw new Error('Domain resolved to a private or reserved IP address and was blocked for SSRF protection.');
      }
      resolvedPublicIp = ips[0] || null;
      technicalFindings.push({
        label: 'DNS A/AAAA Resolution',
        value: ips.slice(0, 2).join(', '),
        verified: true,
        status: 'info',
      });
      verifiedFacts.push(`DNS resolved ${hostname} to public IP ${ips.slice(0, 2).join(', ')}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unresolvable domain';
      if (message.includes('SSRF')) {
        throw err;
      }
      technicalFindings.push({
        label: 'DNS Resolution',
        value: 'Domain did not resolve (NXDOMAIN or timeout)',
        verified: true,
        status: 'caution',
      });
      verifiedFacts.push(`DNS lookup for ${hostname} returned no active address records.`);
    }
  }

  // 4. Passive TLS certificate inspection (if HTTPS & public IP resolved)
  if (isHttps && resolvedPublicIp) {
    const port = parsed.port ? Number(parsed.port) : 443;
    const tlsInfo = await inspectTlsCertificate(hostname, resolvedPublicIp, port);
    if (tlsInfo.checked) {
      technicalFindings.push({
        label: 'TLS Certificate Status',
        value: tlsInfo.authorized
          ? `Valid chain (Issuer: ${tlsInfo.issuer})`
          : `Untrusted / Invalid (${tlsInfo.authorizationError || 'Verification failed'})`,
        verified: true,
        status: tlsInfo.authorized ? 'safe' : 'warning',
      });
      if (tlsInfo.validTo) {
        technicalFindings.push({
          label: 'Certificate Expiry',
          value: tlsInfo.validTo,
          verified: true,
          status: 'info',
        });
      }
      verifiedFacts.push(
        tlsInfo.authorized
          ? `TLS certificate verified for ${tlsInfo.subject} issued by ${tlsInfo.issuer} (expires ${tlsInfo.validTo || 'N/A'}).`
          : `TLS certificate check failed trust validation: ${tlsInfo.authorizationError || 'Invalid chain'}.`
      );
    } else {
      technicalFindings.push({
        label: 'TLS Inspection',
        value: tlsInfo.error || 'Could not inspect certificate',
        verified: true,
        status: 'caution',
      });
    }
  }

  // 5. Optional External Threat Intel APIs
  const external = await queryExternalThreatFeeds(parsed.toString());
  if (external.externalConfigured) {
    for (const f of external.findings) {
      verifiedFacts.push(f);
    }
    technicalFindings.push({
      label: 'Threat Feeds Checked',
      value: external.feedsChecked.join(', '),
      verified: true,
      status: 'info',
    });
  } else {
    technicalFindings.push({
      label: 'External Threat Feeds',
      value: 'Not configured (Demonstration / Local Forensic Mode)',
      verified: true,
      status: 'info',
    });
  }

  const intelligenceStatus = external.externalConfigured
    ? `Verified DNS/TLS + ${external.feedsChecked.join(' & ')} + AI Analysis`
    : 'Verified Local DNS/TLS Forensics + AI Behavioral Analysis (External Feeds Unconfigured)';

  return {
    normalizedUrl: parsed.toString(),
    hostname,
    protocol: parsed.protocol,
    technicalFindings,
    verifiedFacts,
    lexicalSignals,
    intelligenceStatus,
  };
}
