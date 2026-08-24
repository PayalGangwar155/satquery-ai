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

export type ActiveTab = 'analysis' | 'explore' | 'history' | 'saved' | 'datasources' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  historyCount: number;
  savedCount: number;
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
      badge: null,
      desc: 'Natural Language Query & Index'
    },
    {
      id: 'explore' as ActiveTab,
      label: 'Explore Map',
      icon: Compass,
      badge: null,
      desc: 'Interactive Map & Overlays'
    },
    {
      id: 'history' as ActiveTab,
      label: 'Analysis History',
      icon: History,
      badge: historyCount > 0 ? historyCount : null,
      desc: 'Recent Analyzed Queries'
    },
    {
      id: 'saved' as ActiveTab,
      label: 'Saved Areas',
      icon: MapPin,
      badge: savedCount > 0 ? savedCount : null,
      desc: 'Pre-configured Regions'
    },
    {
      id: 'datasources' as ActiveTab,
      label: 'Data Sources',
      icon: Database,
      badge: 'S2/S1',
      desc: 'Sensors & Missions'
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Settings',
      icon: Settings,
      badge: null,
      desc: 'Pipeline & Engine Diagnostics'
    }
  ];

  return (
    <aside
      className={`border-r border-[#1e293b] bg-[#0c1322] flex flex-col transition-all duration-300 relative z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2.5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? `${item.label} — ${item.desc}` : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all text-left group relative cursor-pointer ${
                isActive
                  ? 'bg-[#0e2a38] text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e] border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#070b14] border border-[#1e293b] text-cyan-400">
                      {item.badge}
                    </span>
                  )}
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

      {/* Ground Station Telemetry Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-[#1e293b] bg-[#070b14]/60 font-mono text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">COPERNICUS STAC:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">NUMERIC GUARD:</span>
            <span className="text-cyan-400 font-bold">STRICT (0%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CONFIDENCE:</span>
            <span className="text-slate-300">DETERMINISTIC</span>
          </div>
        </div>
      )}

      {/* Collapse/Expand Toggle Button */}
      <div className="p-2 border-t border-[#1e293b] flex items-center justify-end bg-[#070b14]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 px-2 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-[#131b2e] rounded-lg transition-colors font-mono text-xs cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px]">COLLAPSE</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
