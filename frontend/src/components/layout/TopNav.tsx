import React, { useState } from 'react';
import {
  Search,
  Download,
  FileText,
  Sparkles,
  Filter,
  Sun,
  Moon,
  Zap,
  Building2,
  ChevronDown,
  LogOut,
  Settings,
  User,
  PlusCircle
} from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface TopNavProps {
  activeTab: string;
  onOpenSearch: () => void;
  onOpenCaseStudy: () => void;
  filterBarOpen: boolean;
  onToggleFilterBar: () => void;
  onOpenDataImport?: () => void;
  onOpenOrgSettings?: () => void;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'demo') => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onOpenSearch,
  onOpenCaseStudy,
  filterBarOpen,
  onToggleFilterBar,
  onOpenDataImport,
  onOpenOrgSettings,
  onOpenAuthModal,
}) => {
  const { filters, activeFilterCount } = useFilters();
  const { theme, toggleTheme } = useTheme();
  const { tenant, user, isDemo, logout, isLiveStreaming } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const titleMap: Record<string, { title: string; desc: string }> = {
    overview: {
      title: 'Overview',
      desc: 'High-level executive telemetry for sales, margins, and store footprints.',
    },
    sales: {
      title: 'Sales Trends',
      desc: 'Track sales pace across channels, payments, and day-of-week seasonality.',
    },
    stores: {
      title: 'Store Performance',
      desc: 'Compare revenue, target achievement, and profitability across stores.',
    },
    products: {
      title: 'Products',
      desc: 'Top-selling SKUs, high-margin drivers, and underperforming catalog items.',
    },
    customers: {
      title: 'Customer Habits',
      desc: 'Analyze basket values, repeat customer cohorts, and sales channels.',
    },
    inventory: {
      title: 'Stock & Inventory',
      desc: 'Real-time stock health, stockout risk alarms, and aging inventory.',
    },
    profitability: {
      title: 'Profit & Margins',
      desc: 'COGS waterfall breakdown and product margin health analysis.',
    },
    geography: {
      title: 'Locations & Regions',
      desc: 'Geographic sales clusters and regional margin distribution.',
    },
    targets: {
      title: 'Goals & Targets',
      desc: 'Monthly pacing against store and category performance quotas.',
    },
    alerts: {
      title: 'Alerts & Warnings',
      desc: 'Autonomous anomaly detection for margin dips and inventory risks.',
    },
    reports: {
      title: 'Reports & Downloads',
      desc: 'Download board-ready PDF briefs and filtered raw transaction CSVs.',
    },
    explorer: {
      title: 'Explore Data',
      desc: 'Search, slice, and audit individual transaction receipts.',
    },
  };

  const currentMeta = titleMap[activeTab] || {
    title: 'Dashboard',
    desc: 'Business performance overview.',
  };

  const handleDownloadPdf = () => {
    window.open(api.getPdfDownloadUrl(activeTab, filters), '_blank');
  };

  const handleExportCsv = () => {
    window.open(api.getCsvExportUrl(filters), '_blank');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-20 shrink-0 transition-colors">
      {/* Module Title & Tenant Indicator */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none flex items-center gap-2">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">{currentMeta.desc}</p>
        </div>

        {/* Active Organization Pill */}
        <button
          onClick={onOpenOrgSettings}
          className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-semibold max-w-[130px] truncate">{tenant?.name || 'Vertex Retail'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
            isDemo
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {isDemo ? 'Demo' : tenant?.currency || 'INR'}
          </span>
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        {/* LIVE POS STREAM & INGEST BUTTON */}
        <button
          onClick={onOpenDataImport}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            isLiveStreaming
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-500'
          }`}
          title="Import CSV or stream live POS transactions"
        >
          <Zap className={`w-3.5 h-3.5 ${isLiveStreaming ? 'text-amber-300 fill-amber-300' : 'text-amber-500'}`} />
          <span className="hidden sm:inline">Data & Live Stream</span>
          {isLiveStreaming && (
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          )}
        </button>

        {/* Omni Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Search...</span>
          <kbd className="hidden lg:inline font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Filter Toggle */}
        <button
          onClick={onToggleFilterBar}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            filterBarOpen
              ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Quick CSV Export */}
        <button
          onClick={handleExportCsv}
          title="Export filtered transactions as CSV"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Quick PDF Report */}
        <button
          onClick={handleDownloadPdf}
          title="Download PDF executive report"
          className="p-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Account / Workspace Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(prev => !prev)}
            className="flex items-center space-x-1.5 pl-2 pr-1 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'G'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-200 animate-in fade-in"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-semibold text-white truncate">{user?.full_name || 'Guest Executive'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@retailpulse.io'}</div>
                <div className="text-[10px] text-brand-400 font-mono mt-0.5">{tenant?.name}</div>
              </div>

              <div className="py-1">
                {onOpenOrgSettings && (
                  <button
                    onClick={() => { setUserMenuOpen(false); onOpenOrgSettings(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                )}

                {onOpenAuthModal && (
                  <button
                    onClick={() => { setUserMenuOpen(false); onOpenAuthModal('register'); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Business Trial</span>
                  </button>
                )}

                {onOpenAuthModal && isDemo && (
                  <button
                    onClick={() => { setUserMenuOpen(false); onOpenAuthModal('login'); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sign In to Account</span>
                  </button>
                )}
              </div>

              {!isDemo && (
                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-950/40 flex items-center gap-2 text-rose-400 hover:text-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch / Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
