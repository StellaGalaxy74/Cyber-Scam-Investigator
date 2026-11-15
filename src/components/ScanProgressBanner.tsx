import { Shield } from 'lucide-react';

interface ScanProgressBannerProps {
  active: boolean;
  label: string;
}

export function ScanProgressBanner({ active, label }: ScanProgressBannerProps) {
  if (!active) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-xl border border-cyan-500/40 bg-[#0B1120] p-5"
    >
      <div
        aria-hidden="true"
        className="scan-beam pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-cyan-400/20 via-cyan-400/5 to-transparent"
      />
      <div className="relative flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Running structural verification, lexical checks, and AI behavioral analysis without executing untrusted links or files.
          </p>
        </div>
      </div>
    </div>
  );
}
