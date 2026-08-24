import { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Layers,
  ExternalLink,
  MapPin,
  Search,
  Filter,
  Image,
  BarChart2,
  Activity,
  Zap,
  FileText,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { OperationResult } from '../types';

interface PlanTapeProps {
  stepResults: OperationResult[];
  totalDurationMs?: number;
}

const OP_ICONS: Record<string, any> = {
  resolve_aoi: MapPin,
  search_scenes: Search,
  pick_scenes: Filter,
  render_bands: Image,
  compute_index: BarChart2,
  zonal_stats: Activity,
  time_series: Zap,
  change_detect: Layers,
  semantic_search: Sparkles,
  vlm_describe: FileText,
};

const OP_LABELS: Record<string, string> = {
  resolve_aoi: 'AOI Resolution & Geocoding',
  search_scenes: 'CDSE STAC Scene Discovery',
  pick_scenes: 'Scene Selection (Lowest Cloud)',
  render_bands: 'RGB / False Color Band Render',
  compute_index: 'Spectral Index Raster Math',
  zonal_stats: 'Zonal Polygon Statistics',
  time_series: 'Multi-Temporal Aggregation',
  change_detect: 'Bi-Temporal Change Detection',
  semantic_search: 'SigLIP Semantic Tile Search',
  vlm_describe: 'Grounded Visual Narrative',
};

export default function PlanTape({ stepResults, totalDurationMs }: PlanTapeProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const toggleExpand = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const handleCopyJson = (stepId: string, output: any) => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c1322] font-mono text-xs shadow-2xl">
      {/* Tape Header */}
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between bg-[#070b14]/95 backdrop-blur">
        <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>GEOPLAN EXECUTION LOG</span>
        </div>
        {totalDurationMs !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] rounded-lg text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{totalDurationMs} ms</span>
          </div>
        )}
      </div>

      {/* Vertical Execution Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {stepResults.length === 0 ? (
          <div className="p-8 border border-[#1e293b] rounded-2xl bg-[#070b14]/60 text-slate-500 text-center space-y-3 mt-4">
            <Terminal className="w-10 h-10 text-slate-700 mx-auto animate-pulse" />
            <p className="text-xs text-slate-300 font-sans font-medium">Awaiting satellite query execution...</p>
            <p className="text-[11px] text-slate-500 font-mono">
              GeoPlan DAG execution steps, validated arguments, and deterministic outputs will stream here.
            </p>
          </div>
        ) : (
          stepResults.map((step, idx) => {
            const isExpanded = expandedStep === step.step_id;
            const OpIcon = OP_ICONS[step.op] || Terminal;
            const friendlyName = OP_LABELS[step.op] || step.op;
            const isLast = idx === stepResults.length - 1;

            return (
              <div key={step.step_id} className="relative pl-6">
                {/* Vertical Connector Line */}
                {!isLast && (
                  <div className="absolute left-2.5 top-7 bottom-0 w-0.5 bg-[#1e293b]" />
                )}

                {/* Node Status Dot */}
                <div className="absolute left-0 top-1.5 p-1 bg-[#070b14] border border-[#1e293b] rounded-full z-10">
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : step.status === 'failed' ? (
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  )}
                </div>

                {/* Step Card */}
                <div className={`border rounded-xl bg-[#070b14] overflow-hidden transition-all shadow-md ${
                  isExpanded ? 'border-cyan-500/50 shadow-cyan-950/40' : 'border-[#1e293b] hover:border-slate-700'
                }`}>
                  <button
                    onClick={() => toggleExpand(step.step_id)}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#0f172a] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <OpIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-bold text-slate-200 text-xs uppercase">{step.step_id}</span>
                      <span className="text-slate-300 font-medium text-xs font-sans truncate">{friendlyName}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
                      <span className="px-2 py-0.5 bg-[#0f172a] border border-[#1e293b] rounded font-mono text-cyan-300 font-bold text-[11px]">
                        {step.duration_ms} ms
                      </span>
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {/* Expanded Step Provenance & Raw Evidence Output */}
                  {isExpanded && (
                    <div className="p-3.5 border-t border-[#1e293b] bg-[#0f172a]/60 space-y-3 text-xs text-slate-300">
                      {step.provenance && (
                        <div className="p-3 bg-[#070b14] border border-[#1e293b] rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5" /> Source: {step.provenance.source_name}
                            </span>
                            <span className="text-[10px] text-slate-500">{step.provenance.retrieved_at}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                            <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" /> {step.provenance.source_url}
                          </p>
                          {step.provenance.scene_id && (
                            <div className="text-xs text-slate-300 font-mono pt-1 border-t border-[#1e293b]">
                              Scene ID: <span className="text-amber-300 font-bold">{step.provenance.scene_id}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Raw Output JSON snippet with Copy Button */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">
                            Deterministic Output JSON
                          </span>
                          <button
                            onClick={() => handleCopyJson(step.step_id, step.output)}
                            className="px-2 py-0.5 bg-[#070b14] hover:bg-[#1e293b] border border-[#1e293b] rounded text-[10px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-mono cursor-pointer"
                          >
                            {copiedStep === step.step_id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Copy JSON</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-[#070b14] border border-[#1e293b] rounded-lg text-[11px] text-emerald-400/90 overflow-x-auto leading-relaxed max-h-56">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
