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
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Deterministic Attribution</span>
              <h2 className="text-base font-bold text-slate-900 capitalize">Why did {metric.replace('_', ' ')} change?</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {loading || !data ? (
              <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
                Decomposing dimensional delta factors...
              </div>
            ) : (
              <>
                {/* Summary Banner */}
                <div className="p-4 rounded-xl bg-slate-900 text-white shadow-sm">
                  <div className="text-xs text-slate-400 font-medium">Period Variance</div>
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
                    <span>Current: {formatINR(data.total_current)}</span>
                    <span>Previous: {formatINR(data.total_previous)}</span>
                  </div>
                </div>

                {/* 1. Category Contributors */}
                <div>
                  <div className="flex items-center text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                    Top Category Drivers
                  </div>
                  <div className="space-y-1.5">
                    {data.category_contributors?.map((c: any) => (
                      <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{formatINR(c.current)} vs {formatINR(c.previous)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${c.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {c.delta >= 0 ? '+' : ''}{formatINR(c.delta)}
                          </div>
                          <div className="text-[10px] text-slate-500">{formatPercent(c.pct_change)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Regional Contributors */}
                <div>
                  <div className="flex items-center text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                    Regional Contributions
                  </div>
                  <div className="space-y-1.5">
                    {data.regional_contributors?.map((r: any) => (
                      <div key={r.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-xs">
                        <div className="font-semibold text-slate-800">{r.name} Region</div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${r.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {r.delta >= 0 ? '+' : ''}{formatINR(r.delta)}
                          </div>
                          <div className="text-[10px] text-slate-500">{formatPercent(r.pct_change)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Store Contributors */}
                <div>
                  <div className="flex items-center text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                    <Store className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                    Largest Store Variances
                  </div>
                  <div className="space-y-1.5">
                    {data.store_contributors?.map((s: any) => (
                      <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-150 text-xs">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={s.name}>{s.name}</div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${s.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {s.delta >= 0 ? '+' : ''}{formatINR(s.delta)}
                          </div>
                          <div className="text-[10px] text-slate-500">{formatPercent(s.pct_change)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footnote */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    Evidence-based variance attribution: drivers are mathematically calculated from transaction delta records without LLM hallucination.
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
