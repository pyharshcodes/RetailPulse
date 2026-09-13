import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['Above Target', 'Healthy', 'High Value', 'Loyal'].includes(status)) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (['On Track', 'Growing', 'Warning'].includes(status)) {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (['Needs Attention', 'Critical', 'Low Stock', 'At Risk'].includes(status)) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (['Overstocked', 'Aging', 'Low Engagement'].includes(status)) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};
