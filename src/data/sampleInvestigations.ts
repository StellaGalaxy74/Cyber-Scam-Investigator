import type { InvestigationReport } from '../types/investigation.ts';

export const SAMPLE_INVESTIGATIONS: InvestigationReport[] = [
  {
    investigationCode: 'INV-SAMPLE-9041',
    createdAt: '2026-11-14T14:22:00.000Z',
    type: 'message',
    submittedContent:
      'Dear Customer, your SBI YONO account will be blocked today at 6 PM due to pending PAN KYC update. Click immediately: http://sbi-kyc-update-alert.xyz/login to verify.',
    threatCategory: 'UPI & Banking KYC Phishing',
    riskScore: 94,
    threatClassification: 'CRITICAL',
    scamProbability: 96,
    confidenceLevel: 'HIGH',
    intelligenceStatus: 'Sample Case · AI NLP & Behavioral Forensics + Domain Heuristic Match',
    summary:
      'This message exhibits classic banking KYC phishing patterns targeting Indian bank customers. It combines artificial urgency ("blocked today at 6 PM") with an unverified lookalike domain (.xyz) designed to steal internet banking credentials and OTPs.',
    suspiciousKeywords: [
      'account will be blocked today',
      'pending PAN KYC update',
      'Click immediately',
      'sbi-kyc-update-alert.xyz',
    ],
    psychologicalTechniques: [
      'Artificial Urgency & Deadline Pressure',
      'Fear of Account Suspension',
      'Financial Institution Impersonation',
    ],
    financialWarningSigns: [
      'Requests urgent banking credential verification via an external web link',
      'Uses unencrypted HTTP protocol on a high-risk .xyz domain',
    ],
    redFlags: [
      'Official banks (such as SBI) do not send KYC update links over unverified .xyz domains',
      'Generic greeting ("Dear Customer") instead of verified account holder name',
      'Insecure http:// link mimicking an official banking portal',
    ],
    supportingEvidence: [
      'Brand keyword "sbi" embedded inside a third-party .xyz domain',
      'Time-bound threat ("today at 6 PM") engineered to bypass critical verification',
    ],
    recommendedActions: [
      'Do NOT click the link or enter your username, password, ATM PIN, or OTP.',
      'Delete the SMS and block the sender number.',
      'Check KYC status only through the official YONO app or by visiting your home bank branch.',
      'If you already clicked and entered details, call your bank immediately and report to 1930.',
    ],
    safetyWarnings: [
      'AI assessment is advisory and based on behavioral/lexical indicators.',
      'Never share OTPs, MPINs, passwords, or CVVs with any caller or web link.',
    ],
    technicalFindings: [
      { label: 'Channel Submitted', value: 'SMS', verified: true, status: 'info' },
      { label: 'Embedded Link Protocol', value: 'HTTP (Unencrypted)', verified: true, status: 'warning' },
      { label: 'Lookalike Domain Pattern', value: 'sbi-kyc-update-alert.xyz', verified: true, status: 'warning' },
    ],
    evidenceSplit: {
      verifiedFacts: [
        'Embedded URL uses unencrypted http:// and a .xyz top-level domain.',
        'Domain is not an official sbi.co.in or onlinesbi.sbi domain.',
      ],
      suspiciousIndicators: [
        'Threatens immediate account suspension at 6 PM.',
        'Uses brand keyword "sbi" combined with "kyc-update".',
      ],
      aiAssessments: [
        'High-confidence banking credential harvesting attempt (96% estimated probability).',
      ],
    },
  },
  {
    investigationCode: 'INV-SAMPLE-7318',
    createdAt: '2026-11-13T09:45:00.000Z',
    type: 'url',
    submittedContent: 'https://paytm-cashback-rewards-claim.top/upi-verify',
    threatCategory: 'UPI Cashback & Collect-Request Fraud',
    riskScore: 89,
    threatClassification: 'CRITICAL',
    scamProbability: 92,
    confidenceLevel: 'HIGH',
    intelligenceStatus: 'Sample Case · Local Lexical & DNS Forensics + AI Behavioral Analysis',
    summary:
      'The submitted URL impersonates a major Indian UPI payment platform on a high-abuse .top domain. Cashback-claim portals on third-party domains are frequently used to trigger unauthorized UPI Collect requests or malicious APK downloads.',
    suspiciousKeywords: ['paytm', 'cashback-rewards-claim', 'upi-verify', '.top'],
    psychologicalTechniques: ['Greed / Unexpected Windfall Bait', 'Brand Impersonation'],
    financialWarningSigns: [
      'Promises cashback claim requiring UPI verification',
      'Hosted off-brand outside official paytm.com infrastructure',
    ],
    redFlags: [
      'Third-party domain embedding trusted brand name "paytm"',
      'Uses disposable .top TLD common in short-lived phishing campaigns',
    ],
    supportingEvidence: [
      'Official Paytm promotions occur exclusively inside the official app or paytm.com.',
      'Receiving money or cashback NEVER requires entering your UPI PIN.',
    ],
    recommendedActions: [
      'Close the page immediately without approving any UPI Collect request.',
      'Verify cashback offers strictly inside the official payment application.',
      'If a UPI PIN was entered and funds debited, call 1930 and your bank within minutes.',
    ],
    safetyWarnings: [
      'Entering a UPI PIN ALWAYS sends money out — it is never required to receive cashback.',
      'Assessment relies on structural URL forensics and behavioral AI patterns.',
    ],
    technicalFindings: [
      { label: 'Transport Protocol', value: 'HTTPS (Encrypted transport)', verified: true, status: 'safe' },
      { label: 'Top-Level Domain', value: '.top (High-risk TLD pattern)', verified: true, status: 'caution' },
      { label: 'Brand Spoofing Check', value: 'Contains "paytm" on non-official host', verified: true, status: 'warning' },
    ],
    evidenceSplit: {
      verifiedFacts: [
        'Hostname is paytm-cashback-rewards-claim.top (not paytm.com).',
        'Uses .top TLD outside official corporate domain namespace.',
      ],
      suspiciousIndicators: [
        'Cashback claim lure paired with UPI verification path.',
      ],
      aiAssessments: [
        'Strong indicator of payment/UPI social engineering (92% estimated probability).',
      ],
    },
  },
  {
    investigationCode: 'INV-SAMPLE-5102',
    createdAt: '2026-11-12T18:10:00.000Z',
    type: 'message',
    submittedContent:
      'Hello! Part-time remote work from home opportunity. Earn Rs. 3,500 - 8,000 daily by liking YouTube videos and rating hotels. Zero experience needed. Message HR Priya on Telegram @hr_task_desk99.',
    threatCategory: 'Fake Job & Prepaid Task Scam',
    riskScore: 84,
    threatClassification: 'HIGH',
    scamProbability: 88,
    confidenceLevel: 'HIGH',
    intelligenceStatus: 'Sample Case · AI NLP & Behavioral Forensics',
    summary:
      'Matches the exact playbook of organized prepaid task-job scams. Attackers lure victims with unrealistic daily payouts for trivial social media tasks, then shift conversations to Telegram before demanding "merchant recharge" deposits.',
    suspiciousKeywords: [
      'Earn Rs. 3,500 - 8,000 daily',
      'liking YouTube videos',
      'Zero experience needed',
      'Message HR Priya on Telegram',
    ],
    psychologicalTechniques: [
      'Unrealistic Income Promise',
      'Low-Barrier Effort Bait',
      'Platform Migration to Encrypted Chat (Telegram)',
    ],
    financialWarningSigns: [
      'Task scams routinely start with small Rs. 150-300 payouts to build trust before demanding large "VIP task" deposits',
    ],
    redFlags: [
      'Legitimate employers do not recruit via unsolicited messages offering thousands per day for liking videos',
      'Redirects applicants to unverified Telegram handles',
    ],
    supportingEvidence: [
      'High daily compensation (Rs. 3,500-8,000/day) for zero-skill engagement tasks',
      'Off-platform recruitment via Telegram handle',
    ],
    recommendedActions: [
      'Do not contact the Telegram handle or send any "registration" or "prepaid task" deposits.',
      'Block and report the sender on WhatsApp/SMS.',
      'If you transferred money into a task group, preserve bank UTR receipts and report at cybercrime.gov.in or 1930.',
    ],
    safetyWarnings: [
      'Never pay money to unlock salaries, commissions, or "merchant task levels".',
    ],
    technicalFindings: [
      { label: 'Channel Submitted', value: 'WhatsApp / SMS', verified: true, status: 'info' },
      { label: 'Off-Platform Redirect', value: 'Telegram handle (@hr_task_desk99)', verified: true, status: 'caution' },
    ],
    evidenceSplit: {
      verifiedFacts: [
        'Message recruits for paid video-liking tasks and directs contact to Telegram.',
      ],
      suspiciousIndicators: [
        'Disproportionate pay promise (Rs. 3,500-8,000 daily) with zero experience required.',
      ],
      aiAssessments: [
        'High-risk advance-fee / task scam pattern (88% estimated probability).',
      ],
    },
  },
];

export const EDUCATION_MODULES = [
  {
    id: 'upi-fraud',
    title: '01. UPI Collect Requests & QR Code Traps',
    riskLevel: 'CRITICAL',
    summary:
      'Scammers pose as buyers, customer support, or cashback agents and send a UPI Collect request or QR code claiming you will receive money.',
    redFlags: [
      'Any request asking you to enter your UPI PIN to receive a refund, prize, or payment.',
      'Screen-sharing apps (AnyDesk, TeamViewer, RustDesk) requested by "support executives".',
      'Fake payment confirmation screenshots showing cropped fonts or wrong UTR lengths.',
    ],
    defenseRule:
      'Golden Rule: Your UPI PIN is ONLY required when money leaves your bank account. Receiving funds never requires entering a PIN or scanning a QR code.',
  },
  {
    id: 'digital-arrest',
    title: '02. "Digital Arrest" & Law Enforcement Impersonation',
    riskLevel: 'CRITICAL',
    summary:
      'Fraudsters impersonate CBI, Narcotics Control Bureau, RBI, Customs, or Telecom officials via video calls, claiming your Aadhaar or parcel is linked to money laundering.',
    redFlags: [
      'Threats of immediate arrest unless you stay on a continuous Skype/WhatsApp video call.',
      'Demands to transfer savings into a "RBI verification account" or "escrow safety account".',
      'Fake FIR documents, court warrants, or police badges sent over WhatsApp.',
    ],
    defenseRule:
      'Indian law enforcement agencies NEVER conduct "digital arrests" over WhatsApp/Skype or demand money transfers to clear your name. Disconnect immediately and verify with your local police station.',
  },
  {
    id: 'task-job-scam',
    title: '03. Fake Remote Jobs & Prepaid Task Scams',
    riskLevel: 'HIGH',
    summary:
      'Unsolicited messages promise daily income for rating hotels, liking videos, or reviewing apps, shifting victims onto Telegram groups.',
    redFlags: [
      'Unrealistic pay (Rs. 3,000–10,000/day) for simple clicks or likes.',
      'Small initial payouts followed by "VIP prepaid tasks" requiring upfront deposits.',
      'Fake dashboard balances that freeze until you pay "tax" or "unlock fees".',
    ],
    defenseRule:
      'Never pay money to earn a salary or unlock commissions. Legitimate employers pay you—never the reverse.',
  },
  {
    id: 'phishing-lookalikes',
    title: '04. Lookalike Domains, Smishing & Malicious APKs',
    riskLevel: 'HIGH',
    summary:
      'Attackers mimic banks, electricity boards, courier companies, or government portals using subtle typos (e.g., sbi-kyc-update.xyz) or send ".apk" files over WhatsApp.',
    redFlags: [
      'Urgent warnings that electricity, SIM card, or bank KYC will be disconnected tonight.',
      'URLs ending in .xyz, .top, .click, or containing hyphens around brand names.',
      'Files ending in .apk sent over WhatsApp disguised as "RTO Challan" or "Wedding Invite".',
    ],
    defenseRule:
      'Never install .apk files from messaging apps. Always type official bank or government URLs directly or use verified app stores.',
  },
  {
    id: 'investment-scam',
    title: '05. Guaranteed Return Stock & Crypto Groups',
    riskLevel: 'HIGH',
    summary:
      'Fake WhatsApp/Telegram investment clubs impersonate SEBI-registered analysts or institutional IPO desks promising 20–50% monthly returns.',
    redFlags: [
      'Private trading apps downloaded outside official Google Play / Apple App Store.',
      'Bank transfers requested to unrelated third-party personal or shell company accounts.',
      'Pressure to invest quickly in "institutional block deals" or "guaranteed IPO allocations".',
    ],
    defenseRule:
      'Verify any investment advisor directly on SEBI’s official portal before transferring funds. Guaranteed high returns with zero risk are always fraudulent.',
  },
];
