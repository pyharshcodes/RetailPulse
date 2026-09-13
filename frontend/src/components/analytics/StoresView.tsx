import React, { useEffect, useState } from 'react';
import {
  Store as StoreIcon,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUpDown,
  Layers,
  ChevronRight,
  X,
  CheckSquare,
  Square,
  BarChart3
} from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { StoreItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { EChart } from '../charts/EChart';
import { formatINR, formatPercent } from '../../utils/formatters';

export const StoresView: React.FC<{ selectedStoreId?: string; onClearStoreId?: () => void }> = ({
  selectedStoreId,
  onClearStoreId
}) => {
  const { filters, updateFilter } = useFilters();
  const [data, setData] = useState<{ kpis: any; stores: StoreItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('revenue');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');

  // Multi-store comparison state (select 2-4 stores)
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState<any[]>([]);

  // Single store detail modal state
  const [activeStoreDetail, setActiveStoreDetail] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getStores(filters, sortBy, order)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load stores', err))
      .finally(() => setLoading(false));
  }, [filters, sortBy, order]);

  // If navigated directly to a store ID, open its detail modal
  useEffect(() => {
    if (selectedStoreId) {
      loadStoreDetail(selectedStoreId);
    }
  }, [selectedStoreId]);

  const loadStoreDetail = (storeId: string) => {
    api.getStoreDetail(storeId, filters)
      .then(res => {
        setActiveStoreDetail(res);
        setDetailModalOpen(true);
      })
      .catch(err => console.error('Failed to load store detail', err));
  };

  const toggleSelectStore = (storeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStores(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 stores simultaneously.');
        return prev;
      }
      return [...prev, storeId];
    });
  };

  const handleOpenComparison = () => {
    if (selectedStores.length < 2) return;
    api.compareStores(selectedStores, filters)
      .then(res => {
        setCompareData(res.comparison);
        setCompareModalOpen(true);
      })
      .catch(err => console.error('Failed to compare stores', err));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
        <SkeletonLoader label="Calculating store KPIs and budget variance..." height="h-96" />
      </div>
    );
  }

  if (!data || data.stores.length === 0) {
    return <EmptyState title="No stores match current filters" message="Try resetting active region or store filters." />;
  }

  const { kpis, stores } = data;

  return (
    <div className="space-y-6">
      {/* 1. Store Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Stores</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{kpis.total_stores} Stores</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 5 Regions</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Met Their Goal</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{kpis.stores_above_target} Stores</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">≥100% Target Met</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Needs Attention</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{kpis.stores_below_target} Stores</div>
          <div className="text-[11px] text-rose-600/80 mt-1">&lt;90% of Goal</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Best Store</div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">{kpis.best_store.replace('Vertex ', '')}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Top target achievement</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Slowest Store</div>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">{kpis.lowest_performing_store.replace('Vertex ', '')}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Target turnaround needed</div>
        </div>
      </div>

      {/* 2. Store Comparison Action Bar (Floating when items selected) */}
      {selectedStores.length > 0 && (
        <div className="p-3 bg-brand-900 text-white rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold bg-brand-700 px-2 py-0.5 rounded text-brand-100">{selectedStores.length} stores selected</span>
            <span className="text-brand-200 text-[11px]">Compare side-by-side performance benchmarks</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedStores([])}
              className="text-xs text-brand-300 hover:text-white px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleOpenComparison}
              disabled={selectedStores.length < 2}
              className="px-3.5 py-1.5 bg-white text-brand-900 hover:bg-brand-50 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
            >
              Compare {selectedStores.length} Stores
            </button>
          </div>
        </div>
      )}

      {/* 3. Stores Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Store Performance List</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any store to see detailed metrics, or check boxes to compare 2–4 stores.</p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-800 dark:text-white">{stores.length}</span> stores
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-3 w-10 text-center">Select</th>
                <th className="py-3 px-3">Store</th>
                <th className="py-3 px-3">City / Region</th>
                <th className="py-3 px-3 text-right">Total Sales</th>
                <th className="py-3 px-3 text-right">Growth vs Last Year</th>
                <th className="py-3 px-3 text-right">Gross Profit</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-3 text-right">Target</th>
                <th className="py-3 px-3 text-right">Realization</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map((s) => {
                const isSelected = selectedStores.includes(s.store_id);
                return (
                  <tr
                    key={s.store_id}
                    onClick={() => loadStoreDetail(s.store_id)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${isSelected ? 'bg-brand-50/30' : ''}`}
                  >
                    <td className="py-3 px-3 text-center" onClick={(e) => toggleSelectStore(s.store_id, e)}>
                      <button className="text-slate-400 hover:text-brand-600">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {s.store_name.replace('Vertex ', '')}
                      <span className="block text-[10px] font-normal text-slate-400">{s.store_id}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {s.city}
                      <span className="block text-[10px] text-slate-400">{s.region} Region</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                      {formatINR(s.revenue)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center font-mono font-medium ${s.growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {s.growth >= 0 ? '+' : ''}{formatPercent(s.growth, false)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatINR(s.gross_profit)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {s.margin_percent}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {formatINR(s.target)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={s.achievement >= 100 ? 'text-emerald-600' : s.achievement < 90 ? 'text-rose-600' : 'text-slate-800'}>
                        {s.achievement}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-brand-600 group-hover:text-brand-800 text-xs font-medium flex items-center justify-end">
                        Inspect <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Single Store Detail Modal */}
      {detailModalOpen && activeStoreDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)} />
          <div className="relative mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand-400 uppercase font-semibold">Store Performance Deep-Dive</span>
                <h2 className="text-xl font-bold mt-1">{activeStoreDetail.store.store_name}</h2>
                <div className="text-xs text-slate-300 mt-1 flex items-center space-x-3">
                  <span>{activeStoreDetail.store.city}, {activeStoreDetail.store.state} ({activeStoreDetail.store.region})</span>
                  <span>•</span>
                  <span>{activeStoreDetail.store.tier}</span>
                  <span>•</span>
                  <span>{activeStoreDetail.store.square_feet} sq ft</span>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Store KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">Revenue</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{formatINR(activeStoreDetail.kpis.revenue)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">Gross Profit</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{formatINR(activeStoreDetail.kpis.gross_profit)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">Margin %</div>
                  <div className="text-base font-bold font-mono text-brand-600 mt-1">{activeStoreDetail.kpis.margin_percent}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">Orders</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{activeStoreDetail.kpis.orders}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase">AOV</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{formatINR(activeStoreDetail.kpis.aov, false)}</div>
                </div>
              </div>

              {/* Monthly Trend for this Store */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="text-xs font-bold text-slate-900 mb-3">Store Revenue Trendline</h4>
                <EChart
                  height="220px"
                  option={{
                    tooltip: { trigger: 'axis' },
                    grid: { top: 20, right: 20, bottom: 25, left: 60 },
                    xAxis: {
                      type: 'category',
                      data: activeStoreDetail.trend.map((t: any) => t.month),
                      axisLabel: { fontSize: 10 }
                    },
                    yAxis: {
                      type: 'value',
                      axisLabel: { formatter: (v: number) => formatINR(v, true), fontSize: 10 }
                    },
                    series: [{
                      type: 'bar',
                      data: activeStoreDetail.trend.map((t: any) => t.revenue),
                      itemStyle: { color: '#2563EB', borderRadius: [3, 3, 0, 0] }
                    }]
                  }}
                />
              </div>

              {/* Category Mix & Top Products */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Mix */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Category Mix</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {activeStoreDetail.category_mix.map((c: any) => (
                      <div key={c.category} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                        <span className="text-slate-800">{c.category}</span>
                        <div className="text-right font-mono">
                          <span className="font-semibold text-slate-900">{formatINR(c.revenue)}</span>
                          <span className="text-slate-400 ml-2">({c.margin_percent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Top Selling SKUs</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {activeStoreDetail.top_products.map((p: any) => (
                      <div key={p.product_name} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                        <div className="truncate max-w-[180px]">
                          <div className="font-medium text-slate-800 truncate">{p.product_name}</div>
                          <div className="text-[10px] text-slate-400">{p.category}</div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="font-semibold text-slate-900">{formatINR(p.revenue)}</div>
                          <div className="text-[10px] text-slate-500">{p.units} units</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  updateFilter('store', activeStoreDetail.store.store_id);
                  setDetailModalOpen(false);
                }}
                className="text-brand-600 hover:text-brand-800 font-semibold"
              >
                Set as Global Filter Scope →
              </button>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Multi-Store Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setCompareModalOpen(false)} />
          <div className="relative mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand-400 uppercase font-semibold">Comparative Analysis</span>
                <h2 className="text-xl font-bold mt-1">Multi-Store Side-by-Side Comparison</h2>
              </div>
              <button onClick={() => setCompareModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="p-3 text-slate-500 uppercase text-[10px]">Benchmark Dimension</th>
                    {compareData.map((s: any) => (
                      <th key={s.store_id} className="p-3 text-slate-900 font-bold text-sm bg-slate-50">
                        {s.store_name.replace('Vertex ', '')}
                        <div className="text-[10px] font-normal text-slate-500">{s.city} • {s.region}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Net Revenue</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 font-mono font-bold text-slate-900 bg-slate-50/50">
                        {formatINR(s.revenue)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Target Achievement</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 font-mono font-bold bg-slate-50/50">
                        <span className={s.achievement >= 100 ? 'text-emerald-600' : 'text-rose-600'}>
                          {s.achievement}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Gross Profit</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 font-mono text-slate-800 bg-slate-50/50">
                        {formatINR(s.gross_profit)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Gross Margin %</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 font-mono text-brand-600 font-semibold bg-slate-50/50">
                        {s.margin_percent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Total Orders</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 font-mono text-slate-700 bg-slate-50/50">
                        {s.orders.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Average Order Value (AOV)</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 font-mono text-slate-700 bg-slate-50/50">
                        {formatINR(s.aov, false)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-700">Store Format / Area</td>
                    {compareData.map((s: any) => (
                      <td key={s.store_id} className="p-3 text-slate-600 bg-slate-50/50">
                        {s.tier} ({s.square_feet} sq ft)
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
