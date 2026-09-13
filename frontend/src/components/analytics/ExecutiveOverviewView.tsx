import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Percent,
  Sparkles,
  ArrowUpRight,
  Store as StoreIcon,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { ExecutiveOverviewData } from '../../types';
import { KPICard } from '../common/KPICard';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { StatusBadge } from '../common/StatusBadge';
import { AttributionDrawer } from '../common/AttributionDrawer';
import { EChart } from '../charts/EChart';
import { formatINR, formatNumber } from '../../utils/formatters';

export const ExecutiveOverviewView: React.FC<{ onNavigate: (tab: string, id?: string) => void }> = ({ onNavigate }) => {
  const { filters, updateFilter } = useFilters();
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attributionMetric, setAttributionMetric] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getOverview(filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load overview data', err))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse p-4">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <SkeletonLoader label="Computing network revenue trend and targets..." height="h-72" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader label="Aggregating category mix..." height="h-64" />
          <SkeletonLoader label="Calculating store leaderboards..." height="h-64" />
        </div>
      </div>
    );
  }

  if (!data || data.kpis.revenue.current === 0) {
    return <EmptyState title="No transactions found" message="Try expanding the date range or resetting active filters." />;
  }

  const { kpis, targets, revenue_trend, category_performance, top_stores, highlights } = data;

  // EChart Option for Revenue vs Target Monthly Trend
  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: (params: any) => {
        let title = params[0]?.axisValueLabel || '';
        let content = `<div class="font-bold mb-1">${title}</div>`;
        params.forEach((item: any) => {
          const val = typeof item.value === 'number' ? formatINR(item.value) : item.value;
          content += `<div class="flex items-center justify-between gap-4 text-[11px]">
            <span style="color:${item.color}">● ${item.seriesName}</span>
            <span class="font-mono font-bold">${val}</span>
          </div>`;
        });
        return content;
      }
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 11 },
      itemWidth: 12,
      itemHeight: 8,
    },
    grid: { top: 20, right: 20, bottom: 40, left: 65 },
    xAxis: {
      type: 'category',
      data: revenue_trend.map(t => t.period),
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: (v: number) => formatINR(v, true)
      }
    },
    series: [
      {
        name: 'Actual Revenue',
        type: 'bar',
        data: revenue_trend.map(t => t.revenue),
        itemStyle: {
          color: '#2563EB',
          borderRadius: [4, 4, 0, 0]
        },
        barMaxWidth: 24,
      },
      {
        name: 'Monthly Target',
        type: 'line',
        data: revenue_trend.map(t => t.target_revenue),
        lineStyle: { color: '#D97706', width: 2, type: 'dashed' },
        itemStyle: { color: '#D97706' },
        symbol: 'circle',
        symbolSize: 6,
      }
    ]
  };

  // EChart Option for Category Performance
  const categoryChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: (params: any) => {
        const item = params[0];
        const cat = category_performance.find(c => c.category === item.name);
        return `<div class="font-bold">${item.name}</div>
          <div class="text-[11px] text-slate-300 mt-1">Revenue: <b>${formatINR(item.value)}</b></div>
          <div class="text-[11px] text-brand-300">Gross Margin: <b>${cat?.gross_margin}%</b></div>
          <div class="text-[11px] text-slate-400">Share: <b>${cat?.revenue_share}%</b></div>`;
      }
    },
    grid: { top: 15, right: 25, bottom: 20, left: 120 },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: (v: number) => formatINR(v, true)
      }
    },
    yAxis: {
      type: 'category',
      data: category_performance.map(c => c.category).reverse(),
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#334155', fontSize: 10 }
    },
    series: [
      {
        type: 'bar',
        data: category_performance.map(c => c.revenue).reverse(),
        itemStyle: {
          color: (params: any) => {
            const colors = ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [0, 4, 4, 0]
        },
        barMaxWidth: 16,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive KPI Cards (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KPICard
          title="Net Revenue"
          current={kpis.revenue.current}
          previous={kpis.revenue.previous}
          pctChange={kpis.revenue.percentage_change}
          absChange={kpis.revenue.absolute_change}
          type="currency"
          icon={<DollarSign className="w-4 h-4" />}
          onInspect={() => setAttributionMetric('revenue')}
          highlight={true}
        />
        <KPICard
          title="Gross Profit"
          current={kpis.gross_profit.current}
          previous={kpis.gross_profit.previous}
          pctChange={kpis.gross_profit.percentage_change}
          absChange={kpis.gross_profit.absolute_change}
          type="currency"
          icon={<TrendingUp className="w-4 h-4" />}
          onInspect={() => setAttributionMetric('gross_profit')}
        />
        <KPICard
          title="Gross Margin"
          current={kpis.gross_margin.current}
          previous={kpis.gross_margin.previous}
          pctChange={kpis.gross_margin.percentage_change}
          absChange={kpis.gross_margin.absolute_change}
          type="percent"
          icon={<Percent className="w-4 h-4" />}
          subtitle="Weighted"
        />
        <KPICard
          title="Total Orders"
          current={kpis.orders.current}
          previous={kpis.orders.previous}
          pctChange={kpis.orders.percentage_change}
          absChange={kpis.orders.absolute_change}
          type="number"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <KPICard
          title="Units Sold"
          current={kpis.units.current}
          previous={kpis.units.previous}
          pctChange={kpis.units.percentage_change}
          absChange={kpis.units.absolute_change}
          type="number"
          icon={<Package className="w-4 h-4" />}
          onInspect={() => setAttributionMetric('units')}
        />
        <KPICard
          title="Average Order (AOV)"
          current={kpis.aov.current}
          previous={kpis.aov.previous}
          pctChange={kpis.aov.percentage_change}
          absChange={kpis.aov.absolute_change}
          type="currency"
          icon={<StoreIcon className="w-4 h-4" />}
        />
      </div>

      {/* 2. Target Achievement Banner & Factual Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Target Realization Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Period Target Realization
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900">
                {targets.revenue_achievement}%
              </span>
              <span className={`text-xs font-semibold ${targets.variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {targets.variance >= 0 ? '+' : ''}{formatINR(targets.variance)}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  targets.revenue_achievement >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
                }`}
                style={{ width: `${Math.min(targets.revenue_achievement, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Target: {formatINR(targets.target_revenue)}</span>
            <span>Realized: {formatINR(kpis.revenue.current)}</span>
          </div>
        </div>

        {/* Factual Highlights Banner (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automated Executive Findings</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Real-time computation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {highlights.map((h, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                  h.impact === 'positive' ? 'bg-emerald-400' : h.impact === 'negative' ? 'bg-rose-400' : 'bg-brand-400'
                }`} />
                <div>
                  <div className="font-semibold text-white text-[11px]">{h.title}</div>
                  <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">{h.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Revenue vs Target Trend Line */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Revenue vs Target</h3>
            <p className="text-xs text-slate-500">Track seasonal realization against budgeted monthly goals across the retail network.</p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="flex items-center space-x-1 text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            <span>Full Sales Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <EChart option={trendChartOption} height="300px" />
      </div>

      {/* 4. Category Performance & Top Stores Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Revenue & Margin Mix</h3>
                <p className="text-xs text-slate-500">Ranked by net sales volume.</p>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                All SKUs →
              </button>
            </div>
            <EChart
              option={categoryChartOption}
              height="280px"
              onEvents={{
                click: (params: any) => {
                  if (params.name) {
                    updateFilter('category', params.name);
                  }
                }
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400 italic text-center pt-2">
            Tip: Click any category bar to filter the entire dashboard.
          </div>
        </div>

        {/* Top Stores Leaderboard Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Store Performance Leaderboard</h3>
                <p className="text-xs text-slate-500">Top revenue generating store locations.</p>
              </div>
              <button
                onClick={() => onNavigate('stores')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                View all 20 Stores →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="pb-2.5">Store Location</th>
                    <th className="pb-2.5">Region</th>
                    <th className="pb-2.5 text-right">Revenue</th>
                    <th className="pb-2.5 text-right">Margin %</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {top_stores.map((s) => (
                    <tr
                      key={s.store_id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => onNavigate('stores', s.store_id)}
                    >
                      <td className="py-2.5 font-medium text-slate-800 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 group-hover:scale-125 transition-transform"></span>
                        <span className="truncate max-w-[150px]">{s.store_name.replace('Vertex ', '')}</span>
                      </td>
                      <td className="py-2.5 text-slate-500">{s.region}</td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {formatINR(s.revenue)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-700">
                        {s.margin_percent}%
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-brand-600 group-hover:text-brand-800 text-[11px] font-semibold flex items-center justify-end">
                          Detail <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>20 total network stores monitored</span>
            <button onClick={() => onNavigate('stores')} className="text-brand-600 font-medium">Compare stores</button>
          </div>
        </div>
      </div>

      {/* Attribution Drawer */}
      <AttributionDrawer
        isOpen={attributionMetric !== null}
        onClose={() => setAttributionMetric(null)}
        metric={attributionMetric || 'revenue'}
      />
    </div>
  );
};
