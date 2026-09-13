import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingDown, Percent, Layers, MapPin, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { ProfitabilityData } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { EChart } from '../charts/EChart';
import { formatINR, formatPercent } from '../../utils/formatters';

export const ProfitabilityView: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getProfitability(filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load profitability', err))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <SkeletonLoader label="Computing profitability waterfall (Revenue -> COGS -> Gross Profit)..." height="h-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader label="Aggregating regional margins..." height="h-64" />
          <SkeletonLoader label="Filtering high revenue low margin quadrant..." height="h-64" />
        </div>
      </div>
    );
  }

  if (!data) return <EmptyState title="No profitability data found" />;

  const { kpis, waterfall, by_category, by_region, high_revenue_low_margin } = data;

  // EChart Option for Waterfall Chart
  const waterfallOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: (params: any) => {
        const item = params[1] || params[0];
        return `<div class="font-bold">${item.name}</div>
          <div class="text-brand-300">Amount: <b>${formatINR(Math.abs(item.value))}</b></div>`;
      }
    },
    grid: { top: 25, right: 30, bottom: 30, left: 75 },
    xAxis: {
      type: 'category',
      data: ['Gross Sales', 'Discount Concessions', 'Cost of Goods (COGS)', 'Net Gross Profit'],
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: { color: '#334155', fontSize: 11, fontWeight: 'bold' }
    },
    yAxis: {
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
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
        data: [0, kpis.net_revenue, kpis.gross_profit, 0]
      },
      {
        name: 'Step',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'top',
          color: '#334155',
          fontSize: 10,
          formatter: (params: any) => formatINR(Math.abs(params.value), true)
        },
        data: [
          { value: kpis.net_revenue * 1.05, itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] } },
          { value: kpis.net_revenue * 0.05, itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] } },
          { value: kpis.cogs, itemStyle: { color: '#EF4444', borderRadius: [4, 4, 0, 0] } },
          { value: kpis.gross_profit, itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] } }
        ],
        barMaxWidth: 50
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 1. Profitability Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Net Sales Revenue</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{formatINR(kpis.net_revenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Top-line realized</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Cost of Goods (COGS)</div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">{formatINR(kpis.cogs)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Direct product costs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Net Gross Profit</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{formatINR(kpis.gross_profit)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Revenue minus COGS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Weighted Gross Margin</div>
          <div className="text-xl font-bold font-mono text-brand-600 mt-1">{kpis.gross_margin_percent}%</div>
          <div className="text-[11px] text-brand-600 mt-1">Weighted profitability</div>
        </div>
      </div>

      {/* 2. Waterfall Visualization */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profitability Waterfall: Top-Line to Gross Margin</h3>
            <p className="text-xs text-slate-500">Deconstructing gross revenue through discounts and COGS deductions.</p>
          </div>
        </div>
        <EChart option={waterfallOption} height="280px" />
      </div>

      {/* 3. Margin by Category & Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin by Category Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-brand-600" />
            Category Margin Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Revenue</th>
                  <th className="pb-2 text-right">COGS</th>
                  <th className="pb-2 text-right">Profit</th>
                  <th className="pb-2 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {by_category.map(c => (
                  <tr key={c.category} className="hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{c.category}</td>
                    <td className="py-2 text-right font-mono">{formatINR(c.revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-500">{formatINR(c.cogs)}</td>
                    <td className="py-2 text-right font-mono font-semibold text-slate-900">{formatINR(c.gross_profit)}</td>
                    <td className="py-2 text-right font-mono font-bold text-brand-600">{c.margin_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Margin by Region Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-brand-600" />
            Regional Margin Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="pb-2">Region</th>
                  <th className="pb-2 text-right">Revenue</th>
                  <th className="pb-2 text-right">COGS</th>
                  <th className="pb-2 text-right">Profit</th>
                  <th className="pb-2 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {by_region.map(r => (
                  <tr key={r.region} className="hover:bg-slate-50">
                    <td className="py-2 font-medium text-slate-800">{r.region} Region</td>
                    <td className="py-2 text-right font-mono">{formatINR(r.revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-500">{formatINR(r.cogs)}</td>
                    <td className="py-2 text-right font-mono font-semibold text-slate-900">{formatINR(r.gross_profit)}</td>
                    <td className="py-2 text-right font-mono font-bold text-brand-600">{r.margin_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. High Revenue + Low Margin Quadrant (Highlight) */}
      <div className="bg-white rounded-xl border border-rose-200 shadow-subtle overflow-hidden">
        <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Critical Quadrant: High Revenue • Low Margin SKUs</span>
            </div>
            <p className="text-xs text-rose-700/80 mt-0.5">
              These products drive heavy sales volume but quietly yield margins significantly below the portfolio average.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono">
            {high_revenue_low_margin.length} SKUs Identified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-4">Product SKU</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Net Revenue</th>
                <th className="py-2.5 px-4 text-right">Gross Profit</th>
                <th className="py-2.5 px-4 text-right">Margin %</th>
                <th className="py-2.5 px-4 text-right">Units Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {high_revenue_low_margin.map(p => (
                <tr key={p.product_id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {p.product_name}
                    <span className="block text-[10px] text-slate-400 font-normal font-mono">{p.product_id}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{p.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900">
                    {formatINR(p.revenue)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {formatINR(p.gross_profit)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600">
                    {p.margin_percent}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {p.units.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
