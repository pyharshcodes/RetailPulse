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
  const [activeSideTab, setActiveSideTab] = useState<'stores' | 'highlights' | 'targets'>('stores');

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse p-4">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <SkeletonLoader label="Computing network sales and targets..." height="h-72" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader label="Aggregating sales by category..." height="h-64" />
          <SkeletonLoader label="Loading store leaderboard..." height="h-64" />
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
        name: 'Actual Sales',
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
          <div class="text-[11px] text-slate-300 mt-1">Sales: <b>${formatINR(item.value)}</b></div>
          <div class="text-[11px] text-emerald-300">Profit Margin: <b>${cat?.gross_margin}%</b></div>
          <div class="text-[11px] text-slate-400">Share of Total: <b>${cat?.revenue_share}%</b></div>`;
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
      axisLabel: { color: '#64748B', fontSize: 10 }
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
      {/* LEVEL 1: Quick Understanding (5 Seconds) */}
      
      {/* Primary 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
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
          title="Net Profit"
          current={kpis.gross_profit.current}
          previous={kpis.gross_profit.previous}
          pctChange={kpis.gross_profit.percentage_change}
          absChange={kpis.gross_profit.absolute_change}
          type="currency"
          icon={<TrendingUp className="w-4 h-4" />}
          onInspect={() => setAttributionMetric('gross_profit')}
        />
        <KPICard
          title="Profit Margin"
          current={kpis.gross_margin.current}
          previous={kpis.gross_margin.previous}
          pctChange={kpis.gross_margin.percentage_change}
          absChange={kpis.gross_margin.absolute_change}
          type="percent"
          icon={<Percent className="w-4 h-4" />}
          subtitle="Net return"
        />
        <KPICard
          title="Orders Placed"
          current={kpis.orders.current}
          previous={kpis.orders.previous}
          pctChange={kpis.orders.percentage_change}
          absChange={kpis.orders.absolute_change}
          type="number"
          icon={<ShoppingCart className="w-4 h-4" />}
        />
      </div>

      {/* Secondary Operational Quick-Strip */}
      <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-brand-500" />
            <span>Items Sold:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatNumber(kpis.units.current)}</span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <StoreIcon className="w-4 h-4 text-brand-500" />
            <span>Avg Spend per Order:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(kpis.aov.current)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Annual Goal Reached:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{targets.revenue_achievement}%</span>
          </div>
        </div>

        <button
          onClick={() => setAttributionMetric('revenue')}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center space-x-1"
        >
          <span>Explain what changed</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Primary Chart: Monthly Sales vs Target */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Over Time</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actual monthly sales compared to budgeted targets across all 20 store locations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="flex items-center space-x-1 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold self-start sm:self-auto"
          >
            <span>View Sales Trends</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <EChart option={trendChartOption} height="280px" />
      </div>

      {/* LEVEL 2: Understanding Why (30 Seconds) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Where Sales Came From (Category Breakdown) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Where Sales Came From</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sales volume and profit margins across product categories.</p>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
              >
                All Products →
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
          <div className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center pt-2">
            Tip: Click any category bar to filter the whole dashboard.
          </div>
        </div>

        {/* Tabbed Side Panel: Top Stores | Key Highlights | Goals */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col justify-between">
          <div>
            {/* Tab Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveSideTab('stores')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeSideTab === 'stores'
                      ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Top Stores
                </button>
                <button
                  onClick={() => setActiveSideTab('highlights')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeSideTab === 'highlights'
                      ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Key Highlights
                </button>
                <button
                  onClick={() => setActiveSideTab('targets')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeSideTab === 'targets'
                      ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  Goal Progress
                </button>
              </div>

              {activeSideTab === 'stores' && (
                <button
                  onClick={() => onNavigate('stores')}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                >
                  All 20 Stores →
                </button>
              )}
            </div>

            {/* TAB 1: Top Stores Leaderboard Table */}
            {activeSideTab === 'stores' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <th className="pb-2.5">Store Location</th>
                      <th className="pb-2.5">Region</th>
                      <th className="pb-2.5 text-right">Sales</th>
                      <th className="pb-2.5 text-right">Margin %</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {top_stores.map((s) => (
                      <tr
                        key={s.store_id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        onClick={() => onNavigate('stores', s.store_id)}
                      >
                        <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-2 group-hover:scale-125 transition-transform"></span>
                          <span className="truncate max-w-[150px]">{s.store_name.replace('Vertex ', '')}</span>
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{s.region}</td>
                        <td className="py-2.5 text-right font-mono font-medium text-slate-900 dark:text-white">
                          {formatINR(s.revenue)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                          {s.margin_percent}%
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="text-brand-600 dark:text-brand-400 group-hover:text-brand-800 text-[11px] font-semibold flex items-center justify-end">
                            Detail <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 2: Plain English Key Highlights */}
            {activeSideTab === 'highlights' && (
              <div className="space-y-2.5">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-start space-x-3"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                        h.impact === 'positive'
                          ? 'bg-emerald-500'
                          : h.impact === 'negative'
                          ? 'bg-rose-500'
                          : 'bg-brand-500'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">{h.title}</div>
                      <div className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 leading-snug">{h.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Goal Achievement Progress */}
            {activeSideTab === 'targets' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Total Goal Achievement</span>
                    <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                      {targets.revenue_achievement}%
                    </div>
                  </div>
                  <div className={`text-right text-xs font-semibold ${targets.variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {targets.variance >= 0 ? 'Surplus: +' : 'Deficit: '}{formatINR(targets.variance)}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      targets.revenue_achievement >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${Math.min(targets.revenue_achievement, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-750 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Target Goal:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{formatINR(targets.target_revenue)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Actual Realized:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{formatINR(kpis.revenue.current)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>20 total network stores monitored</span>
            <button onClick={() => onNavigate('stores')} className="text-brand-600 dark:text-brand-400 font-medium">Compare stores</button>
          </div>
        </div>
      </div>

      {/* LEVEL 3: Attribution Drawer (On Demand) */}
      <AttributionDrawer
        isOpen={attributionMetric !== null}
        onClose={() => setAttributionMetric(null)}
        metric={attributionMetric || 'revenue'}
      />
    </div>
  );
};
