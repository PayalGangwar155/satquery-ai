import {
  X,
  HelpCircle,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl font-mono text-xs flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-sm uppercase">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>SatQuery AI — Platform Architecture & SIH26167 Specification</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-[#070b14] border border-[#1e293b] hover:border-cyan-500/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-slate-300">
          {/* Section 1: SIH Problem Statement */}
          <div className="p-4 bg-[#070b14] border border-cyan-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span>PROBLEM STATEMENT: SIH26167</span>
              <span className="text-[10px] bg-[#0e2a38] text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                SMART INDIA HACKATHON 2026
              </span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              <strong>SatQuery AI</strong> is a vision-language assistant for remote sensing and Earth observation data. It answers natural-language questions about satellite observations by planning and executing real deterministic geospatial operations against Copernicus satellite archives, presenting findings with complete mathematical evidence, provenance, and data confidence.
            </p>
          </div>

          {/* Section 2: Core Architecture Flow */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> 1. End-to-End Analysis Workflow
            </h3>

            <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">1</span>
                <span><strong>Natural Language Query:</strong> User asks a question (e.g. "Analyze vegetation health in Delhi").</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">2</span>
                <span><strong>GeoPlan DAG Construction:</strong> LLM/Planner translates intent into a typed, validated Pydantic DAG graph.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">3</span>
                <span><strong>Deterministic Operation Registry:</strong> Executes 6-10 validated Python operations (`resolve_aoi`, `search_scenes`, `compute_index`, `zonal_stats`).</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">4</span>
                <span><strong>Deterministic Confidence Calculation:</strong> Mathematical score computed from cloud, spatial, and temporal metrics.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-[10px]">5</span>
                <span><strong>Numeric Guard Gate:</strong> Strict regex scanner enforces 100% evidence traceability on all numbers in generated text.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Hard Guarantees */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 2. Hard Correctness Guarantees (Zero Fabrication)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-1.5">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> The Model Never Measures
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  The LLM never calculates NDVI, pixel counts, areas, or dates. All measurements come from deterministic raster math operations.
                </p>
              </div>

              <div className="p-3.5 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-1.5">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Numeric Guard Gate
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Every number shown in the narrative must match operation evidence. Disallowed numbers are automatically removed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#070b14] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fully compliant with SPEC.md and AGENTS.md rules</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
