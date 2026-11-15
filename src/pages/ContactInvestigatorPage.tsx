import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { InvestigationReportView } from '../components/InvestigationReportView.tsx';
import { ScanProgressBanner } from '../components/ScanProgressBanner.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { InvestigationReport } from '../types/investigation.ts';
import type { AppRoute } from '../types/navigation.ts';

interface ContactInvestigatorPageProps {
  onNavigate: (route: AppRoute) => void;
  onAskAssistantWithReport: (report: InvestigationReport) => void;
}

export function ContactInvestigatorPage({
  onNavigate,
  onAskAssistantWithReport,
}: ContactInvestigatorPageProps) {
  const { firebaseUser } = useAuth();
  const [kind, setKind] = useState<'phone' | 'email'>('phone');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<InvestigationReport | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!value.trim()) {
      setError(`Please enter a ${kind === 'phone' ? 'phone number' : 'valid email address'}.`);
      return;
    }

    setScanning(true);
    try {
      const res = await apiRequest<{ report: InvestigationReport }>('/api/investigate/contact', {
        method: 'POST',
        body: JSON.stringify({ kind, value: value.trim(), notes: notes.trim() }),
      });
      setReport(res.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Investigation failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">Phone Number & Email Investigator</h2>
            <p className="text-xs text-slate-400">
              Validate phone formatting & country codes, or verify email syntax, DNS MX mail servers, and SPF/DMARC anti-spoofing records.
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#060A13] border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setKind('phone');
                setValue('');
                setError(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                kind === 'phone'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Phone Number</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setKind('email');
                setValue('');
                setError(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                kind === 'email'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email Address</span>
            </button>
          </div>
        </div>

        {!firebaseUser ? (
          <AuthGateCard
            title="Sign in to investigate phone numbers or email domains"
            description="Our backend verifies real DNS MX/SPF/DMARC records and country allocation patterns without fabricating fraud claims."
          />
        ) : (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-value" className="block text-xs font-medium text-slate-300 mb-1.5">
                  {kind === 'phone' ? 'Phone Number (with or without +91)' : 'Sender Email Address'}
                </label>
                <input
                  id="contact-value"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={kind === 'phone' ? '+91 9876543210' : 'sbi.kyc.verify@gmail.com'}
                  className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="contact-notes" className="block text-xs font-medium text-slate-300 mb-1.5">
                  Optional Context (What did the caller/sender claim?)
                </label>
                <input
                  id="contact-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Claimed to be bank KYC agent asking for screen share"
                  className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Ethical guarantee: A number or email is never labeled fraudulent without supporting evidence.</span>
              </p>

              <button
                type="submit"
                disabled={scanning}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                {kind === 'phone' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                <span>{scanning ? 'Investigating...' : `Verify ${kind === 'phone' ? 'Phone' : 'Email'}`}</span>
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
        label={
          kind === 'email'
            ? 'Checking RFC syntax, disposable provider lists, and live DNS MX/SPF/DMARC records...'
            : 'Validating E.164 format, country code allocation, and behavioral context...'
        }
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
