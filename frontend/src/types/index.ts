export interface FilterState {
  start_date: string;
  end_date: string;
  region?: string;
  state?: string;
  store?: string;
  category?: string;
  subcategory?: string;
  customer_type?: string;
  sales_channel?: string;
}

export interface FilterOptions {
  regions: string[];
  states: string[];
  stores: { store_id: string; store_name: string; region: string; city: string }[];
  categories: string[];
  subcategories: string[];
  customer_types: string[];
  sales_channels: string[];
}

export interface KPICardData {
  current: number;
  previous: number;
  absolute_change: number;
  percentage_change: number | null;
}

export interface ExecutiveOverviewData {
  kpis: {
    revenue: KPICardData;
    gross_profit: KPICardData;
    gross_margin: KPICardData;
    orders: KPICardData;
    units: KPICardData;
    aov: KPICardData;
  };
  targets: {
    target_revenue: number;
    target_gross_profit: number;
    revenue_achievement: number;
    variance: number;
  };
  revenue_trend: {
    period: string;
    revenue: number;
    gross_profit: number;
    gross_margin: number;
    orders: number;
    units: number;
    aov: number;
    target_revenue: number;
    target_achievement: number | null;
    variance: number | null;
  }[];
  category_performance: {
    category: string;
    revenue: number;
    gross_profit: number;
    gross_margin: number;
    units: number;
    orders: number;
    revenue_share: number;
  }[];
  top_stores: {
    store_id: string;
    store_name: string;
    city: string;
    region: string;
    revenue: number;
    gross_profit: number;
    margin_percent: number;
    transactions: number;
  }[];
  highlights: {
    type: string;
    title: string;
    text: string;
    impact: 'positive' | 'negative' | 'neutral' | 'warning';
  }[];
}

export interface SalesAnalyticsData {
  kpis: any;
  interval: string;
  trend: {
    period: string;
    revenue: number;
    gross_profit: number;
    orders: number;
    units: number;
    aov: number;
    margin_percent: number;
    discounts: number;
  }[];
  channels: {
    channel: string;
    revenue: number;
    orders: number;
    revenue_share: number;
    gross_profit: number;
  }[];
  payment_methods: {
    method: string;
    revenue: number;
    orders: number;
    share_percent: number;
  }[];
}

export interface StoreItem {
  store_id: string;
  store_name: string;
  city: string;
  region: string;
  revenue: number;
  gross_profit: number;
  margin_percent: number;
  orders: number;
  units: number;
  aov: number;
  growth: number;
  target: number;
  achievement: number;
  status: 'Above Target' | 'On Track' | 'Needs Attention';
}

export interface ProductItem {
  product_id: string;
  product_name: string;
  category: string;
  subcategory: string;
  revenue: number;
  gross_profit: number;
  units: number;
  margin_percent: number;
  growth: number;
}

export interface RFMSegment {
  segment: string;
  count: number;
  share_percent: number;
  revenue: number;
  revenue_share: number;
  avg_frequency: number;
  avg_recency_days: number;
  avg_monetary: number;
}

export interface CohortRow {
  cohort: string;
  cohort_size: number;
  retention: number[];
}

export interface CustomerData {
  kpis: {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    repeat_purchase_rate: number;
    average_revenue_per_customer: number;
  };
  rfm: {
    total_analyzed_customers: number;
    segments: RFMSegment[];
    methodology: string;
  };
  retention_cohort: {
    columns: string[];
    cohorts: CohortRow[];
  };
  top_customers: {
    customer_id: string;
    customer_name: string;
    customer_type: string;
    city: string;
    total_spent: number;
    orders: number;
    last_purchase: string;
  }[];
}

export interface InventoryData {
  summary: {
    inventory_value: number;
    total_units: number;
    total_tracked_skus: number;
    low_stock_skus: number;
    overstocked_skus: number;
    aging_skus: number;
    aging_value_90_plus: number;
    inventory_turnover: number;
    aging_distribution: {
      bucket: string;
      sku_count: number;
      value: number;
      units: number;
      share: number;
    }[];
  };
  items: {
    id: number;
    store_id: string;
    store_name: string;
    city: string;
    product_id: string;
    product_name: string;
    category: string;
    subcategory: string;
    closing_stock: number;
    reorder_point: number;
    unit_cost: number;
    total_value: number;
    days_since_last_sale: number;
    aging_bucket: string;
    stock_status: string;
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ProfitabilityData {
  kpis: {
    net_revenue: number;
    cogs: number;
    gross_profit: number;
    gross_margin_percent: number;
  };
  waterfall: {
    name: string;
    value: number;
    type: 'total' | 'deduction' | 'subtotal';
  }[];
  by_category: {
    category: string;
    revenue: number;
    cogs: number;
    gross_profit: number;
    margin_percent: number;
  }[];
  by_region: {
    region: string;
    revenue: number;
    cogs: number;
    gross_profit: number;
    margin_percent: number;
  }[];
  high_revenue_low_margin: {
    product_id: string;
    product_name: string;
    category: string;
    revenue: number;
    gross_profit: number;
    margin_percent: number;
    units: number;
  }[];
}

export interface AlertItem {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  category: string;
  entity_type: string;
  entity_name: string;
  metric: string;
  actual: string;
  expected: string;
  variance: string;
  explanation: string;
}

export interface AlertsData {
  total_alerts: number;
  severity_counts: {
    Critical: number;
    Warning: number;
    Info: number;
  };
  alerts: AlertItem[];
}
