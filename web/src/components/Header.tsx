import {
  Satellite,
  ShieldCheck,
  Database,
  BookOpen,
  HelpCircle,
  Settings as SettingsIcon,
  Radio
} from 'lucide-react';
import { SystemHealth } from '../types';

interface HeaderProps {
  health: SystemHealth | null;
  onOpenHelp: () => void;
  onOpenDataSources: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  health,
  onOpenHelp,
  onOpenDataSources,
  onOpenSettings
}: HeaderProps) {
  const isReplay = health?.offline_replay ?? true;

  return (
    <header className="border-b border-slate-800/80 bg-[#0c1322]/95 backdrop-blur-md px-5 py-3 flex items-center justify-between shadow-xl sticky top-0 z-50">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center justify-center">
          <Satellite className="w-5 h-5 animate-pulse text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              SatQuery <span className="text-cyan-400 font-extrabold">AI</span>
            </h1>
            <span className="text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-md font-mono font-semibold">
              SIH26167
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-medium border ${
              isReplay
                ? 'bg-amber-950/50 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
            }`}>
              {isReplay ? 'Offline Replay' : 'Live CDSE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-normal pt-0.5">
            Natural-Language Intelligence for Earth Observation
          </p>
        </div>
      </div>

      {/* Center: Live Telemetry Status Chips */}
      <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono">
        {/* System Online */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 text-xs">System Online</span>
        </div>

        {/* Data Pipeline Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 shadow-sm">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-300">CDSE STAC &bull; Sentinel-2</span>
        </div>

        {/* Numeric Grounded Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/50 border border-cyan-500/40 rounded-lg text-cyan-300 shadow-sm font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs">Grounded 100%</span>
        </div>

        {/* Resolution */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-400 shadow-sm">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs">10m Resolution</span>
        </div>
      </div>

      {/* Right: Quick Action Triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDataSources}
          title="Data Sources & Spectral Bands"
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-slate-200 hover:text-cyan-300 transition-colors shadow-sm flex items-center gap-1.5 text-xs cursor-pointer font-medium"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Data Sources</span>
        </button>

        <button
          onClick={onOpenHelp}
          title="Problem Statement & Architecture Guide"
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-slate-200 hover:text-cyan-300 transition-colors shadow-sm flex items-center gap-1.5 text-xs cursor-pointer font-medium"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Docs</span>
        </button>

        <button
          onClick={onOpenSettings}
          title="System Settings & Diagnostics"
          className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shadow-sm cursor-pointer"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
