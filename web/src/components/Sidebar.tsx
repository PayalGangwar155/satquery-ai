import {
  Compass,
  History,
  MapPin,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SystemHealth } from '../types';

export type ActiveTab = 'analysis' | 'explore' | 'history' | 'saved' | 'datasources' | 'settings';

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
      label: 'New Analysis',
      icon: Sparkles,
      desc: 'Query & Index Analysis'
    },
    {
      id: 'explore' as ActiveTab,
      label: 'Explore Map',
      icon: Compass,
      desc: 'Interactive Satellite Map'
    },
    {
      id: 'history' as ActiveTab,
      label: historyCount > 0 ? `Analysis History (${historyCount})` : 'Analysis History',
      icon: History,
      desc: 'Recent Analyzed Queries'
    },
    {
      id: 'saved' as ActiveTab,
      label: savedCount > 0 ? `Saved Areas (${savedCount})` : 'Saved Areas',
      icon: MapPin,
      desc: 'Pre-configured Regions'
    },
    {
      id: 'datasources' as ActiveTab,
      label: 'Data Sources: S2 / S1',
      icon: Database,
      desc: 'Sensors & Missions'
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Settings',
      icon: Settings,
      desc: 'Engine Diagnostics'
    }
  ];

  return (
    <aside
      className={`border-r border-slate-800/80 bg-[#090d18] flex flex-col transition-all duration-300 relative z-30 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-3 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? `${item.label} — ${item.desc}` : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all text-left group relative cursor-pointer ${
                isActive
                  ? 'bg-[#0e2a38] text-cyan-200 border border-cyan-500/40 shadow-lg shadow-cyan-950/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <span className="truncate text-sm">{item.label}</span>
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
      <div className="p-2 border-t border-slate-800/80 flex items-center justify-end bg-[#070b14]">
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
