import {
  AlertOctagon,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  PhoneCall,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import type { InvestigationReport } from '../types/investigation.ts';
import { downloadInvestigationPdf } from '../utils/pdfReport.ts';
import { ThreatMeter } from './ThreatMeter.tsx';

interface InvestigationReportViewProps {
  report: InvestigationReport;
  onAskAssistant?: (report: InvestigationReport) => void;
  onNavigateIndiaHelp?: () => void;
}

export function InvestigationReportView({
  report,
  onAskAssistant,
  onNavigateIndiaHelp,
}: InvestigationReportViewProps) {
  return (
    <section className="space-y-6" aria-label="Investigation Report">
      {/* Header Metadata & Export */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-cyan-400 font-semibold">{report.investigationCode}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{new Date(report.createdAt).toLocaleString()}</span>
              <span aria-hidden="true">·</span>
              <span className="uppercase">{report.type.replace('_', ' / ')}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{report.threatCategory}</h2>
            <p className="text-xs text-slate-400">
              Intelligence Status: <span className="text-slate-200">{report.intelligenceStatus}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onAskAssistant && (
              <button
                type="button"
                onClick={() => onAskAssistant(report)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Discuss with Assistant</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => downloadInvestigationPdf(report)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Threat Meter + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <ThreatMeter
              riskScore={report.riskScore}
              scamProbability={report.scamProbability}
              classification={report.threatClassification}
              confidence={report.confidenceLevel}
            />
          </div>
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Overall Forensic Assessment</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
            <div className="pt-1">
              <p className="text-xs font-medium text-slate-400 mb-1.5">Submitted Content (Non-Executable Preview)</p>
              <div className="rounded-lg border border-slate-800 bg-[#060A13] p-3 font-mono text-xs text-slate-300 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                {report.submittedContent}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Extracted Text (if applicable) */}
      {report.ocrExtractedText && (
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <FileText className="h-4 w-4 text-cyan-400" />
            <h3>Extracted Text (OCR)</h3>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#060A13] p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
            {report.ocrExtractedText}
          </div>
        </div>
      )}

      {/* Evidence Separation: Verified vs Suspicious vs AI Assessment */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-semibold text-slate-100">
            Evidence Verification Breakdown
          </h3>
          <span className="text-xs text-slate-400">
            Distinguishing verified technical checks from AI predictions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Verified Technical Facts</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {(report.evidenceSplit?.verifiedFacts?.length
                ? report.evidenceSplit.verifiedFacts
                : ['No external feed checks executed; local structural metadata recorded.']
              ).map((item, idx) => (
                <li key={idx} className="border-b border-slate-800/60 pb-2 last:border-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Eye className="h-4 w-4 shrink-0" />
              <span>Observed Suspicious Indicators</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {(report.evidenceSplit?.suspiciousIndicators?.length
                ? report.evidenceSplit.suspiciousIndicators
                : ['No high-severity anomalies detected in submitted sample.']
              ).map((item, idx) => (
                <li key={idx} className="border-b border-slate-800/60 pb-2 last:border-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>AI Forensic Assessment</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {(report.evidenceSplit?.aiAssessments?.length
                ? report.evidenceSplit.aiAssessments
                : [report.summary]
              ).map((item, idx) => (
                <li key={idx} className="border-b border-slate-800/60 pb-2 last:border-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Findings Table (if present) */}
      {report.technicalFindings && report.technicalFindings.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80">
            <h3 className="text-sm font-semibold text-slate-100">Technical Inspection Telemetry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400">
                  <th className="py-2.5 px-6 font-medium">Check Parameter</th>
                  <th className="py-2.5 px-6 font-medium">Observed Result</th>
                  <th className="py-2.5 px-6 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.technicalFindings.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-6 font-medium text-slate-200">{item.label}</td>
                    <td className="py-2.5 px-6 font-mono text-slate-300 break-all">{item.value}</td>
                    <td className="py-2.5 px-6 text-right font-mono uppercase">
                      <span
                        className={
                          item.status === 'warning'
                            ? 'text-red-400'
                            : item.status === 'caution'
                              ? 'text-amber-400'
                              : item.status === 'safe'
                                ? 'text-emerald-400'
                                : 'text-cyan-400'
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Forensic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Suspicious Keywords & Phrases</h3>
            {report.suspiciousKeywords.length > 0 ? (
              <p className="text-xs font-mono text-amber-300/90 leading-relaxed">
                {report.suspiciousKeywords.join('  ·  ')}
              </p>
            ) : (
              <p className="text-xs text-slate-400">No explicit trigger keywords flagged.</p>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Psychological Manipulation Techniques</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(report.psychologicalTechniques.length
                ? report.psychologicalTechniques
                : ['None strongly indicated']
              ).map((item, idx) => (
                <li key={idx}>— {item}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Financial Warning Signs</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(report.financialWarningSigns.length
                ? report.financialWarningSigns
                : ['No direct financial solicitation detected']
              ).map((item, idx) => (
                <li key={idx}>— {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-2">Red Flags & Supporting Evidence</h3>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              {[...report.redFlags, ...report.supportingEvidence].length > 0 ? (
                [...report.redFlags, ...report.supportingEvidence].map((item, idx) => (
                  <li key={idx}>— {item}</li>
                ))
              ) : (
                <li>No critical red flags found.</li>
              )}
            </ul>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Recommended Protective Actions</h3>
            <ol className="space-y-2 text-xs text-slate-200 leading-relaxed list-decimal list-inside">
              {(report.recommendedActions.length
                ? report.recommendedActions
                : ['Verify independently through official channels before responding.']
              ).map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Safety Warnings & India Emergency Callout */}
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-red-300">Important Safety & Ethical Notice</p>
            <p>
              {report.safetyWarnings[0] ||
                'Treat AI predictions as advisory assessments, not legal proof. Never share OTPs, PINs, CVVs, or passwords.'}
            </p>
            <p className="text-slate-400">
              If money has already been lost, contact your bank immediately, dial <strong className="text-slate-100 font-mono">1930</strong> (India National Cybercrime Helpline), and file at <span className="font-mono text-cyan-300">cybercrime.gov.in</span>.
            </p>
          </div>
        </div>

        {onNavigateIndiaHelp && (
          <button
            type="button"
            onClick={onNavigateIndiaHelp}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 transition-colors whitespace-nowrap shrink-0"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span>India 1930 Reporting Guide</span>
          </button>
        )}
      </div>
    </section>
  );
}
