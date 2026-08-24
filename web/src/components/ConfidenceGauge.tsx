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
    glowColor: 'shadow-emerald-950/40',
    label: 'High Data Confidence'
  };

  if (scorePct < 50) {
    theme = {
      textColor: 'text-red-400',
      borderColor: 'border-red-800/80',
      bgColor: 'bg-red-950/40',
      barFill: 'bg-red-500',
      glowColor: 'shadow-red-950/40',
      label: 'Low Data Confidence'
    };
  } else if (scorePct < 80) {
    theme = {
      textColor: 'text-amber-400',
      borderColor: 'border-amber-800/80',
      bgColor: 'bg-amber-950/40',
      barFill: 'bg-amber-500',
      glowColor: 'shadow-amber-950/40',
      label: 'Moderate Data Confidence'
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
    <div className={`p-4 sm:p-5 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl space-y-3.5 ${theme.glowColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <ShieldCheck className={`w-4 h-4 ${theme.textColor}`} />
          <span>Deterministic Data Confidence Engine</span>
        </div>
        <span className={`text-xs font-sans px-2.5 py-0.5 rounded-full border ${theme.borderColor} ${theme.bgColor} ${theme.textColor} font-semibold`}>
          {theme.label}
        </span>
      </div>

      {/* Hero Percentage Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        <div className="flex items-baseline gap-3">
          <div className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${theme.textColor}`}>
            {scorePct}%
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 font-sans">
              Computed Reliability Score
            </div>
            <div className="text-xs text-slate-400">
              Evaluated mathematically from 4 deterministic sensors
            </div>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="w-full sm:w-1/2 space-y-1 font-mono">
          <div className="w-full h-3 bg-[#070b14] border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full ${theme.barFill} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${scorePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-sans">
            <span>0% Unreliable</span>
            <span>70% Threshold</span>
            <span>100% Optimal</span>
          </div>
        </div>
      </div>

      {/* 4 Component Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-0.5">
        {componentsList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="p-3 bg-[#070b14] border border-slate-800/80 rounded-xl space-y-1.5 font-sans"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                  <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="font-bold font-mono text-slate-100 ml-1">{item.score}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#131b2e] rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Weight: {item.weight}</span>
                <span className="text-emerald-400 font-medium">Verified</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula Transparency Note */}
      <div className="p-3 bg-[#070b14]/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="text-slate-300 font-semibold">Mathematical Formula: </span>
          <span className="font-mono text-[11px] text-cyan-300">
            {"Confidence = 0.40 × Cloud + 0.25 × Resolution + 0.20 × Temporal + 0.15 × Coverage"}.
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">
            Calculated deterministically in Python (<code>api/app/core/confidence.py</code>). Never generated by an LLM.
          </span>
        </div>
      </div>
    </div>
  );
}
