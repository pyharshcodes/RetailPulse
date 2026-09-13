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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Total Active Alerts</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{total_alerts} Signals</div>
          <div className="text-[11px] text-slate-400 mt-1">Rule-based & statistical</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-subtle bg-rose-50/20">
          <div className="text-[10px] font-semibold text-rose-700 uppercase">Critical Severity</div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">{severity_counts.Critical} Critical</div>
          <div className="text-[11px] text-rose-600 mt-1">Immediate action required</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-subtle bg-amber-50/20">
          <div className="text-[10px] font-semibold text-amber-700 uppercase">Warning Severity</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">{severity_counts.Warning} Warnings</div>
          <div className="text-[11px] text-amber-600 mt-1">Approaching thresholds</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-subtle bg-blue-50/20">
          <div className="text-[10px] font-semibold text-blue-700 uppercase">Informational</div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">{severity_counts.Info} Signals</div>
          <div className="text-[11px] text-blue-600 mt-1">Trend notices</div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-600 mr-2">Filter by Severity:</span>
          {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredAlerts.length} of {total_alerts} alerts
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
                  ? 'bg-white border-rose-200 hover:border-rose-300'
                  : isWarning
                  ? 'bg-white border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{alert.category}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-600">{alert.entity_name}</span>
                </div>

                <div className="flex items-center space-x-4 text-xs font-mono">
                  <span>Actual: <b>{alert.actual}</b></span>
                  <span className="text-slate-400">Expected: {alert.expected}</span>
                  <span className={`font-bold ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                    Variance: {alert.variance}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {alert.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
