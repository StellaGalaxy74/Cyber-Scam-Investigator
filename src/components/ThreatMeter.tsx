import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ConfidenceLevel, ThreatClassification } from '../types/investigation.ts';

interface ThreatMeterProps {
  riskScore: number;
  scamProbability: number;
  classification: ThreatClassification;
  confidence: ConfidenceLevel;
}

const CLASSIFICATION_STYLES: Record<
  ThreatClassification,
  { stroke: string; text: string; bar: string; label: string; Icon: typeof ShieldCheck }
> = {
  LOW: {
    stroke: '#10B981',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    label: 'LOW RISK',
    Icon: CheckCircle2,
  },
  MEDIUM: {
    stroke: '#F59E0B',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    label: 'MEDIUM RISK',
    Icon: AlertTriangle,
  },
  HIGH: {
    stroke: '#F97316',
    text: 'text-orange-400',
    bar: 'bg-orange-500',
    label: 'HIGH RISK',
    Icon: ShieldAlert,
  },
  CRITICAL: {
    stroke: '#EF4444',
    text: 'text-red-400',
    bar: 'bg-red-500',
    label: 'CRITICAL THREAT',
    Icon: ShieldAlert,
  },
};

export function ThreatMeter({
  riskScore,
  scamProbability,
  classification,
  confidence,
}: ThreatMeterProps) {
  const style = CLASSIFICATION_STYLES[classification] || CLASSIFICATION_STYLES.MEDIUM;
  const Icon = style.Icon;
  const clamped = Math.max(0, Math.min(100, riskScore));
  const radius = 52;
  const circumference = Math.PI * radius; // semi-circle
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="bg-[#0B1120] border border-slate-800/90 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-36 h-24 shrink-0 flex flex-col items-center justify-end">
        <svg viewBox="0 0 130 76" className="w-full h-full overflow-visible" aria-hidden="true">
          <path
            d="M 13 65 A 52 52 0 0 1 117 65"
            fill="none"
            stroke="#1E293B"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 13 65 A 52 52 0 0 1 117 65"
            fill="none"
            stroke={style.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute bottom-0 text-center">
          <div className={`font-mono text-3xl font-bold tabular-nums leading-none ${style.text}`}>
            {clamped}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">RISK / 100</div>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className={`inline-flex items-center gap-2 font-semibold text-sm ${style.text}`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{style.label}</span>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            Confidence: <strong className="text-slate-200">{confidence}</strong>
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Scam Probability</span>
            <span className="font-mono font-medium text-slate-200 tabular-nums">
              {scamProbability}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${style.bar}`}
              style={{
                width: `${Math.max(0, Math.min(100, scamProbability))}%`,
                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
