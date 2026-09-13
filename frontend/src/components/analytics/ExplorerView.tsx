import React, { useEffect, useState } from 'react';
import { Database, Search, Download, Eye, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { formatINR, formatNumber } from '../../utils/formatters';

export const ExplorerView: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<{ total: number; page: number; limit: number; pages: number; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('transaction_date');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.getExplorer(filters, search, sortBy, order, page, 50)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load explorer data', err))
      .finally(() => setLoading(false));
  }, [filters, search, sortBy, order, page]);

  const handleExport = () => {
    window.open(api.getCsvExportUrl(filters), '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Search & Export Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, product, store, city..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        {loading && !data ? (
          <SkeletonLoader label="Streaming transactions from database..." height="h-96" />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No transactions matched query" message="Try searching for another product name or resetting filters." />
        ) : (
          <>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Store</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Items</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-right">Total Sales</th>
                    <th className="py-2.5 px-3 text-right">Net Profit</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                    <th className="py-2.5 px-3">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {data.items.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-medium">{t.transaction_id}</td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{t.transaction_date}</td>
                      <td className="py-2 px-3 font-sans text-slate-800 dark:text-slate-200 font-medium">{t.store_name.replace('Vertex ', '')}</td>
                      <td className="py-2 px-3 font-sans text-slate-900 dark:text-white font-medium truncate max-w-[180px]" title={t.product_name}>{t.product_name}</td>
                      <td className="py-2 px-3 font-sans text-slate-500 dark:text-slate-400">{t.category}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">{t.quantity}</td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">{formatINR(t.unit_price)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">{formatINR(t.net_sales)}</td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300">{formatINR(t.gross_profit)}</td>
                      <td className="py-2 px-3 text-right font-bold text-brand-600 dark:text-brand-400">{t.gross_margin_percent}%</td>
                      <td className="py-2 px-3 font-sans text-slate-500 dark:text-slate-400 text-[10px]">{t.sales_channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {((page - 1) * 50) + 1} – {Math.min(page * 50, data.total)} of <span className="font-bold font-mono text-slate-800 dark:text-white">{formatNumber(data.total)}</span> transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 font-medium flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="px-2 font-mono">Page {page} / {data.pages}</span>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 font-medium flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
