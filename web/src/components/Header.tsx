import { useState, useEffect } from 'react';
import {
  Satellite,
  ShieldCheck,
  Database,
  BookOpen,
  HelpCircle,
  Settings as SettingsIcon,
  Radio,
  Clock
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
  const [utcTime, setUtcTime] = useState<string>('');

  // Live ticking UTC time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-[#080d1a]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xl sticky top-0 z-50">
      {/* Left: Brand Identity & Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="p-2 bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center shrink-0">
          <Satellite className="w-5 h-5 animate-pulse text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1 font-sans">
              <span>SatQuery</span> <span className="text-cyan-400 font-extrabold">AI</span>
            </h1>
            <span className="text-slate-600 font-normal">·</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-semibold">
              SIH26167
            </span>
            <span className="text-slate-600 font-normal">·</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${
              isReplay
                ? 'bg-amber-950/50 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
            }`}>
              {isReplay ? 'Offline Replay' : 'Live CDSE'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono tracking-tight pt-0.5">
            <span className="text-cyan-400/90 font-semibold tracking-wider uppercase text-[10px]">
              Remote Sensing Intelligence
            </span>
            <span>&bull;</span>
            <span className="text-slate-400">Earth Observation Ground Station</span>
          </div>
        </div>
      </div>

      {/* Center: Live Telemetry Status Chips & UTC Clock */}
      <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono">
        {/* UTC Clock */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-xs text-cyan-200">{utcTime || '00:00:00 UTC'}</span>
        </div>

        {/* System Online */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 text-xs font-sans">System Online</span>
        </div>

        {/* Data Pipeline Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 shadow-sm">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs text-slate-300">CDSE STAC &bull; S2/S1</span>
        </div>

        {/* Numeric Grounded Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/50 border border-cyan-500/40 rounded-lg text-cyan-300 shadow-sm font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs">Grounded 100%</span>
        </div>

        {/* Resolution */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-400 shadow-sm">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs">10m GSD</span>
        </div>
      </div>

      {/* Right: Quick Action Triggers */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDataSources}
          title="Data Sources & Spectral Bands"
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-slate-200 hover:text-cyan-300 transition-colors shadow-sm flex items-center gap-1.5 text-xs cursor-pointer font-medium font-sans"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Sensors</span>
        </button>

        <button
          onClick={onOpenHelp}
          title="Problem Statement & Architecture Guide"
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-slate-200 hover:text-cyan-300 transition-colors shadow-sm flex items-center gap-1.5 text-xs cursor-pointer font-medium font-sans"
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
