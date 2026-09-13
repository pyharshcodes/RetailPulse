import React, { useEffect, useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Store, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';
import { formatINR, formatNumber, formatPercent } from '../../utils/formatters';

export const GeographyView: React.FC = () => {
  const { filters, updateFilter } = useFilters();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getGeography(filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load geography analytics', err))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-slate-200 animate-pulse p-4" />
          ))}
        </div>
        <SkeletonLoader label="Computing regional and state level performance..." height="h-72" />
      </div>
    );
  }

  if (!data || data.regions.length === 0) {
    return <EmptyState title="No regional activity found" />;
  }

  const { regions, states, cities } = data;

  return (
    <div className="space-y-6">
      {/* 1. Regional Cards (5 regions: North, South, East, West, Central) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {regions.map((r: any) => {
          const isSelected = filters.region === r.region;
          return (
            <div
              key={r.region}
              onClick={() => updateFilter('region', isSelected ? undefined : r.region)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-subtle ${
                isSelected
                  ? 'bg-brand-900 border-brand-700 text-white ring-2 ring-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 text-slate-900 dark:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-brand-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {r.region} Region
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {r.store_count} Stores
                </span>
              </div>

              <div className="mt-2 text-xl font-bold font-mono">
                {formatINR(r.revenue)}
              </div>

              <div className="mt-2 text-xs flex items-center justify-between">
                <span className={`font-semibold ${r.growth >= 0 ? (isSelected ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400') : (isSelected ? 'text-rose-300' : 'text-rose-600 dark:text-rose-400')}`}>
                  {r.growth >= 0 ? '+' : ''}{formatPercent(r.growth, false)} vs last year
                </span>
                <span className={`font-mono ${isSelected ? 'text-brand-200' : 'text-brand-600 dark:text-brand-400 font-semibold'}`}>
                  {r.margin_percent}% profit margin
                </span>
              </div>

              <div className={`mt-3 pt-2 border-t text-[10px] flex items-center justify-between ${isSelected ? 'border-brand-800 text-brand-300' : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <span>{r.revenue_share}% of all sales</span>
                <span className="font-semibold flex items-center">
                  {isSelected ? 'Active Filter' : 'Filter by Region →'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. State & City Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
            Performance by State
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-2">State</th>
                  <th className="pb-2">Region</th>
                  <th className="pb-2 text-right">Total Sales</th>
                  <th className="pb-2 text-right">Net Profit</th>
                  <th className="pb-2 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {states.map((s: any) => (
                  <tr key={s.state} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{s.state}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{s.region}</td>
                    <td className="py-2 text-right font-mono font-medium text-slate-900 dark:text-white">{formatINR(s.revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">{formatINR(s.gross_profit)}</td>
                    <td className="py-2 text-right font-mono font-semibold text-brand-600 dark:text-brand-400">{s.margin_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* City Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center">
            <Store className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
            Performance by City
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <th className="pb-2">City</th>
                  <th className="pb-2">Region</th>
                  <th className="pb-2 text-right">Total Sales</th>
                  <th className="pb-2 text-right">Orders Placed</th>
                  <th className="pb-2 text-right">Profit Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cities.map((c: any) => (
                  <tr key={c.city} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 font-medium text-slate-800 dark:text-slate-200">{c.city}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{c.region}</td>
                    <td className="py-2 text-right font-mono font-medium text-slate-900 dark:text-white">{formatINR(c.revenue)}</td>
                    <td className="py-2 text-right font-mono text-slate-700 dark:text-slate-300">{formatNumber(c.orders)}</td>
                    <td className="py-2 text-right font-mono font-semibold text-brand-600 dark:text-brand-400">{c.margin_percent}%</td>
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
