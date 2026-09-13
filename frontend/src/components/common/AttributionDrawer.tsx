import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Layers, MapPin, Store, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { formatINR, formatPercent } from '../../utils/formatters';

interface AttributionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metric: string;
}

export const AttributionDrawer: React.FC<AttributionDrawerProps> = ({ isOpen, onClose, metric }) => {
  const { filters } = useFilters();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getAttribution(metric, filters)
        .then(res => setData(res))
        .catch(err => console.error('Failed to load attribution', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, metric, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Sales Breakdown</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize">Why did {metric.replace('_', ' ')} change?</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loading || !data ? (
              <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
                Analyzing changes across categories, stores, and regions...
              </div>
            ) : (
              <>
                {/* Summary Banner */}
                <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Difference vs Last Period</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <div className="text-xl font-bold font-mono">
                      {formatINR(data.total_delta)}
                    </div>
                    <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded ${data.total_delta >= 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                      {data.total_delta >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatPercent(data.total_pct_change)}
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex justify-between border-t border-slate-800 pt-2">
                    <span>This Period: {formatINR(data.total_current)}</span>
                    <span>Last Period: {formatINR(data.total_previous)}</span>
                  </div>
                </div>

                {/* 1. Category Contributors */}
                <div>
                  <div className="flex items-center text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-600 dark:text-brand-400" />
                    Categories with Biggest Change
                  </div>
                  <div className="space-y-1.5">
                    {data.category_contributors?.map((c: any) => (
                      <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-xs">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{formatINR(c.current)} vs {formatINR(c.previous)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${c.delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {c.delta >= 0 ? '+' : ''}{formatINR(c.delta)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{formatPercent(c.pct_change)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Regional Contributors */}
                <div>
                  <div className="flex items-center text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-600 dark:text-brand-400" />
                    Regions with Biggest Change
                  </div>
                  <div className="space-y-1.5">
                    {data.regional_contributors?.map((r: any) => (
                      <div key={r.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{r.name} Region</div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${r.delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {r.delta >= 0 ? '+' : ''}{formatINR(r.delta)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{formatPercent(r.pct_change)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Store Contributors */}
                <div>
                  <div className="flex items-center text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                    <Store className="w-3.5 h-3.5 mr-1.5 text-brand-600 dark:text-brand-400" />
                    Stores with Biggest Change
                  </div>
                  <div className="space-y-1.5">
                    {data.store_contributors?.map((s: any) => (
                      <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 text-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[200px]" title={s.name}>{s.name}</div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${s.delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                            {s.delta >= 0 ? '+' : ''}{formatINR(s.delta)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{formatPercent(s.pct_change)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footnote */}
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-[11px] text-blue-800 dark:text-blue-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    Exact data calculation: these differences are calculated directly from store and category transaction records.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
