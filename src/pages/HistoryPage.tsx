import { useEffect, useState } from 'react';
import { Download, Eye, Search, Trash2 } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { InvestigationReportView } from '../components/InvestigationReportView.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { InvestigationReport, SavedInvestigation } from '../types/investigation.ts';
import type { AppRoute } from '../types/navigation.ts';
import { downloadInvestigationPdf } from '../utils/pdfReport.ts';

interface HistoryPageProps {
  onNavigate: (route: AppRoute) => void;
  onAskAssistantWithReport: (report: InvestigationReport) => void;
}

export function HistoryPage({
  onNavigate,
  onAskAssistantWithReport,
}: HistoryPageProps) {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<SavedInvestigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<InvestigationReport | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ investigations: SavedInvestigation[] }>('/api/investigations');
      setItems(res.investigations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investigation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      void loadHistory();
    } else {
      setItems([]);
    }
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

  const handleDeleteOne = async (id: number) => {
    setError(null);
    try {
      await apiRequest(`/api/investigations/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete investigation.');
    }
  };

  const handleClearAll = async () => {
    setError(null);
    try {
      await apiRequest('/api/investigations', { method: 'DELETE' });
      setItems([]);
      setConfirmClearAll(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not clear history.');
    }
  };

  if (!firebaseUser) {
    return (
      <AuthGateCard
        title="Sign in to view your Investigation History"
        description="Access saved forensic reports, revisit past evidence, export PDFs, or delete records anytime."
      />
    );
  }

  if (selected) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Investigation History
        </button>
        <InvestigationReportView
          report={selected}
          onAskAssistant={onAskAssistantWithReport}
          onNavigateIndiaHelp={() => onNavigate('india-help')}
        />
      </div>
    );
  }

  const filtered = items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.investigationCode.toLowerCase().includes(q) ||
      item.threatCategory.toLowerCase().includes(q) ||
      item.submittedContent.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Investigation History</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Saved forensic reports stored securely in your account. Export PDFs or delete records anytime.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {confirmClearAll ? (
                <>
                  <button
                    type="button"
                    onClick={() => void handleClearAll()}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                  >
                    Confirm Delete All
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, category, or content..."
              className="w-full rounded-lg border border-slate-700 bg-[#060A13] pl-9 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#060A13] border border-slate-800">
            {[
              { id: 'all', label: 'All' },
              { id: 'message', label: 'Messages' },
              { id: 'url', label: 'URLs' },
              { id: 'email_phone', label: 'Phone / Email' },
              { id: 'screenshot', label: 'Screenshots' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <div className="h-11 rounded-lg bg-slate-800/50 animate-pulse" />
            <div className="h-11 rounded-lg bg-slate-800/50 animate-pulse" />
            <div className="h-11 rounded-lg bg-slate-800/50 animate-pulse" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm font-medium text-slate-200">
              {items.length === 0
                ? 'No saved investigations yet'
                : 'No matching investigations found'}
            </p>
            <p className="text-xs text-slate-400">
              {items.length === 0
                ? 'Run a message, URL, phone/email, or screenshot scan to build your evidence history.'
                : 'Try adjusting your search query or category filter.'}
            </p>
            {items.length === 0 && (
              <button
                type="button"
                onClick={() => onNavigate('message')}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Run First Investigation
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400">
                  <th className="py-3 px-6 font-medium">ID & Timestamp</th>
                  <th className="py-3 px-6 font-medium">Module</th>
                  <th className="py-3 px-6 font-medium">Category & Preview</th>
                  <th className="py-3 px-6 font-medium text-right">Risk</th>
                  <th className="py-3 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => {
                  const full = toFullReport(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-6 whitespace-nowrap">
                        <div className="font-mono text-cyan-300 font-medium">{item.investigationCode}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums mt-0.5">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-6 uppercase text-slate-400 whitespace-nowrap">
                        {item.type.replace('_', '/')}
                      </td>
                      <td className="py-3 px-6 max-w-md">
                        <div className="font-medium text-slate-100 truncate">{item.threatCategory}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.submittedContent}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <div className="font-mono font-semibold tabular-nums text-slate-100">
                          {item.riskScore}/100
                        </div>
                        <div
                          className={`text-[11px] font-mono font-semibold ${
                            item.threatClassification === 'CRITICAL'
                              ? 'text-red-400'
                              : item.threatClassification === 'HIGH'
                                ? 'text-orange-400'
                                : item.threatClassification === 'MEDIUM'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                          }`}
                        >
                          {item.threatClassification}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelected(full)}
                            title="View Full Report"
                            aria-label="View Full Report"
                            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadInvestigationPdf(full)}
                            title="Download PDF"
                            aria-label="Download PDF"
                            className="p-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-slate-800"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteOne(item.id)}
                            title="Delete Record"
                            aria-label="Delete Record"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
