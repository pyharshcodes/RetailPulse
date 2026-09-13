import axios from 'axios';
import { FilterState, ExecutiveOverviewData, SalesAnalyticsData, StoreItem, ProductItem, CustomerData, InventoryData, ProfitabilityData, AlertsData, FilterOptions } from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

function serializeFilters(filters: FilterState): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.region) params.region = filters.region;
  if (filters.state) params.state = filters.state;
  if (filters.store) params.store = filters.store;
  if (filters.category) params.category = filters.category;
  if (filters.subcategory) params.subcategory = filters.subcategory;
  if (filters.customer_type) params.customer_type = filters.customer_type;
  if (filters.sales_channel) params.sales_channel = filters.sales_channel;
  return params;
}

export const api = {
  // Demo & Metadata
  getDemoStatus: async () => {
    const res = await apiClient.get('/demo/status');
    return res.data;
  },

  getFilterOptions: async (): Promise<FilterOptions> => {
    const res = await apiClient.get('/demo/filter-options');
    return res.data;
  },

  getLandingPreview: async () => {
    const res = await apiClient.get('/demo/preview');
    return res.data;
  },

  // Overview
  getOverview: async (filters: FilterState): Promise<ExecutiveOverviewData> => {
    const res = await apiClient.get('/overview', { params: serializeFilters(filters) });
    return res.data;
  },

  getAttribution: async (metric: string, filters: FilterState) => {
    const res = await apiClient.get('/overview/attribution', {
      params: { metric, ...serializeFilters(filters) }
    });
    return res.data;
  },

  // Sales
  getSales: async (interval: string, filters: FilterState): Promise<SalesAnalyticsData> => {
    const res = await apiClient.get('/sales', {
      params: { interval, ...serializeFilters(filters) }
    });
    return res.data;
  },

  // Stores
  getStores: async (filters: FilterState, sortBy = 'revenue', order = 'desc') => {
    const res = await apiClient.get('/stores', {
      params: { sort_by: sortBy, order, ...serializeFilters(filters) }
    });
    return res.data;
  },

  getStoreDetail: async (storeId: string, filters: FilterState) => {
    const res = await apiClient.get(`/stores/${storeId}`, {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  compareStores: async (storeIds: string[], filters: FilterState) => {
    const res = await apiClient.get('/stores/compare', {
      params: { store_ids: storeIds.join(','), ...serializeFilters(filters) }
    });
    return res.data;
  },

  // Products
  getProducts: async (filters: FilterState, search = '', sortBy = 'revenue', order = 'desc', page = 1, limit = 25) => {
    const res = await apiClient.get('/products', {
      params: { search, sort_by: sortBy, order, page, limit, ...serializeFilters(filters) }
    });
    return res.data;
  },

  getProductMatrix: async (filters: FilterState) => {
    const res = await apiClient.get('/products/matrix', {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  getProductDetail: async (productId: string, filters: FilterState) => {
    const res = await apiClient.get(`/products/${productId}`, {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  // Customers
  getCustomers: async (filters: FilterState): Promise<CustomerData> => {
    const res = await apiClient.get('/customers', {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  // Inventory
  getInventory: async (filters: FilterState, status?: string, page = 1, limit = 25): Promise<InventoryData> => {
    const res = await apiClient.get('/inventory', {
      params: { status, page, limit, ...serializeFilters(filters) }
    });
    return res.data;
  },

  // Profitability
  getProfitability: async (filters: FilterState): Promise<ProfitabilityData> => {
    const res = await apiClient.get('/profitability', {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  // Geography
  getGeography: async (filters: FilterState) => {
    const res = await apiClient.get('/geography', {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  // Targets
  getTargets: async (filters: FilterState) => {
    const res = await apiClient.get('/targets', {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  // Alerts
  getAlerts: async (filters: FilterState): Promise<AlertsData> => {
    const res = await apiClient.get('/alerts', {
      params: serializeFilters(filters)
    });
    return res.data;
  },

  // Explorer
  getExplorer: async (filters: FilterState, search = '', sortBy = 'transaction_date', order = 'desc', page = 1, limit = 50) => {
    const res = await apiClient.get('/explorer', {
      params: { search, sort_by: sortBy, order, page, limit, ...serializeFilters(filters) }
    });
    return res.data;
  },

  // Omni-search
  omniSearch: async (query: string) => {
    const res = await apiClient.get('/search', {
      params: { q: query }
    });
    return res.data;
  },

  // Report URLs
  getPdfDownloadUrl: (reportType: string, filters: FilterState): string => {
    const query = new URLSearchParams({ report_type: reportType, ...serializeFilters(filters) });
    return `/api/reports/pdf?${query.toString()}`;
  },

  getCsvExportUrl: (filters: FilterState): string => {
    const query = new URLSearchParams(serializeFilters(filters));
    return `/api/reports/csv?${query.toString()}`;
  }
};
