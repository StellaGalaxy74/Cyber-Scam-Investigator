import React, { useState } from 'react';
import { FileUp, Image as ImageIcon, ShieldCheck, X } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { InvestigationReportView } from '../components/InvestigationReportView.tsx';
import { ScanProgressBanner } from '../components/ScanProgressBanner.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { InvestigationReport } from '../types/investigation.ts';
import type { AppRoute } from '../types/navigation.ts';

interface ScreenshotAnalyzerPageProps {
  onNavigate: (route: AppRoute) => void;
  onAskAssistantWithReport: (report: InvestigationReport) => void;
}

export function ScreenshotAnalyzerPage({
  onNavigate,
  onAskAssistantWithReport,
}: ScreenshotAnalyzerPageProps) {
  const { firebaseUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InvestigationReport | null>(null);

  const handleFileSelect = (selected: File | null) => {
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!selected) {
      setFile(null);
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'];
    if (!allowed.includes(selected.type)) {
      setError('Unsupported format. Upload a PNG, JPG, WEBP image, PDF document, or TXT file.');
      return;
    }
    if (selected.size > 6 * 1024 * 1024) {
      setError('File exceeds 6 MB maximum size.');
      return;
    }

    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Please choose a screenshot, payment slip, or PDF document to analyze.');
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (context.trim()) {
        formData.append('context', context.trim());
      }
      const res = await apiRequest<{ report: InvestigationReport }>('/api/investigate/screenshot', {
        method: 'POST',
        body: formData,
      });
      setReport(res.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Screenshot investigation failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
        <div className="border-b border-slate-800/80 pb-4 space-y-1">
          <h2 className="text-lg font-bold text-slate-100">Screenshot & Evidence OCR Analyzer</h2>
          <p className="text-xs text-slate-400">
            Upload screenshots of suspicious WhatsApp chats, fake UPI payment requests, email captures, or PDF notices for OCR extraction and scam forensics.
          </p>
        </div>

        {!firebaseUser ? (
          <AuthGateCard
            title="Sign in to run multimodal OCR evidence analysis"
            description="Uploaded screenshots are processed strictly in isolated server memory—never executed or publicly shared."
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-dashed border-slate-700 bg-[#060A13] p-6 text-center space-y-3">
              {!file ? (
                <label className="cursor-pointer block space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                    <FileUp className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-200">
                    Click to select screenshot or document
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PNG, JPG, WEBP, PDF, or TXT (max 6 MB)
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  />
                </label>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-4 min-w-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Selected evidence preview"
                        className="h-20 w-20 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-cyan-400 shrink-0">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{file.name}</p>
                      <p className="text-xs font-mono text-slate-400">
                        {file.type} · {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileSelect(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="evidence-context" className="block text-xs font-medium text-slate-300 mb-1.5">
                Optional Context (Where did you receive this screenshot or document?)
              </label>
              <input
                id="evidence-context"
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Buyer on OLX sent this QR code saying I will receive Rs. 15,000"
                className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Files are processed in memory only and never executed.</span>
              </p>

              <button
                type="submit"
                disabled={scanning || !file}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                <ImageIcon className="h-4 w-4" />
                <span>{scanning ? 'Extracting OCR & Analyzing...' : 'Extract & Investigate'}</span>
              </button>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      <ScanProgressBanner
        active={scanning}
        label="Running multimodal OCR text extraction and scam pattern forensics..."
      />

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
