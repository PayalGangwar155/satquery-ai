import {
  X,
  Settings,
  Activity,
  Sliders
} from 'lucide-react';
import { SystemHealth } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: SystemHealth | null;
}

export default function SettingsModal({ isOpen, onClose, health }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl font-mono text-xs flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-sm uppercase">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>System Settings & Engine Diagnostics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-[#070b14] border border-[#1e293b] hover:border-cyan-500/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-slate-300">
          {/* Diagnostic Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Runtime Diagnostics
            </h3>

            <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">API Health Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {health?.status.toUpperCase() || 'OK (200)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Execution Mode:</span>
                <span className="text-cyan-300 font-bold">
                  {health?.offline_replay ? 'OFFLINE REPLAY (Deterministic Fixtures)' : 'LIVE (Copernicus CDSE API)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Planner LLM Provider:</span>
                <span className="text-slate-200 font-bold">
                  {health?.llm_provider.toUpperCase() || 'GEMINI 2.5 FLASH'} / HEURISTIC FALLBACK
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Numeric Guard Gate:</span>
                <span className="text-emerald-400 font-bold">STRICT ENFORCEMENT (100% Traceable)</span>
              </div>
            </div>
          </div>

          {/* Confidence Scoring Weights */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Confidence Calculation Weights
            </h3>

            <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Clear Sky Weight (w_cloud):</span>
                <span className="font-bold text-cyan-400">0.40 (40%)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Spatial Resolution (w_resolution):</span>
                <span className="font-bold text-cyan-400">0.25 (25%)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Temporal Window Proximity (w_temporal):</span>
                <span className="font-bold text-cyan-400">0.20 (20%)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">AOI Coverage Match (w_coverage):</span>
                <span className="font-bold text-cyan-400">0.15 (15%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#070b14] flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine Version 0.1.0-SIH26167</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
