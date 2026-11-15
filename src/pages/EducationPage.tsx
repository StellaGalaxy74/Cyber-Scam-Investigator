import { ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { EDUCATION_MODULES } from '../data/sampleInvestigations.ts';
import type { AppRoute } from '../types/navigation.ts';

interface EducationPageProps {
  onNavigate: (route: AppRoute) => void;
}

export function EducationPage({ onNavigate }: EducationPageProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
            <BookOpen className="h-4 w-4" />
            <span>Cyber Safety Education Center</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Recognize social engineering patterns before money or credentials leave your hands.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Modern scams rely on psychological triggers—artificial urgency, authority impersonation, fear, or unrealistic windfalls—more than technical hacking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('assistant')}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          <span>Ask AI About a Scam</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {EDUCATION_MODULES.map((mod) => (
          <article
            key={mod.id}
            className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-slate-100">{mod.title}</h3>
              <span
                className={`text-xs font-mono font-semibold ${
                  mod.riskLevel === 'CRITICAL' ? 'text-red-400' : 'text-orange-400'
                }`}
              >
                SEVERITY: {mod.riskLevel}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{mod.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-400">Common Warning Signs</p>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {mod.redFlags.map((flag, i) => (
                    <li key={i}>— {flag}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/15 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Protective Rule</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{mod.defenseRule}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
