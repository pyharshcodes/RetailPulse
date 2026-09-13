import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, TrendingDown, Store, Layers, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { formatINR, formatPercent } from '../../utils/formatters';

export const TargetsView: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTargets(filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load targets', err))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
        <SkeletonLoader label="Computing target variance by month and store..." height="h-80" />
      </div>
    );
  }

  if (!data) return <EmptyState title="No target benchmarks found" />;

  const { summary, monthly_targets, store_targets, category_targets } = data;

  return (
    <div className="space-y-6">
      {/* 1. Target Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Sales Goal</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{formatINR(summary.total_target_revenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Budgeted target</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Actual Sales</div>
          <div className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">{formatINR(summary.total_actual_revenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Net realized revenue</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Difference vs Goal</div>
          <div className={`text-xl font-bold font-mono mt-1 ${summary.overall_variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {summary.overall_variance >= 0 ? '+' : ''}{formatINR(summary.overall_variance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{summary.overall_variance >= 0 ? 'Surplus ahead of target' : 'Deficit behind target'}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Goal Reached %</div>
          <div className={`text-xl font-bold font-mono mt-1 ${summary.overall_achievement_percent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
            {summary.overall_achievement_percent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">100% is on target</div>
        </div>
      </div>

      {/* 2. Monthly Target vs Actual Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
            Month-by-Month Goal Tracking
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-2.5 px-4">Month</th>
                <th className="py-2.5 px-4 text-right">Actual Sales</th>
                <th className="py-2.5 px-4 text-right">Goal Sales</th>
                <th className="py-2.5 px-4 text-right">Difference</th>
                <th className="py-2.5 px-4 text-right">Goal %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthly_targets.map((m: any) => (
                <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white font-mono">{m.month}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-900 dark:text-white">{formatINR(m.actual_revenue)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">{formatINR(m.target_revenue)}</td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    <span className={m.variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {m.variance >= 0 ? '+' : ''}{formatINR(m.variance)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold">
                    <span className={m.achievement_percent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : m.achievement_percent < 90 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                      {m.achievement_percent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Store & Category Target Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Target Achievement */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
            <Store className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
            Store Goal Progress
          </h4>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-2">Store</th>
                  <th className="pb-2 text-right">Actual Sales</th>
                  <th className="pb-2 text-right">Goal</th>
                  <th className="pb-2 text-right">Reached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {store_targets.map((s: any) => (
                  <tr key={s.store_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-2 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{s.store_name.replace('Vertex ', '')}</td>
                    <td className="py-2 text-right font-mono text-slate-900 dark:text-white">{formatINR(s.actual_revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-500 dark:text-slate-400">{formatINR(s.target_revenue)}</td>
                    <td className="py-2 text-right font-mono font-bold">
                      <span className={s.achievement_percent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : s.achievement_percent < 90 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {s.achievement_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Target Achievement */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
            Category Goal Progress
          </h4>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Actual Sales</th>
                  <th className="pb-2 text-right">Goal</th>
                  <th className="pb-2 text-right">Reached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {category_targets.map((c: any) => (
                  <tr key={c.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{c.category}</td>
                    <td className="py-2 text-right font-mono text-slate-900 dark:text-white">{formatINR(c.actual_revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-500 dark:text-slate-400">{formatINR(c.target_revenue)}</td>
                    <td className="py-2 text-right font-mono font-bold">
                      <span className={c.achievement_percent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : c.achievement_percent < 90 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {c.achievement_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
