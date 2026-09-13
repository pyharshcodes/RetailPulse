import React, { createContext, useContext, useState, useEffect } from 'react';
import { FilterState, FilterOptions } from '../types';
import { api } from '../services/api';

interface FilterContextType {
  filters: FilterState;
  filterOptions: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: (key: keyof FilterState, value: string | undefined) => void;
  removeFilter: (key: keyof FilterState) => void;
  resetFilters: () => void;
  setDatePreset: (preset: 'last12' | 'ytd' | 'q4' | 'all') => void;
  activeFilterCount: number;
}

const DEFAULT_FILTERS: FilterState = {
  start_date: '2026-01-01',
  end_date: '2026-12-31',
  region: undefined,
  state: undefined,
  store: undefined,
  category: undefined,
  subcategory: undefined,
  customer_type: undefined,
  sales_channel: undefined,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [],
    states: [],
    stores: [],
    categories: [],
    subcategories: [],
    customer_types: [],
    sales_channels: [],
  });

  useEffect(() => {
    api.getFilterOptions()
      .then(opts => setFilterOptions(opts))
      .catch(err => console.error('Failed to load filter options', err));
  }, []);

  const updateFilter = (key: keyof FilterState, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const removeFilter = (key: keyof FilterState) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const setDatePreset = (preset: 'last12' | 'ytd' | 'q4' | 'all') => {
    if (preset === 'last12') {
      setFilters(prev => ({ ...prev, start_date: '2026-01-01', end_date: '2026-12-31' }));
    } else if (preset === 'ytd') {
      setFilters(prev => ({ ...prev, start_date: '2026-06-01', end_date: '2026-12-31' }));
    } else if (preset === 'q4') {
      setFilters(prev => ({ ...prev, start_date: '2026-10-01', end_date: '2026-12-31' }));
    } else if (preset === 'all') {
      setFilters(prev => ({ ...prev, start_date: '2025-01-01', end_date: '2026-12-31' }));
    }
  };

  // Count active dimensional filters (excluding default dates)
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'start_date' || k === 'end_date') return false;
    return Boolean(v);
  }).length;

  return (
    <FilterContext.Provider
      value={{
        filters,
        filterOptions,
        setFilters,
        updateFilter,
        removeFilter,
        resetFilters,
        setDatePreset,
        activeFilterCount,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
