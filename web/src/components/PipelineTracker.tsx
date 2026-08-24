import { CheckCircle2, Clock, AlertCircle, PlayCircle } from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: '01', key: 'step_1', label: 'Query Parsed', sub: 'GeoPlan Validated' },
  { id: '02', key: 'step_1', label: 'Location Resolved', sub: 'AOI Geocoded' },
  { id: '03', key: 'step_2', label: 'STAC Discovery', sub: 'CDSE Catalogue' },
  { id: '04', key: 'step_3', label: 'Scene Selected', sub: 'Lowest Cloud %' },
  { id: '05', key: 'step_5', label: 'Index Computed', sub: 'Spectral Math' },
  { id: '06', key: 'guard', label: 'Answer Grounded', sub: 'Numeric Guard 100%' }
];

interface PipelineTrackerProps {
  status: 'idle' | 'loading' | 'completed' | 'failed';
  totalDurationMs?: number;
}

export default function PipelineTracker({
  status,
  totalDurationMs
}: PipelineTrackerProps) {
  const roundedDuration = totalDurationMs !== undefined ? Number(totalDurationMs).toFixed(1) : null;

  return (
    <div className="p-3.5 sm:p-4 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-xs">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Execution Pipeline Stepper</span>
        </div>
        {roundedDuration !== null && status === 'completed' && (
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{roundedDuration} ms total runtime</span>
          </div>
        )}
      </div>

      {/* Stepper Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-0.5">
        {PIPELINE_STAGES.map((stage) => {
          const isCompleted = status === 'completed';
          const isRunning = status === 'loading';
          const isFailed = status === 'failed';

          let cardStyle = 'bg-[#070b14] border-slate-800/80 text-slate-400';
          let badgeStyle = 'bg-slate-800 text-slate-400';

          if (isCompleted) {
            cardStyle = 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 font-medium shadow-sm';
            badgeStyle = 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/60';
          } else if (isRunning) {
            cardStyle = 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 animate-pulse font-medium shadow-sm';
            badgeStyle = 'bg-cyan-900/70 text-cyan-300 border border-cyan-500/50';
          } else if (isFailed) {
            cardStyle = 'bg-red-950/40 border-red-800/60 text-red-300';
            badgeStyle = 'bg-red-900/70 text-red-300';
          }

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 transition-all ${cardStyle}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${badgeStyle}`}>
                  {stage.id}
                </span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {isRunning && <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />}
                {isFailed && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                {status === 'idle' && <PlayCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-200 tracking-tight truncate">
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {stage.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
