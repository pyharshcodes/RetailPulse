import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Store,
  Package,
  Users,
  Boxes,
  PieChart,
  MapPin,
  Target,
  AlertTriangle,
  FileText,
  Database,
  ExternalLink,
  Code2,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenLanding: () => void;
  onOpenArchitecture: () => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenLanding,
  onOpenArchitecture,
  alertCount = 12
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'profitability', label: 'Profitability', icon: PieChart },
    { id: 'geography', label: 'Geography', icon: MapPin },
    { id: 'targets', label: 'Targets', icon: Target },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'explorer', label: 'Data Explorer', icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none">
      {/* Product Branding */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
            RP
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center">
              RETAILPULSE
              <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              Performance Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Analytics Command Center
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white text-brand-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Metadata & Portfolio Links */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        {/* Active Demo Tenant */}
        <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Demo Enterprise</div>
          <div className="font-semibold text-white truncate mt-0.5">Vertex Retail Group</div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>20 Stores • 89k+ Txns</span>
            <span className="text-emerald-400 font-mono">Live</span>
          </div>
        </div>

        {/* Website & Architecture Switchers */}
        <button
          onClick={onOpenLanding}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        >
          <span className="flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Product Website</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </button>

        <button
          onClick={onOpenArchitecture}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        >
          <span className="flex items-center space-x-2">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Technical Architecture</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </aside>
  );
};
