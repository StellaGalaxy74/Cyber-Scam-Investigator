import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthGateCardProps {
  title?: string;
  description?: string;
}

export function AuthGateCard({
  title = 'Sign in to run live forensic investigations',
  description = 'Investigations are verified server-side, rate-limited for safety, and stored securely in your private investigation history.',
}: AuthGateCardProps) {
  const { signInWithGoogle, authError } = useAuth();

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>

      {authError && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
          {authError}
        </p>
      )}

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 whitespace-nowrap shrink-0"
      >
        <LogIn className="h-4 w-4" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
}
