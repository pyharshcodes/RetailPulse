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
      title: 'Executive Overview',
      desc: 'Monitor revenue, profitability and operational performance across the retail network.',
    },
    sales: {
      title: 'Sales Intelligence',
      desc: 'Deep-dive into sales channel dynamics, payment methods, and seasonal cadence.',
    },
    stores: {
      title: 'Store Performance',
      desc: 'Compare store revenue, margin benchmarks, and targets across all 20 network locations.',
    },
    products: {
      title: 'Product Intelligence',
      desc: 'Identify top revenue contributors, margin drivers, and underperforming SKUs.',
    },
    customers: {
      title: 'Customer Analytics',
      desc: 'Track customer lifetime values, retention cohorts, and RFM behavioral segments.',
    },
    inventory: {
      title: 'Inventory Health & Aging',
      desc: 'Inspect inventory valuation, days since last sale, stockout risks, and 90+ day aging capital.',
    },
    profitability: {
      title: 'Profitability Analysis',
      desc: 'Deconstruct revenue into COGS, gross margins, and high-revenue low-margin quadrants.',
    },
    geography: {
      title: 'Geographic Intelligence',
      desc: 'Evaluate regional benchmarks across North, South, East, West, and Central India.',
    },
    targets: {
      title: 'Targets & Variance',
      desc: 'Track monthly budget targets against actual realization by store and category.',
    },
    alerts: {
      title: 'Business Alerts & Anomalies',
      desc: 'Real-time deterministic alerts on underperformance, margin slippage, and statistical outliers.',
    },
    reports: {
      title: 'Reports & Document Exports',
      desc: 'Generate executive PDF performance summaries and stream filtered CSV datasets.',
    },
    explorer: {
      title: 'Raw Data Explorer',
      desc: 'Search, sort, filter, and inspect transaction-level records with pagination.',
    },
  };

  const currentMeta = titleMap[activeTab] || {
    title: 'Executive Dashboard',
    desc: 'Performance analytics command center.',
  };

  const handleDownloadPdf = () => {
    window.open(api.getPdfDownloadUrl(activeTab, filters), '_blank');
  };

  const handleExportCsv = () => {
    window.open(api.getCsvExportUrl(filters), '_blank');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Module Title */}
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-none">{currentMeta.title}</h1>
        <p className="text-xs text-slate-500 mt-1 hidden sm:block">{currentMeta.desc}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Omni Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-lg text-xs font-medium transition-colors border border-slate-200"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Search network...</span>
          <kbd className="hidden md:inline font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Filter Toggle */}
        <button
          onClick={onToggleFilterBar}
          className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            filterBarOpen
              ? 'bg-brand-50 border-brand-200 text-brand-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
