import React, { useState } from 'react';
import { RotateCcw, X, Calendar, MapPin, Store, Layers, Users, ShoppingBag, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
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

  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  // Count how many secondary filters are active
  const advancedCount = [filters.region, filters.customer_type, filters.sales_channel].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 transition-colors duration-200 shadow-sm shrink-0">
      {/* Primary Row: 3 Core Filters + Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
        {/* 1. Date Period */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
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
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
          >
            <option value="last12">Full Year 2026</option>
            <option value="ytd">H2 2026 (Jun - Dec)</option>
            <option value="q4">Q4 Festive (Oct - Dec 2026)</option>
            <option value="all">2-Year Complete (2025-2026)</option>
          </select>
        </div>

        {/* 2. Store Location */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Store className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
            Store Location
          </label>
          <select
            value={filters.store || ''}
            onChange={(e) => updateFilter('store', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
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

        {/* 3. Category */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
            <Layers className="w-3 h-3 mr-1 text-slate-400 dark:text-slate-500" />
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
          >
            <option value="">All 11 Categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 4. More Filters Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              showAdvanced || advancedCount > 0
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
            {advancedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                {advancedCount}
              </span>
            )}
            {showAdvanced ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>
        </div>

        {/* 5. Reset Action */}
        <div>
          <button
            type="button"
            onClick={resetFilters}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Secondary Expandable Row: Region, Customer Type, Sales Channel */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Region */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-slate-400" />
              Region
            </label>
            <select
              value={filters.region || ''}
              onChange={(e) => updateFilter('region', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
            >
              <option value="">All 5 Regions</option>
              {filterOptions.regions.map((r) => (
                <option key={r} value={r}>
                  {r} Region
                </option>
              ))}
            </select>
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
              <Users className="w-3 h-3 mr-1 text-slate-400" />
              Customer Type
            </label>
            <select
              value={filters.customer_type || ''}
              onChange={(e) => updateFilter('customer_type', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
            >
              <option value="">All Customer Types</option>
              {filterOptions.customer_types.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* Sales Channel */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center">
              <ShoppingBag className="w-3 h-3 mr-1 text-slate-400" />
              Sales Channel
            </label>
            <select
              value={filters.sales_channel || ''}
              onChange={(e) => updateFilter('sales_channel', e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
            >
              <option value="">All Sales Channels</option>
              {filterOptions.sales_channels.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips Row */}
      {activeFilterCount > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">Active filters:</span>

          {filters.region && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Region: {filters.region}
              <button onClick={() => removeFilter('region')} className="ml-1 hover:text-brand-900 dark:hover:text-white" title="Remove filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.store && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Store: {filterOptions.stores.find((s) => s.store_id === filters.store)?.store_name || filters.store}
              <button onClick={() => removeFilter('store')} className="ml-1 hover:text-brand-900 dark:hover:text-white" title="Remove filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Category: {filters.category}
              <button onClick={() => removeFilter('category')} className="ml-1 hover:text-brand-900 dark:hover:text-white" title="Remove filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.customer_type && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Customer: {filters.customer_type}
              <button onClick={() => removeFilter('customer_type')} className="ml-1 hover:text-brand-900 dark:hover:text-white" title="Remove filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.sales_channel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Channel: {filters.sales_channel}
              <button onClick={() => removeFilter('sales_channel')} className="ml-1 hover:text-brand-900 dark:hover:text-white" title="Remove filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
