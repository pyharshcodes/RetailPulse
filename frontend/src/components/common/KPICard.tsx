import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { formatINR, formatNumber, formatPercent } from '../../utils/formatters';

interface KPICardProps {
  title: string;
  current: number;
  previous: number;
  pctChange: number | null;
  absChange: number;
  type?: 'currency' | 'number' | 'percent';
  icon?: React.ReactNode;
  subtitle?: string;
  onInspect?: () => void;
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  current,
  previous,
  pctChange,
  absChange,
  type = 'currency',
  icon,
  subtitle,
  onInspect,
  highlight = false,
}) => {
  const isPositive = pctChange !== null && pctChange > 0;
  const isNegative = pctChange !== null && pctChange < 0;

  const formattedCurrent =
    type === 'currency'
      ? formatINR(current)
      : type === 'percent'
      ? `${current.toFixed(1)}%`
      : formatNumber(current);

  const formattedPrevious =
    type === 'currency'
      ? formatINR(previous)
      : type === 'percent'
      ? `${previous.toFixed(1)}%`
      : formatNumber(previous);

  return (
    <div
      className={`relative p-5 rounded-xl border transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-brand-900 to-slate-900 border-brand-700 text-white shadow-md'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-subtle hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-brand-200' : 'text-slate-500 dark:text-slate-400'}`}>
          {title}
        </span>
        <div className="flex items-center space-x-1.5">
          {onInspect && (
            <button
              onClick={onInspect}
              title="Explain what changed"
              className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${highlight ? 'hover:bg-white/10 text-brand-200' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
          {icon && (
            <div className={`p-1.5 rounded-lg ${highlight ? 'bg-white/10 text-brand-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight tabular-nums font-mono">
          {formattedCurrent}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-dashed border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center space-x-1">
          {pctChange === null ? (
            <span className={`flex items-center px-1.5 py-0.5 rounded font-medium ${highlight ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <Minus className="w-3 h-3 mr-0.5" /> N/A
            </span>
          ) : isPositive ? (
            <span className="flex items-center px-1.5 py-0.5 rounded font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              {formatPercent(pctChange)}
            </span>
          ) : isNegative ? (
            <span className="flex items-center px-1.5 py-0.5 rounded font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400">
              <TrendingDown className="w-3 h-3 mr-1" />
              {formatPercent(pctChange)}
            </span>
          ) : (
            <span className={`flex items-center px-1.5 py-0.5 rounded font-medium ${highlight ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <Minus className="w-3 h-3 mr-0.5" /> 0.0%
            </span>
          )}
          <span className={`ml-1 text-[11px] ${highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
            vs last period ({formattedPrevious})
          </span>
        </div>
        {subtitle && (
          <span className={`text-[11px] ${highlight ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
