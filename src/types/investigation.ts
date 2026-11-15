export type InvestigationType = 'message' | 'url' | 'email_phone' | 'screenshot';
export type ThreatClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TechnicalFindingItem {
  label: string;
  value: string;
  verified: boolean;
  status: 'safe' | 'caution' | 'warning' | 'info';
}

export interface EvidenceSplit {
  verifiedFacts: string[];
  suspiciousIndicators: string[];
  aiAssessments: string[];
}

export interface InvestigationReport {
  investigationCode: string;
  createdAt: string;
  type: InvestigationType;
  submittedContent: string;
  threatCategory: string;
  riskScore: number; // 0-100
  threatClassification: ThreatClassification;
  scamProbability: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  intelligenceStatus: string;
  summary: string;
  suspiciousKeywords: string[];
  psychologicalTechniques: string[];
  financialWarningSigns: string[];
  redFlags: string[];
  supportingEvidence: string[];
  recommendedActions: string[];
  safetyWarnings: string[];
  technicalFindings: TechnicalFindingItem[];
  evidenceSplit: EvidenceSplit;
  ocrExtractedText?: string;
}

export interface SavedInvestigation {
  id: number;
  investigationCode: string;
  type: InvestigationType;
  submittedContent: string;
  threatCategory: string;
  riskScore: number;
  threatClassification: ThreatClassification;
  scamProbability: number;
  confidenceLevel: ConfidenceLevel;
  intelligenceStatus: string;
  reportJson: Omit<
    InvestigationReport,
    | 'investigationCode'
    | 'createdAt'
    | 'type'
    | 'submittedContent'
    | 'threatCategory'
    | 'riskScore'
    | 'threatClassification'
    | 'scamProbability'
    | 'confidenceLevel'
    | 'intelligenceStatus'
  >;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  countryCode: string;
  preferredRegion: string;
  saveHistory: boolean;
  createdAt: string;
}

export interface ChatMessageItem {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}
