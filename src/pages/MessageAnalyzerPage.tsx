import React, { useState } from 'react';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { InvestigationReportView } from '../components/InvestigationReportView.tsx';
import { ScanProgressBanner } from '../components/ScanProgressBanner.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { InvestigationReport } from '../types/investigation.ts';
import type { AppRoute } from '../types/navigation.ts';

interface MessageAnalyzerPageProps {
  onNavigate: (route: AppRoute) => void;
  onAskAssistantWithReport: (report: InvestigationReport) => void;
}

const SAMPLE_PROMPTS = [
  {
    label: 'Bank KYC Phishing SMS',
    channel: 'SMS',
    text: 'Dear Customer, your SBI YONO account will be suspended today at 6 PM due to pending PAN KYC. Update immediately at http://sbi-kyc-update-alert.xyz/login to avoid block.',
  },
  {
    label: 'Fake Part-Time Job Offer',
    channel: 'WhatsApp',
    text: 'Hello! Part-time remote work from home opportunity. Earn Rs. 3,500 - 8,000 daily by liking YouTube videos and rating hotels. Zero experience required. Message HR Priya on Telegram @hr_task_desk99.',
  },
  {
    label: 'Legitimate Bank Alert',
    channel: 'SMS',
    text: 'INR 450.00 debited from A/c XX4821 on 15-Nov-26 via UPI/432098123412. If not done by you, call 1800111109 or block via official app.',
  },
];

export function MessageAnalyzerPage({
  onNavigate,
  onAskAssistantWithReport,
}: MessageAnalyzerPageProps) {
  const { firebaseUser } = useAuth();
  const [channel, setChannel] = useState('SMS / WhatsApp');
  const [content, setContent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InvestigationReport | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (content.trim().length < 8) {
      setError('Please paste at least 8 characters of the suspicious message.');
      return;
    }

    setScanning(true);
    try {
      const res = await apiRequest<{ report: InvestigationReport }>('/api/investigate/message', {
        method: 'POST',
        body: JSON.stringify({ content, channel }),
      });
      setReport(res.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">Message Scam Analyzer</h2>
            <p className="text-xs text-slate-400">
              Analyze SMS, WhatsApp forwards, phishing emails, social media DMs, fake job offers, or lottery notices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setChannel(sample.channel);
                  setContent(sample.text);
                  setError(null);
                }}
                className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
              >
                Load: {sample.label}
              </button>
            ))}
          </div>
        </div>

        {!firebaseUser ? (
          <AuthGateCard
            title="Sign in to analyze suspicious messages"
            description="Authentication secures AI forensic endpoints and lets you save structured PDF case reports to your history."
          />
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="message-channel" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Message Channel
                </label>
                <select
                  id="message-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-3 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="SMS / WhatsApp">SMS / WhatsApp</option>
                  <option value="Email">Email</option>
                  <option value="Telegram / Social DM">Telegram / Social DM</option>
                  <option value="Job / Investment Offer">Job / Investment Offer</option>
                  <option value="Payment / UPI Request">Payment / UPI Request</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex items-end">
                <p className="text-xs text-slate-400 flex items-center gap-2 pb-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Never paste your real OTP, password, or bank PIN. Detected card sequences are auto-redacted.</span>
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="message-text" className="block text-xs font-medium text-slate-300 mb-1.5">
                Suspicious Message Content
              </label>
              <textarea
                id="message-text"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the exact SMS, WhatsApp text, or email body here..."
                className="w-full rounded-lg border border-slate-700 bg-[#060A13] p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {content.length} / 6000 chars
              </span>
              <button
                type="submit"
                disabled={scanning}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{scanning ? 'Analyzing Message...' : 'Analyze Message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <ScanProgressBanner active={scanning} label="Analyzing message linguistics and behavioral threat indicators..." />

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
