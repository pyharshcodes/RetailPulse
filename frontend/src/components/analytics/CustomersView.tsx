import React, { useEffect, useState } from 'react';
import { Users, UserPlus, RefreshCw, Award, Info, Calendar, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { CustomerData } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR, formatNumber, formatPercent } from '../../utils/formatters';

export const CustomersView: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCustomers(filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load customers analytics', err))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
        <SkeletonLoader label="Computing customer RFM segmentation matrix..." height="h-64" />
        <SkeletonLoader label="Building retention cohort heatmap..." height="h-80" />
      </div>
    );
  }

  if (!data) return <EmptyState title="No customer activity found" />;

  const { kpis, rfm, retention_cohort, top_customers } = data;

  return (
    <div className="space-y-6">
      {/* 1. Customer Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Customers</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{formatNumber(kpis.total_customers)}</div>
          <div className="text-[11px] text-slate-400 mt-1">In active period</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">First-Time Buyers</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{formatNumber(kpis.new_customers)}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">First purchase in period</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Repeat Buyers</div>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{formatNumber(kpis.returning_customers)}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Bought more than once</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Repeat Buyer Rate</div>
          <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">{kpis.repeat_purchase_rate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">&gt;1 orders in period</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Avg Spend / Customer</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{formatINR(kpis.average_revenue_per_customer, false)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Average per customer</div>
        </div>
      </div>

      {/* 2. Customer Loyalty Groups Grid */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Loyalty Groups</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grouped by how recently they bought, how often they visit, and total amount spent.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Calculated from transaction history</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {rfm.segments.map(seg => (
            <div key={seg.segment} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={seg.segment} size="sm" />
                  <span className="text-[10px] text-slate-400 font-mono">{seg.share_percent}%</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {formatNumber(seg.count)}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                  {formatINR(seg.revenue)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {seg.revenue_share}% of total sales
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Avg Orders:</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{seg.avg_frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Recency:</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{seg.avg_recency_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Spend:</span>
                  <span className="font-mono font-medium text-slate-700">{formatINR(seg.avg_monetary, false)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Monthly Retention Cohort Heatmap */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Customer Retention Cohort Heatmap</h3>
            <p className="text-xs text-slate-500">
              Percentage of customers acquired in Month 0 who placed repeat transactions in subsequent months.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            True transaction-level tracking
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600 bg-slate-50">
                <th className="py-2.5 px-3 text-left">Acquisition Cohort</th>
                <th className="py-2.5 px-3 text-right">Cohort Size</th>
                {retention_cohort.columns.map(col => (
                  <th key={col} className="py-2.5 px-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retention_cohort.cohorts.map(row => (
                <tr key={row.cohort} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-3 text-left font-semibold text-slate-800 font-mono">
                    {row.cohort}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono">
                    {row.cohort_size}
                  </td>
                  {row.retention.map((pct, idx) => {
                    // Color intensity based on retention percentage
                    let bg = '#F8FAFC';
                    let text = '#94A3B8';
                    if (pct >= 80) { bg = '#1E40AF'; text = '#FFFFFF'; }
                    else if (pct >= 60) { bg = '#3B82F6'; text = '#FFFFFF'; }
                    else if (pct >= 40) { bg = '#60A5FA'; text = '#1E293B'; }
                    else if (pct >= 20) { bg = '#BFDBFE'; text = '#1E3A8A'; }
                    else if (pct > 0) { bg = '#EFF6FF'; text = '#1E40AF'; }

                    return (
                      <td
                        key={idx}
                        className="py-2 px-2 font-mono text-[11px] transition-colors"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {pct > 0 ? `${pct}%` : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Top Customer Accounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Highest Value Customer Accounts</h3>
          <p className="text-xs text-slate-500">Contractors, Commercial accounts, and VIP retail buyers.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-4">Account Name</th>
                <th className="py-2.5 px-4">Customer Type</th>
                <th className="py-2.5 px-4">City</th>
                <th className="py-2.5 px-4 text-right">Total Net Spend</th>
                <th className="py-2.5 px-4 text-right">Orders</th>
                <th className="py-2.5 px-4 text-right">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top_customers.map(c => (
                <tr key={c.customer_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {c.customer_name}
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">{c.customer_id}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                      {c.customer_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{c.city}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900">
                    {formatINR(c.total_spent)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                    {c.orders}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                    {c.last_purchase}
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
