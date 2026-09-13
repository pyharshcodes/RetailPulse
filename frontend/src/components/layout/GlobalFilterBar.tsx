import React from 'react';
import { RotateCcw, X, Calendar, MapPin, Store, Layers, Users, ShoppingBag } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';

export const GlobalFilterBar: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const {
    filters,
    filterOptions,
    updateFilter,
    removeFilter,
    resetFilters,
    setDatePreset,
    activeFilterCount,
  } = useFilters();

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 transition-colors duration-200 shadow-sm shrink-0">
      {/* Primary Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Date Presets */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-slate-400" />
            Date Period
          </label>
          <select
            value={
              filters.start_date === '2026-01-01' && filters.end_date === '2026-12-31'
                ? 'last12'
                : filters.start_date === '2026-06-01'
                ? 'ytd'
                : filters.start_date === '2026-10-01'
                ? 'q4'
                : filters.start_date === '2025-01-01'
                ? 'all'
                : 'custom'
            }
            onChange={(e) => setDatePreset(e.target.value as any)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          >
            <option value="last12">Full Year 2026 (Default)</option>
            <option value="ytd">H2 2026 (Jun - Dec)</option>
            <option value="q4">Q4 Festive (Oct - Dec 2026)</option>
            <option value="all">Full 2-Year Dataset (2025-2026)</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            Region
          </label>
          <select
            value={filters.region || ''}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          >
            <option value="">All Regions</option>
            {filterOptions.regions.map((r) => (
              <option key={r} value={r}>
                {r} Region
              </option>
            ))}
          </select>
        </div>

        {/* Store */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Store className="w-3 h-3 mr-1 text-slate-400" />
            Store Location
          </label>
          <select
            value={filters.store || ''}
            onChange={(e) => updateFilter('store', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          >
            <option value="">All 20 Stores</option>
            {filterOptions.stores
              .filter((s) => !filters.region || s.region === filters.region)
              .map((s) => (
                <option key={s.store_id} value={s.store_id}>
                  {s.city} ({s.store_name.replace('Vertex ', '')})
                </option>
              ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Layers className="w-3 h-3 mr-1 text-slate-400" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          >
            <option value="">All 11 Categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Segment */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Users className="w-3 h-3 mr-1 text-slate-400" />
            Customer Type
          </label>
          <select
            value={filters.customer_type || ''}
            onChange={(e) => updateFilter('customer_type', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          >
            <option value="">All Segments</option>
            {filterOptions.customer_types.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>

        {/* Sales Channel */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <ShoppingBag className="w-3 h-3 mr-1 text-slate-400" />
            Sales Channel
          </label>
          <select
            value={filters.sales_channel || ''}
            onChange={(e) => updateFilter('sales_channel', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          >
            <option value="">All Channels</option>
            {filterOptions.sales_channels.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Action */}
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeFilterCount > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-150 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Active filters:</span>

          {filters.region && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
              Region: {filters.region}
              <button onClick={() => removeFilter('region')} className="ml-1 hover:text-brand-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.store && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
              Store: {filterOptions.stores.find((s) => s.store_id === filters.store)?.store_name || filters.store}
              <button onClick={() => removeFilter('store')} className="ml-1 hover:text-brand-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
              Category: {filters.category}
              <button onClick={() => removeFilter('category')} className="ml-1 hover:text-brand-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.customer_type && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
              Customer: {filters.customer_type}
              <button onClick={() => removeFilter('customer_type')} className="ml-1 hover:text-brand-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.sales_channel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
              Channel: {filters.sales_channel}
              <button onClick={() => removeFilter('sales_channel')} className="ml-1 hover:text-brand-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
