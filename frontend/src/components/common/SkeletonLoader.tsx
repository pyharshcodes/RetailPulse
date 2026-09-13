import React from 'react';

interface SkeletonLoaderProps {
  label?: string;
  rows?: number;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  label = 'Loading analytics data...',
  rows = 4,
  height = 'h-48'
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="h-3 bg-slate-100 rounded w-16"></div>
      </div>
      <div className={`w-full ${height} bg-slate-50 rounded-lg flex flex-col items-center justify-center p-4`}>
        <div className="text-xs text-slate-400 font-medium mb-3 flex items-center">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping mr-2"></div>
          {label}
        </div>
        <div className="w-full space-y-2 max-w-md">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-2.5 bg-slate-200 rounded" style={{ width: `${100 - i * 15}%` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};
