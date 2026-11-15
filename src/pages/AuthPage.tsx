import { CheckCircle2, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { AppRoute } from '../types/navigation.ts';

interface AuthPageProps {
  onNavigate: (route: AppRoute) => void;
}

export function AuthPage({ onNavigate }: AuthPageProps) {
  const { firebaseUser, authError, signInWithGoogle, logout } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      onNavigate('dashboard');
    } catch {
      // handled in context
    }
  };

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100 flex flex-col justify-center px-6 py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Overview
        </button>

        <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 pt-2">
              Smart Cyber Scam Investigator
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in securely with Google to run AI forensic investigations, save reports to your private PostgreSQL vault, and export PDF case files.
            </p>
          </div>

          {firebaseUser ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/20 p-4 text-xs text-emerald-300 space-y-1">
                <p className="font-semibold">Signed in as {firebaseUser.email}</p>
                <p className="text-slate-400">Your session is active and synced.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="flex-1 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {authError && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-300">
                  {authError}
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleSignIn()}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In with Google</span>
              </button>
            </div>
          )}

          <div className="border-t border-slate-800/80 pt-5 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>We never ask for or store your banking passwords, OTPs, PINs, or CVVs.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>You can disable history persistence or delete all saved investigations anytime in Settings.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
