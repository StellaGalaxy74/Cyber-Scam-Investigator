import React, { useState } from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { InvestigationReportView } from '../components/InvestigationReportView.tsx';
import { ScanProgressBanner } from '../components/ScanProgressBanner.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { InvestigationReport } from '../types/investigation.ts';
import type { AppRoute } from '../types/navigation.ts';

interface UrlScannerPageProps {
  onNavigate: (route: AppRoute) => void;
  onAskAssistantWithReport: (report: InvestigationReport) => void;
}

const SAMPLE_URLS = [
  { label: 'Lookalike Bank Phish', url: 'http://sbi-kyc-update-alert.xyz/login' },
  { label: 'Cashback Lure (.top)', url: 'https://paytm-cashback-rewards-claim.top/upi-verify' },
  { label: 'Official RBI Portal', url: 'https://www.rbi.org.in' },
];

export function UrlScannerPage({
  onNavigate,
  onAskAssistantWithReport,
}: UrlScannerPageProps) {
  const { firebaseUser } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InvestigationReport | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!urlInput.trim()) {
      setError('Enter a website URL to inspect.');
      return;
    }

    setScanning(true);
    try {
      const res = await apiRequest<{ report: InvestigationReport }>('/api/investigate/url', {
        method: 'POST',
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      setReport(res.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'URL inspection failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">URL & Website Scanner</h2>
            <p className="text-xs text-slate-400">
              Non-executing domain inspection: checks typosquatting, punycode spoofing, DNS resolution, HTTPS/TLS certificates, and configured threat feeds.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                  setError(null);
                }}
                className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {!firebaseUser ? (
          <AuthGateCard
            title="Sign in to run safe URL & TLS forensics"
            description="URL checks are isolated server-side with SSRF protection and never open malicious links in your browser."
          />
        ) : (
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label htmlFor="url-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Website URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="url-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/verify"
                  className="flex-1 rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={scanning}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <Globe className="h-4 w-4" />
                  <span>{scanning ? 'Scanning URL...' : 'Inspect URL'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Protected against SSRF & private network probing. Links are never executed or rendered in an iframe.</span>
            </p>

            {error && (
              <div role="alert" className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      <ScanProgressBanner active={scanning} label="Resolving public DNS, inspecting TLS handshake, and evaluating domain spoofing..." />

      {report && !scanning && (
        <InvestigationReportView
          report={report}
          onAskAssistant={onAskAssistantWithReport}
          onNavigateIndiaHelp={() => onNavigate('india-help')}
        />
      )}
    </div>
  );
}
