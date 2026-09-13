import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, CreditCard, Layers, Calendar, BarChart2 } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { SalesAnalyticsData } from '../../types';
import { EChart } from '../charts/EChart';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { formatINR, formatNumber } from '../../utils/formatters';

export const SalesView: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState<'daily' | 'monthly'>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'gross_profit' | 'orders' | 'units' | 'aov'>('revenue');

  useEffect(() => {
    setLoading(true);
    api.getSales(interval, filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load sales analytics', err))
      .finally(() => setLoading(false));
  }, [interval, filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader label="Aggregating sales trend timeline..." height="h-80" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader label="Computing channel distribution..." height="h-64" />
          <SkeletonLoader label="Analyzing payment methods..." height="h-64" />
        </div>
      </div>
    );
  }

  if (!data || data.trend.length === 0) {
    return <EmptyState title="No sales data found" message="Try expanding your selected dates or removing filters." />;
  }

  const { trend, channels, payment_methods } = data;

  // Chart configuration based on selectedMetric
  const metricLabelMap = {
    revenue: 'Total Sales',
    gross_profit: 'Net Profit',
    orders: 'Orders Placed',
    units: 'Items Sold',
    aov: 'Avg Spend / Order',
  };

  const metricColorMap = {
    revenue: '#2563EB',
    gross_profit: '#10B981',
    orders: '#8B5CF6',
    units: '#F59E0B',
    aov: '#EC4899',
  };

  const trendChartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: (params: any) => {
        const item = params[0];
        const val = ['revenue', 'gross_profit', 'aov'].includes(selectedMetric)
          ? formatINR(item.value)
          : formatNumber(item.value);
        return `<div class="font-bold mb-1">${item.name}</div>
          <div class="text-brand-300">${metricLabelMap[selectedMetric]}: <b>${val}</b></div>`;
      }
    },
    grid: { top: 25, right: 20, bottom: 40, left: 65 },
    xAxis: {
      type: 'category',
      data: trend.map(t => t.period),
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
      axisLabel: {
        color: '#64748B',
        fontSize: 10,
        formatter: (v: number) => ['revenue', 'gross_profit', 'aov'].includes(selectedMetric) ? formatINR(v, true) : formatNumber(v)
      }
    },
    series: [
      {
        name: metricLabelMap[selectedMetric],
        type: 'line',
        smooth: true,
        data: trend.map(t => (t as any)[selectedMetric]),
        itemStyle: { color: metricColorMap[selectedMetric] },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: `${metricColorMap[selectedMetric]}40` },
              { offset: 1, color: `${metricColorMap[selectedMetric]}00` }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 6,
      }
    ]
  };

  // Channels Donut Chart
  const channelChartOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: '{b}: <b>{c}</b> ({d}%)'
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 8,
    },
    series: [
      {
        name: 'Sales Channel',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        data: channels.map(c => ({
          name: c.channel,
          value: c.revenue
        }))
      }
    ]
  };

  // Payment Methods Bar Chart
  const paymentChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontSize: 11 },
      formatter: (params: any) => {
        const item = params[0];
        return `<div class="font-bold">${item.name}</div>
          <div class="text-slate-300">Sales: <b>${formatINR(item.value)}</b></div>`;
      }
    },
    grid: { top: 15, right: 20, bottom: 20, left: 100 },
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
      data: payment_methods.map(p => p.method).reverse(),
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B', fontSize: 10 }
    },
    series: [
      {
        type: 'bar',
        data: payment_methods.map(p => p.revenue).reverse(),
        itemStyle: {
          color: '#1E40AF',
          borderRadius: [0, 4, 4, 0]
        },
        barMaxWidth: 18,
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Trend Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales & Profit Trends</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose a metric and timeframe to see how numbers change over time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            {(['revenue', 'gross_profit', 'orders', 'units', 'aov'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedMetric === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {metricLabelMap[m]}
              </button>
            ))}
          </div>

          {/* Interval Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                interval === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('daily')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                interval === 'daily' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <EChart option={trendChartOption} height="320px" />
      </div>

      {/* Channel Breakdown & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Channels */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <ShoppingBag className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
                Where Orders Happen (Channels)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">In-Store, Assisted Online, or B2B Direct</p>
            </div>
          </div>
          <EChart option={channelChartOption} height="260px" />
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <CreditCard className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
                How Customers Pay
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">UPI, Net Banking, Credit Cards & Store Credit</p>
            </div>
          </div>
          <EChart option={paymentChartOption} height="260px" />
        </div>
      </div>
    </div>
  );
};
