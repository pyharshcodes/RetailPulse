import React, { useEffect, useState } from 'react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Layers,
  ChevronRight,
  X,
  Boxes,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { ProductItem } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { EChart } from '../charts/EChart';
import { formatINR, formatNumber, formatPercent } from '../../utils/formatters';

export const ProductsView: React.FC<{ selectedProductId?: string }> = ({ selectedProductId }) => {
  const { filters, updateFilter } = useFilters();
  const [data, setData] = useState<{ kpis: any; pagination: any; products: ProductItem[] } | null>(null);
  const [matrixPoints, setMatrixPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  // Single Product Detail Modal
  const [activeProductDetail, setActiveProductDetail] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getProducts(filters, search, sortBy, order, page, 20),
      api.getProductMatrix(filters),
    ])
      .then(([prodRes, matrixRes]) => {
        setData(prodRes);
        setMatrixPoints(matrixRes.points || []);
      })
      .catch(err => console.error('Failed to load products', err))
      .finally(() => setLoading(false));
  }, [filters, search, sortBy, order, page]);

  useEffect(() => {
    if (selectedProductId) {
      loadProductDetail(selectedProductId);
    }
  }, [selectedProductId]);

  const loadProductDetail = (productId: string) => {
    api.getProductDetail(productId, filters)
      .then(res => {
        setActiveProductDetail(res);
        setDetailModalOpen(true);
      })
      .catch(err => console.error('Failed to load product detail', err));
  };

  // EChart Option for Margin vs Revenue Scatter Matrix
  const scatterOption = {
    tooltip: {
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: (params: any) => {
        const d = params.data;
        return `<div class="font-bold mb-1">${d.name}</div>
          <div class="text-[10px] text-slate-400 mb-1">${d.category}</div>
          <div class="text-slate-300">Revenue: <b>${formatINR(d.value[1])}</b></div>
          <div class="text-brand-300">Gross Margin: <b>${d.value[0]}%</b></div>
          <div class="text-slate-400">Units Sold: <b>${formatNumber(d.units)}</b></div>`;
      }
    },
    grid: { top: 30, right: 30, bottom: 45, left: 75 },
    xAxis: {
      name: 'Gross Margin %',
      nameLocation: 'middle',
      nameGap: 25,
      type: 'value',
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
      axisLabel: { formatter: '{value}%', color: '#64748B', fontSize: 10 }
    },
    yAxis: {
      name: 'Net Sales Revenue (INR)',
      nameLocation: 'middle',
      nameGap: 55,
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
      axisLabel: {
        formatter: (v: number) => formatINR(v, true),
        color: '#64748B',
        fontSize: 10
      }
    },
    series: [
      {
        type: 'scatter',
        data: matrixPoints.map(p => ({
          name: p.product_name,
          category: p.category,
          product_id: p.product_id,
          units: p.units,
          value: [p.margin_percent, p.revenue, p.units],
        })),
        symbolSize: (data: any) => {
          // Normalize bubble size: between 6px and 28px
          return Math.max(6, Math.min(28, Math.sqrt(data[2] || 1) * 0.9));
        },
        itemStyle: {
          color: (params: any) => {
            const margin = params.data.value[0];
            if (margin >= 30) return '#10B981'; // High margin green
            if (margin >= 20) return '#3B82F6'; // Moderate blue
            return '#F59E0B'; // Low margin amber
          },
          opacity: 0.75,
        }
      }
    ]
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
        <SkeletonLoader label="Computing Product Matrix (Margin % vs Net Revenue)..." height="h-80" />
      </div>
    );
  }

  if (!data) return null;

  const { kpis, pagination, products } = data;

  return (
    <div className="space-y-6">
      {/* 1. Product Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Tracked SKUs</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{kpis.total_skus} Products</div>
          <div className="text-[11px] text-slate-400 mt-1">11 Product Categories</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Top Revenue Driver</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-1" title={kpis.top_revenue_product}>
            {kpis.top_revenue_product}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Highest gross volume</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Highest Margin SKU</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-1" title={kpis.top_margin_product}>
            {kpis.top_margin_product}
          </div>
          <div className="text-[11px] text-brand-600 mt-1">Peak profitability margin</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Fastest Growing</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-1" title={kpis.fastest_growing_product}>
            {kpis.fastest_growing_product}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Highest period delta %</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle col-span-2 sm:col-span-1">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Declining SKUs</div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">{kpis.declining_products_count} SKUs</div>
          <div className="text-[11px] text-rose-600 mt-1">Negative YoY volume</div>
        </div>
      </div>

      {/* 2. Scatter / Bubble Product Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Product Portfolio Matrix</h3>
            <p className="text-xs text-slate-500">
              X-axis: Gross Margin % • Y-axis: Net Sales Revenue • Bubble Size: Units Sold
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> High Margin (≥30%)</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5" /> Moderate (20-30%)</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" /> Volume Low Margin (&lt;20%)</span>
          </div>
        </div>
        <EChart
          option={scatterOption}
          height="340px"
          onEvents={{
            click: (params: any) => {
              if (params.data?.product_id) {
                loadProductDetail(params.data.product_id);
              }
            }
          }}
        />
        <div className="text-[11px] text-slate-400 italic text-center pt-2">
          Click any product bubble to view SKU sales trends and stock levels.
        </div>
      </div>

      {/* 3. Product Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium"
            >
              <option value="revenue">Revenue</option>
              <option value="units">Units Sold</option>
              <option value="gross_profit">Gross Profit</option>
              <option value="margin">Margin %</option>
              <option value="growth">Growth</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">SKU / Product Name</th>
                <th className="py-3 px-4">Category / Subcategory</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">YoY Growth</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr
                  key={p.product_id}
                  onClick={() => loadProductDetail(p.product_id)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="truncate max-w-[240px]">{p.product_name}</div>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">{p.product_id}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{p.category}</div>
                    <span className="text-[10px] text-slate-400">{p.subcategory}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                    {formatINR(p.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatNumber(p.units)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatINR(p.gross_profit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-brand-600">
                    {p.margin_percent}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className={p.growth >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {p.growth >= 0 ? '+' : ''}{p.growth}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-brand-600 group-hover:text-brand-800 text-xs font-semibold flex items-center justify-end">
                      Detail <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing Page <span className="font-bold text-slate-800">{pagination.page}</span> of {pagination.pages} ({pagination.total} total products)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 4. Single Product Detail Modal */}
      {detailModalOpen && activeProductDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)} />
          <div className="relative mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-brand-400 uppercase font-semibold">SKU Profile</span>
                <h2 className="text-lg font-bold mt-1">{activeProductDetail.product.product_name}</h2>
                <div className="text-xs text-slate-300 mt-1 flex items-center space-x-3">
                  <span>ID: {activeProductDetail.product.product_id}</span>
                  <span>•</span>
                  <span>{activeProductDetail.product.category} ({activeProductDetail.product.subcategory})</span>
                  <span>•</span>
                  <span>Brand: {activeProductDetail.product.brand}</span>
                </div>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
              {/* Pricing & Margin metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Unit Cost</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{formatINR(activeProductDetail.product.unit_cost)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Selling Price</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{formatINR(activeProductDetail.product.selling_price)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Target Margin</div>
                  <div className="text-base font-bold font-mono text-brand-600 mt-1">{activeProductDetail.product.target_margin_percent}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Reorder Point</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">{activeProductDetail.product.reorder_point} units</div>
                </div>
              </div>

              {/* Monthly Sales Trend */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <h4 className="font-bold text-slate-900 mb-2">Monthly Sales Trend</h4>
                <EChart
                  height="200px"
                  option={{
                    tooltip: { trigger: 'axis' },
                    grid: { top: 20, right: 20, bottom: 25, left: 55 },
                    xAxis: {
                      type: 'category',
                      data: activeProductDetail.monthly_trend.map((m: any) => m.month),
                      axisLabel: { fontSize: 9 }
                    },
                    yAxis: {
                      type: 'value',
                      axisLabel: { formatter: (v: number) => formatINR(v, true), fontSize: 9 }
                    },
                    series: [{
                      type: 'line',
                      smooth: true,
                      data: activeProductDetail.monthly_trend.map((m: any) => m.revenue),
                      itemStyle: { color: '#2563EB' }
                    }]
                  }}
                />
              </div>

              {/* Store Stock Distribution */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Stock Presence Across Stores</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeProductDetail.store_inventory.slice(0, 8).map((inv: any) => (
                    <div key={inv.store_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="font-semibold text-slate-800">{inv.store_id}</div>
                      <div className="text-slate-600 font-mono mt-0.5">{inv.closing_inventory} units in stock</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{inv.stock_status} ({inv.aging_bucket})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
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
    </div>
  );
};
