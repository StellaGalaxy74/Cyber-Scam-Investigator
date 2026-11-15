import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Globe,
  History,
  Image,
  MessageSquare,
  Phone,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { SAMPLE_INVESTIGATIONS } from '../data/sampleInvestigations.ts';
import { apiRequest } from '../lib/api.ts';
import type { InvestigationReport, SavedInvestigation } from '../types/investigation.ts';
import type { AppRoute } from '../types/navigation.ts';
import { InvestigationReportView } from '../components/InvestigationReportView.tsx';

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
  onAskAssistantWithReport: (report: InvestigationReport) => void;
}

export function DashboardPage({
  onNavigate,
  onAskAssistantWithReport,
}: DashboardPageProps) {
  const { firebaseUser } = useAuth();
  const [history, setHistory] = useState<SavedInvestigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InvestigationReport | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setHistory([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    apiRequest<{ investigations: SavedInvestigation[] }>('/api/investigations')
      .then((res) => {
        if (mounted) setHistory(res.investigations || []);
      })
      .catch(() => {
        if (mounted) setHistory([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [firebaseUser]);

  const toFullReport = (item: SavedInvestigation): InvestigationReport => ({
    investigationCode: item.investigationCode,
    createdAt: item.createdAt,
    type: item.type,
    submittedContent: item.submittedContent,
    threatCategory: item.threatCategory,
    riskScore: item.riskScore,
    threatClassification: item.threatClassification,
    scamProbability: item.scamProbability,
    confidenceLevel: item.confidenceLevel,
    intelligenceStatus: item.intelligenceStatus,
    ...item.reportJson,
  });

  const totalScans = history.length;
  const highCriticalCount = history.filter(
    (h) => h.threatClassification === 'HIGH' || h.threatClassification === 'CRITICAL'
  ).length;
  const avgRisk =
    totalScans > 0
      ? Math.round(history.reduce((acc, cur) => acc + cur.riskScore, 0) / totalScans)
      : 0;

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setSelectedReport(null)}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Investigation Dashboard
        </button>
        <InvestigationReportView
          report={selectedReport}
          onAskAssistant={onAskAssistantWithReport}
          onNavigateIndiaHelp={() => onNavigate('india-help')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-1">
          <p className="text-xs text-slate-400">Saved Investigations</p>
          <p className="font-mono text-2xl font-bold text-slate-100 tabular-nums">
            {firebaseUser ? totalScans : '—'}
          </p>
          <p className="text-[11px] text-slate-500">
            {firebaseUser ? 'Synced to private PostgreSQL vault' : 'Sign in to save personal scans'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-1">
          <p className="text-xs text-slate-400">High / Critical Threats</p>
          <p className="font-mono text-2xl font-bold text-red-400 tabular-nums">
            {firebaseUser ? highCriticalCount : '—'}
          </p>
          <p className="text-[11px] text-slate-500">Flagged high-probability fraud cases</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-5 space-y-1">
          <p className="text-xs text-slate-400">Average Risk Index</p>
          <p className="font-mono text-2xl font-bold text-cyan-400 tabular-nums">
            {firebaseUser ? `${avgRisk}/100` : '—'}
          </p>
          <p className="text-[11px] text-slate-500">Across analyzed submissions</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('india-help')}
          className="text-left rounded-xl border border-red-900/50 bg-red-950/20 p-5 hover:border-red-500/50 transition-colors space-y-1"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-red-300">
            <span>India Cyber Helpline</span>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <p className="font-mono text-2xl font-bold text-slate-100 tabular-nums">1930</p>
          <p className="text-[11px] text-slate-400">cybercrime.gov.in · Immediate fraud reporting</p>
        </button>
      </div>

      {/* Quick Launch Forensic Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">Launch Forensic Investigation</h2>
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open AI Assistant</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('message')}
            className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/50 transition-colors space-y-3"
          >
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Message Scam Analyzer</p>
              <p className="text-xs text-slate-400 mt-1">SMS, WhatsApp, email, job & lottery texts</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('url')}
            className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/50 transition-colors space-y-3"
          >
            <Globe className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">URL & Website Scanner</p>
              <p className="text-xs text-slate-400 mt-1">Lookalike spoofing, DNS & TLS inspection</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/50 transition-colors space-y-3"
          >
            <Phone className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Phone & Email Check</p>
              <p className="text-xs text-slate-400 mt-1">Country code, format, MX & SPF/DMARC</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('screenshot')}
            className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/50 transition-colors space-y-3"
          >
            <Image className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Screenshot & OCR</p>
              <p className="text-xs text-slate-400 mt-1">Extract & scan chat or payment images</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent User Investigations OR Sample Investigations */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              {firebaseUser && history.length > 0
                ? 'Recent Investigations'
                : 'Sample Investigation Case Files'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {firebaseUser && history.length > 0
                ? 'Click any investigation to inspect full forensic evidence or download PDF.'
                : 'Representative case files demonstrating 12-point structured threat reporting.'}
            </p>
          </div>
          {firebaseUser && (
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
            >
              <History className="h-3.5 w-3.5" />
              <span>Full History</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            <div className="h-10 rounded-lg bg-slate-800/50 animate-pulse" />
            <div className="h-10 rounded-lg bg-slate-800/50 animate-pulse" />
            <div className="h-10 rounded-lg bg-slate-800/50 animate-pulse" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400">
                  <th className="py-3 px-6 font-medium">Case ID</th>
                  <th className="py-3 px-6 font-medium">Type</th>
                  <th className="py-3 px-6 font-medium">Threat Category</th>
                  <th className="py-3 px-6 font-medium text-right">Risk Score</th>
                  <th className="py-3 px-6 font-medium text-right">Classification</th>
                  <th className="py-3 px-6 font-medium text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(firebaseUser && history.length > 0
                  ? history.slice(0, 6).map(toFullReport)
                  : SAMPLE_INVESTIGATIONS
                ).map((item) => (
                  <tr
                    key={item.investigationCode}
                    className="hover:bg-slate-900/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(item)}
                  >
                    <td className="py-3 px-6 font-mono text-cyan-300 whitespace-nowrap">
                      {item.investigationCode}
                    </td>
                    <td className="py-3 px-6 uppercase text-slate-400 whitespace-nowrap">
                      {item.type.replace('_', '/')}
                    </td>
                    <td className="py-3 px-6 text-slate-200 max-w-xs truncate">
                      {item.threatCategory}
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums text-slate-100">
                      {item.riskScore}/100
                    </td>
                    <td className="py-3 px-6 text-right font-mono font-semibold whitespace-nowrap">
                      <span
                        className={
                          item.threatClassification === 'CRITICAL'
                            ? 'text-red-400'
                            : item.threatClassification === 'HIGH'
                              ? 'text-orange-400'
                              : item.threatClassification === 'MEDIUM'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                        }
                      >
                        {item.threatClassification}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {firebaseUser && history.length === 0 && !loading && (
          <div className="px-6 py-4 border-t border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/30">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>You have not saved any personal investigations yet. Showing sample cases above.</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('message')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
            >
              Run First Scan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
