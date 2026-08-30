import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Radio
} from 'lucide-react';
import { QueryResponse } from '../types';

interface ExecutionStatusPanelProps {
  response: QueryResponse | null;
  loading: boolean;
  status: 'idle' | 'loading' | 'completed' | 'failed';
}

export default function ExecutionStatusPanel({
  response,
  loading,
  status
}: ExecutionStatusPanelProps) {
  const indexName = response?.evidence?.step_5?.index_name || 'NDVI';
  const selectedScene = response?.evidence?.step_3?.selected_scene;
  const collection = selectedScene?.collection || 'Sentinel-2 L2A';
  const confPct = response?.confidence?.overall_confidence !== undefined
    ? `${Math.round(response.confidence.overall_confidence * 100)}%`
    : null;

  let taskLabel = 'Vegetation Analysis';
  if (indexName === 'NDWI') taskLabel = 'Water & Flood Delineation';
  else if (indexName === 'NDBI') taskLabel = 'Urban Built-Up Mapping';
  else if (indexName === 'CHANGE') taskLabel = 'Bi-Temporal Change Analysis';

  return (
    <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-lg font-sans text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-center">
        {/* Task */}
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold block">
            Active Task
          </span>
          <span className="font-semibold text-slate-100 truncate block">
            {status === 'idle' ? 'Standby' : taskLabel}
          </span>
        </div>

        {/* Model */}
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            Model / Engine
          </span>
          <span className="font-mono text-cyan-300 font-semibold text-[11px] truncate block">
            GeoPlan + Guard
          </span>
        </div>

        {/* Input */}
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Sensor Input
          </span>
          <span className="font-mono text-slate-200 text-[11px] truncate block">
            {collection} (10m)
          </span>
        </div>

        {/* Status */}
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold block">
            Execution State
          </span>
          <div className="flex items-center gap-1.5">
            {status === 'completed' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 border border-emerald-800/80 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            ) : status === 'loading' || loading ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/70 border border-cyan-500/60 text-cyan-300 animate-pulse">
                <div className="w-2 h-2 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                Executing
              </span>
            ) : status === 'failed' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/70 border border-red-800/80 text-red-400">
                <AlertCircle className="w-3 h-3" /> Error
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-400">
                <Radio className="w-3 h-3 text-slate-500" /> Standby
              </span>
            )}
          </div>
        </div>

        {/* Confidence */}
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-semibold block">
            Data Confidence
          </span>
          <span className="font-mono font-bold text-emerald-400 text-xs block">
            {confPct ? `${confPct} (Computed)` : 'Pending Run'}
          </span>
        </div>
      </div>
    </div>
  );
}
