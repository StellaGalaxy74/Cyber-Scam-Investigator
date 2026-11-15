import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lock, Save, Trash2 } from 'lucide-react';
import { AuthGateCard } from '../components/AuthGateCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../lib/api.ts';
import type { UserProfile } from '../types/investigation.ts';

export function SettingsPage() {
  const { firebaseUser, profile, setProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [preferredRegion, setPreferredRegion] = useState('India');
  const [saveHistory, setSaveHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setCountryCode(profile.countryCode || '+91');
      setPreferredRegion(profile.preferredRegion || 'India');
      setSaveHistory(profile.saveHistory ?? true);
    }
  }, [profile]);

  if (!firebaseUser) {
    return (
      <AuthGateCard
        title="Sign in to manage Profile & Privacy Settings"
        description="Configure default country code assumptions, history retention preferences, and data controls."
      />
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setError(null);
    try {
      const res = await apiRequest<{ profile: UserProfile }>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName,
          countryCode,
          preferredRegion,
          saveHistory,
        }),
      });
      setProfile(res.profile);
      setStatusMessage('Preferences saved to your profile.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllHistory = async () => {
    setError(null);
    setStatusMessage(null);
    try {
      await apiRequest('/api/investigations', { method: 'DELETE' });
      await apiRequest('/api/chat', { method: 'DELETE' });
      setStatusMessage('All investigation history and assistant chat transcripts have been permanently deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to wipe history.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-6">
        <div className="border-b border-slate-800/80 pb-4">
          <h2 className="text-lg font-bold text-slate-100">User Profile & Privacy Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Account: <span className="font-mono text-slate-200">{firebaseUser.email}</span>
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-region" className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Reporting Region
              </label>
              <select
                id="profile-region"
                value={preferredRegion}
                onChange={(e) => setPreferredRegion(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                <option value="India">India (1930 / cybercrime.gov.in)</option>
                <option value="Global">International / General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-country-code" className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Country Dialing Code
              </label>
              <input
                id="profile-country-code"
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-[#060A13] px-4 py-2.5 font-mono text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#060A13] px-4 py-2.5 w-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveHistory}
                  onChange={(e) => setSaveHistory(e.target.checked)}
                  className="h-4 w-4 accent-cyan-400 rounded"
                />
                <div>
                  <span className="block text-xs font-medium text-slate-200">
                    Save investigation history
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Disable for incognito-only scans without DB storage
                  </span>
                </div>
              </label>
            </div>
          </div>

          {statusMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-800/50 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>

            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>

      {/* Privacy & Data Management */}
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Lock className="h-4 w-4 text-cyan-400" />
          <h3>Ethical & Privacy Safeguards</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          We automatically redact 13–19 digit card-like sequences and explicit OTP/PIN disclosures before storing any submission. You may permanently erase all stored investigations and assistant chat transcripts below.
        </p>
        <button
          type="button"
          onClick={() => void handleDeleteAllHistory()}
          className="inline-flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Erase All Saved History & Chats</span>
        </button>
      </div>
    </div>
  );
}
