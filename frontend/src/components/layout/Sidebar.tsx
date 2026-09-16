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
  ChevronRight,
  Zap,
  Settings,
  Building2,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenLanding: () => void;
  onOpenArchitecture: () => void;
  onOpenDataImport?: () => void;
  onOpenOrgSettings?: () => void;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'demo') => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenLanding,
  onOpenArchitecture,
  onOpenDataImport,
  onOpenOrgSettings,
  onOpenAuthModal,
  alertCount = 12
}) => {
  const { tenant, isDemo, isLiveStreaming } = useAuth();

  const navGroups = [
    {
      category: 'Analytics',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sales', label: 'Sales Trends', icon: TrendingUp },
        { id: 'stores', label: 'Stores', icon: Store },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'profitability', label: 'Profit & Margins', icon: PieChart },
      ]
    },
    {
      category: 'Operations',
      items: [
        { id: 'inventory', label: 'Stock & Inventory', icon: Boxes },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'geography', label: 'Locations & Regions', icon: MapPin },
      ]
    },
    {
      category: 'Tools & Downloads',
      items: [
        { id: 'targets', label: 'Goals & Targets', icon: Target },
        { id: 'alerts', label: 'Alerts & Warnings', icon: AlertTriangle, badge: alertCount },
        { id: 'reports', label: 'Reports & Downloads', icon: FileText },
        { id: 'explorer', label: 'Explore Data', icon: Database },
      ]
    }
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
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group) => (
          <div key={group.category} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.category}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm font-semibold'
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
          </div>
        ))}
      </nav>

      {/* Bottom Metadata & Workspace Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
        {/* Active Tenant / Organization Badge */}
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{isDemo ? 'Public Demo' : 'Organization'}</span>
            <span className={isLiveStreaming ? 'text-emerald-400 flex items-center gap-1 font-mono' : 'text-slate-400'}>
              {isLiveStreaming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
              {isLiveStreaming ? 'Streaming' : 'Ready'}
            </span>
          </div>
          <div className="font-bold text-white truncate mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span className="truncate">{tenant?.name || 'Vertex Retail Group'}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Currency: <strong className="text-slate-300">{tenant?.currency || 'INR'}</strong></span>
            {isDemo && onOpenAuthModal && (
              <button
                onClick={() => onOpenAuthModal('register')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                + Connect Store
              </button>
            )}
          </div>
        </div>

        {/* Action: Data Ingest & Live Stream */}
        {onOpenDataImport && (
          <button
            onClick={onOpenDataImport}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/70"
          >
            <span className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Import Data / Live Stream</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>
        )}

        {/* Website & Architecture Switchers */}
        <button
          onClick={onOpenLanding}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <span className="flex items-center space-x-2">
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
            <span>Product Website</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </button>

        <button
          onClick={onOpenArchitecture}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
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
