import {
  Compass,
  History,
  MapPin,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  GitCompare,
  Cpu,
  FileText,
  Radio
} from 'lucide-react';
import { ActiveTab, SystemHealth } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  historyCount: number;
  savedCount: number;
  health?: SystemHealth | null;
  onOpenHelp?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  historyCount,
  savedCount
}: SidebarProps) {
  const navItems = [
    {
      id: 'analysis' as ActiveTab,
      label: 'Mission Control',
      icon: Sparkles,
      desc: 'AI Natural Language & GIS Workstation',
      group: 'main'
    },
    {
      id: 'live-satellite' as ActiveTab,
      label: 'Live Satellite Data',
      icon: Radio,
      desc: 'Copernicus CDSE STAC Archive',
      group: 'data'
    },
    {
      id: 'change-detection' as ActiveTab,
      label: 'Change Detection',
      icon: GitCompare,
      desc: 'Bi-Temporal Hard Wipe Workspace',
      group: 'analytics'
    },
    {
      id: 'optical-sar' as ActiveTab,
      label: 'Optical + SAR',
      icon: Layers,
      desc: 'Multi-Sensor S2 & S1 Fusion',
      group: 'analytics'
    },
    {
      id: 'history' as ActiveTab,
      label: historyCount > 0 ? `Analysis History (${historyCount})` : 'Analysis History',
      icon: History,
      desc: 'Recent Analyzed Queries',
      group: 'workspace'
    },
    {
      id: 'saved' as ActiveTab,
      label: savedCount > 0 ? `Saved Areas (${savedCount})` : 'Saved Areas',
      icon: MapPin,
      desc: 'Strategic Geographic AOIs',
      group: 'workspace'
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Export',
      icon: FileText,
      desc: 'GeoJSON, JSON & Audit Ledgers',
      group: 'workspace'
    },
    {
      id: 'model-registry' as ActiveTab,
      label: 'Model & Tool Registry',
      icon: Cpu,
      desc: '10 Deterministic Operations & Guard',
      group: 'system'
    },
    {
      id: 'datasources' as ActiveTab,
      label: 'Data Sources: S2 / S1',
      icon: Database,
      desc: 'Sensors & Missions Specification',
      group: 'system'
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Diagnostics',
      icon: Settings,
      desc: 'Runtime Health & Configuration',
      group: 'system'
    }
  ];

  return (
    <aside
      className={`border-r border-slate-800/80 bg-[#080d1a] flex flex-col transition-all duration-300 relative z-30 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Header / Group Label */}
      {!collapsed && (
        <div className="px-4 pt-3 pb-1 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Navigation</span>
          <span className="text-cyan-400 font-mono">v1.0</span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-2 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? `${item.label} — ${item.desc}` : item.desc}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all text-left group relative cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/50 shadow-lg shadow-cyan-950/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 border border-transparent font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                  <span className="truncate text-xs">{item.label}</span>
                </div>
              )}

              {/* Collapsed Active Dot Indicator */}
              {collapsed && isActive && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse/Expand Toggle Button */}
      <div className="p-2 border-t border-slate-800/80 flex items-center justify-end bg-[#060a14]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 px-2 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors text-xs cursor-pointer font-sans"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-xs">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
