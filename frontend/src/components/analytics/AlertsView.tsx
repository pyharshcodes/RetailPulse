import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';
import { AlertsData, AlertItem } from '../../types';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { EmptyState } from '../common/EmptyState';

export const AlertsView: React.FC = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  useEffect(() => {
    setLoading(true);
    api.getAlerts(filters)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load alerts', err))
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
        <SkeletonLoader label="Auditing store targets and stock thresholds..." height="h-96" />
      </div>
    );
  }

  if (!data || data.alerts.length === 0) {
    return <EmptyState title="No active business alerts detected" message="All store targets and inventory thresholds are within normal parameters." />;
  }

  const { total_alerts, severity_counts, alerts } = data;

  const filteredAlerts = severityFilter === 'All'
    ? alerts
    : alerts.filter(a => a.severity === severityFilter);

  return (
    <div className="space-y-6">
      {/* 1. Alerts Severity Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All Active Notices</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">{total_alerts} Signals</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Issues requiring review</div>
        </div>

        <div className="bg-rose-50/40 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 shadow-subtle">
          <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Needs Attention Now</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{severity_counts.Critical} Critical</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1">Urgent action recommended</div>
        </div>

        <div className="bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-subtle">
          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Watch Closely</div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{severity_counts.Warning} Warnings</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1">Approaching risk limits</div>
        </div>

        <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 shadow-subtle">
          <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Good to Know</div>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{severity_counts.Info} Signals</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400/80 mt-1">General business updates</div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1">Show:</span>
          {[
            { key: 'All', label: 'All Notices' },
            { key: 'Critical', label: 'Needs Attention Now' },
            { key: 'Warning', label: 'Watch Closely' },
            { key: 'Info', label: 'Good to Know' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSeverityFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                severityFilter === item.key
                  ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Showing {filteredAlerts.length} of {total_alerts} notices
        </span>
      </div>

      {/* 3. Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'Critical';
          const isWarning = alert.severity === 'Warning';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all shadow-subtle ${
                isCritical
                  ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/40 hover:border-rose-300'
                  : isWarning
                  ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/40 hover:border-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}
                  >
                    {isCritical ? 'Attention' : isWarning ? 'Warning' : 'Info'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{alert.category}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{alert.entity_name}</span>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span className="text-slate-700 dark:text-slate-300">Actual: <b className="text-slate-900 dark:text-white">{alert.actual}</b></span>
                  <span className="text-slate-400 dark:text-slate-500">Expected: {alert.expected}</span>
                  <span className={`font-bold ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    Difference: {alert.variance}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {alert.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
