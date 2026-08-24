import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: '01', key: 'step_1', label: 'QUERY PARSED', sub: 'GeoPlan Validated' },
  { id: '02', key: 'step_1', label: 'LOCATION IDENTIFIED', sub: 'AOI Resolved' },
  { id: '03', key: 'step_2', label: 'DATASET FOUND', sub: 'CDSE STAC Search' },
  { id: '04', key: 'step_3', label: 'SATELLITE RETRIEVED', sub: 'Sentinel-2 L2A' },
  { id: '05', key: 'step_5', label: 'INDEX COMPUTED', sub: 'Spectral Math' },
  { id: '06', key: 'guard', label: 'ANSWER GROUNDED', sub: 'Numeric Guard 100%' }
];

interface PipelineTrackerProps {
  status: 'idle' | 'loading' | 'completed' | 'failed';
  totalDurationMs?: number;
}

export default function PipelineTracker({
  status,
  totalDurationMs
}: PipelineTrackerProps) {
  return (
    <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-2xl font-mono text-xs shadow-xl space-y-2.5">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2 text-slate-400 text-[11px]">
        <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>ANALYSIS EXECUTION PIPELINE</span>
        </div>
        {totalDurationMs !== undefined && status === 'completed' && (
          <div className="flex items-center gap-1 text-cyan-400 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{totalDurationMs} ms total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {PIPELINE_STAGES.map((stage) => {
          const isCompleted = status === 'completed';
          const isRunning = status === 'loading';
          const isFailed = status === 'failed';

          let stageStyle = 'bg-[#070b14] border-[#1e293b] text-slate-400';
          let badgeStyle = 'bg-[#131b2e] text-slate-400';

          if (isCompleted) {
            stageStyle = 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 font-medium shadow-sm';
            badgeStyle = 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60';
          } else if (isRunning) {
            stageStyle = 'bg-[#0e2a38] border-cyan-500/60 text-cyan-200 animate-pulse font-medium shadow-sm';
            badgeStyle = 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/50';
          } else if (isFailed) {
            stageStyle = 'bg-red-950/40 border-red-800/60 text-red-300';
            badgeStyle = 'bg-red-900/60 text-red-300';
          }

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between space-y-1.5 transition-all ${stageStyle}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${badgeStyle}`}>
                  {stage.id}
                </span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {isRunning && <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />}
                {isFailed && <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              </div>

              <div>
                <div className="text-[11px] font-bold tracking-tight uppercase truncate">
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
