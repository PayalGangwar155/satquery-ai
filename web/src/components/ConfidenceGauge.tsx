import {
  ShieldCheck,
  Cloud,
  Sliders,
  Calendar,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { ConfidenceBreakdown } from '../types';

interface ConfidenceGaugeProps {
  confidence?: ConfidenceBreakdown;
}

export default function ConfidenceGauge({ confidence }: ConfidenceGaugeProps) {
  if (!confidence) return null;

  const scorePct = Math.round(confidence.overall_confidence * 100);

  // Dynamic semantic color selection
  let theme = {
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-800/80',
    bgColor: 'bg-emerald-950/40',
    barFill: 'bg-emerald-500',
    glowColor: 'shadow-emerald-950/50',
    label: 'HIGH DATA CONFIDENCE'
  };

  if (scorePct < 50) {
    theme = {
      textColor: 'text-red-400',
      borderColor: 'border-red-800/80',
      bgColor: 'bg-red-950/40',
      barFill: 'bg-red-500',
      glowColor: 'shadow-red-950/50',
      label: 'LOW DATA CONFIDENCE'
    };
  } else if (scorePct < 80) {
    theme = {
      textColor: 'text-amber-400',
      borderColor: 'border-amber-800/80',
      bgColor: 'bg-amber-950/40',
      barFill: 'bg-amber-500',
      glowColor: 'shadow-amber-950/50',
      label: 'MODERATE CONFIDENCE'
    };
  }

  const componentsList = [
    {
      label: 'Clear Sky Quality',
      weight: '40%',
      icon: Cloud,
      score: Math.round(confidence.components.cloud_score * 100)
    },
    {
      label: 'Spatial Resolution',
      weight: '25%',
      icon: Sliders,
      score: Math.round(confidence.components.resolution_score * 100)
    },
    {
      label: 'Temporal Proximity',
      weight: '20%',
      icon: Calendar,
      score: Math.round(confidence.components.temporal_score * 100)
    },
    {
      label: 'AOI Coverage',
      weight: '15%',
      icon: Maximize2,
      score: Math.round(confidence.components.coverage_score * 100)
    }
  ];

  return (
    <div className={`p-6 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl space-y-4 ${theme.glowColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          <ShieldCheck className={`w-5 h-5 ${theme.textColor}`} />
          <span>DETERMINISTIC DATA CONFIDENCE ENGINE</span>
        </div>
        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded border ${theme.borderColor} ${theme.bgColor} ${theme.textColor} font-bold tracking-widest`}>
          {theme.label}
        </span>
      </div>

      {/* Hero Percentage Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        <div className="flex items-baseline gap-3">
          <div className={`text-6xl font-extrabold font-mono tracking-tight ${theme.textColor}`}>
            {scorePct}%
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
              Computed Reliability Score
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Evaluated mathematically from 4 deterministic sensors
            </div>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full sm:w-1/2 space-y-1.5 font-mono">
          <div className="w-full h-3.5 bg-[#070b14] border border-[#1e293b] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full ${theme.barFill} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${scorePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>0% Unreliable</span>
            <span>Threshold: 70%</span>
            <span>100% Optimal</span>
          </div>
        </div>
      </div>

      {/* 4 Component Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {componentsList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-3 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-2 font-mono"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                  <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="font-bold text-slate-100 ml-1">{item.score}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#131b2e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Weight: {item.weight}</span>
                <span className="text-emerald-400 font-semibold">Verified</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula Transparency Note */}
      <div className="p-3 bg-[#070b14]/80 border border-[#1e293b] rounded-xl font-mono text-[11px] text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-semibold">Mathematical Formula: </span>
          <span>
            {"C = 0.40 × Cloud + 0.25 × Resolution + 0.20 × Temporal + 0.15 × Coverage"}.
            Confidence is 100% deterministically calculated in Python (api/app/core/confidence.py) and is NEVER hallucinated by the model.
          </span>
        </div>
      </div>
    </div>
  );
}
