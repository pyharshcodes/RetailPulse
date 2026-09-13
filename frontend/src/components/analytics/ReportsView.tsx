import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Shield, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';

export const ReportsView: React.FC = () => {
  const { filters } = useFilters();
  const [downloading, setDownloading] = useState<string | null>(null);

  const reportCards = [
    {
      id: 'executive',
      title: 'Executive Performance Summary',
      description: 'Comprehensive network overview covering revenue realization, weighted margins, top stores, and automated findings.',
      badge: 'Executive Level',
      color: 'border-brand-500',
    },
    {
      id: 'store',
      title: 'Store Operations & Target Audit',
      description: 'Store-by-store ranking table, target variance achievement percentages, and underperformer alerts across 20 outlets.',
      badge: 'Operations',
      color: 'border-emerald-500',
    },
    {
      id: 'product',
      title: 'Product Portfolio Intelligence',
      description: 'Category revenue contributions, top margin drivers, declining product lines, and high-volume SKU rankings.',
      badge: 'Merchandising',
      color: 'border-purple-500',
    },
    {
      id: 'inventory',
      title: 'Inventory Health & Aging Report',
      description: 'Stock valuation, turnover ratio, 90+ day aging capital exposure, and critical low-stock reorder warnings.',
      badge: 'Supply Chain',
      color: 'border-amber-500',
    },
    {
      id: 'profitability',
      title: 'Financial Profitability & Margin Analysis',
      description: 'COGS deconstruction waterfall, regional profit distributions, and high-revenue low-margin quadrant analysis.',
      badge: 'Finance',
      color: 'border-rose-500',
    },
  ];

  const handleDownloadPdf = (reportId: string) => {
    setDownloading(reportId);
    const url = api.getPdfDownloadUrl(reportId, filters);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RetailPulse_${reportId}_report.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 1000);
  };

  const handleDownloadCsv = () => {
    setDownloading('csv');
    const url = api.getCsvExportUrl(filters);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RetailPulse_filtered_transactions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Context Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ready-to-Print Business Reports</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reports are generated instantly based on your active filters ({filters.start_date} to {filters.end_date}).
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Download All Data (Excel/CSV)</span>
        </button>
      </div>

      {/* PDF Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportCards.map((r) => (
          <div
            key={r.id}
            className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-subtle flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all ${r.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {r.badge}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">PDF Report</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{r.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">PDF • Printable</span>
              <button
                onClick={() => handleDownloadPdf(r.id)}
                disabled={downloading === r.id}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === r.id ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
