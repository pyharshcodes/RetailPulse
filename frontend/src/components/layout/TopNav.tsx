import React from 'react';
import { Search, Download, FileText, Sparkles, Filter, Sun, Moon } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

interface TopNavProps {
  activeTab: string;
  onOpenSearch: () => void;
  onOpenCaseStudy: () => void;
  filterBarOpen: boolean;
  onToggleFilterBar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onOpenSearch,
  onOpenCaseStudy,
  filterBarOpen,
  onToggleFilterBar,
}) => {
  const { filters, activeFilterCount } = useFilters();
  const { theme, toggleTheme } = useTheme();

  const titleMap: Record<string, { title: string; desc: string }> = {
    overview: {
      title: 'Overview',
      desc: 'A simple, high-level summary of your sales, profits, and store network.',
    },
    sales: {
      title: 'Sales Trends',
      desc: 'Track how sales change over time across channels, payments, and days.',
    },
    stores: {
      title: 'Store Performance',
      desc: 'Compare sales, targets, and profits across all 20 store locations.',
    },
    products: {
      title: 'Products',
      desc: 'See top-selling items, high-profit products, and items that need attention.',
    },
    customers: {
      title: 'Customer Habits',
      desc: 'Understand customer spending, repeat visits, and loyalty groups.',
    },
    inventory: {
      title: 'Stock & Inventory',
      desc: 'Check current stock levels, reorder warnings, and slow-moving items.',
    },
    profitability: {
      title: 'Profit & Margins',
      desc: 'See where your profit comes from and how product costs impact your bottom line.',
    },
    geography: {
      title: 'Locations & Regions',
      desc: 'Compare sales and profit margins across different regions and cities.',
    },
    targets: {
      title: 'Goals & Targets',
      desc: 'Track whether stores and categories are meeting their monthly sales goals.',
    },
    alerts: {
      title: 'Alerts & Warnings',
      desc: 'Automatic notifications for sudden drops, stockout risks, or low margins.',
    },
    reports: {
      title: 'Reports & Downloads',
      desc: 'Download clean PDF summaries and export full transaction data as CSV.',
    },
    explorer: {
      title: 'Explore Data',
      desc: 'Search, filter, and inspect individual transaction receipts.',
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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-10 shrink-0 transition-colors">
      {/* Module Title */}
      <div>
        <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">{currentMeta.title}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">{currentMeta.desc}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Omni Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Quick search...</span>
          <kbd className="hidden md:inline font-mono text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
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
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Case Study Shortcut */}
        <button
          onClick={onOpenCaseStudy}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Case Study</span>
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
      </div>
    </header>
  );
};
