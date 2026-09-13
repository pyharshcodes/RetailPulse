import React from 'react';
import { FilterX } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

interface EmptyStateProps {
  title?: string;
  message?: string;
  showReset?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'No data matches the selected combination of filters for this period.',
  showReset = true
}) => {
  const { resetFilters } = useFilters();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-dashed border-slate-300">
      <div className="p-3 bg-slate-100 text-slate-500 rounded-full mb-3">
        <FilterX className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{message}</p>
      {showReset && (
        <button
          onClick={resetFilters}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
};
