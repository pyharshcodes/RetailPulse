export type PlanTier = 'free' | 'pro' | 'business';

export interface PlanLimits {
  stores: number;
  monthly_orders: number;
  history_days: number;
  team_members: number;
  ai_radar: boolean;
  export_enabled: boolean;
}

export interface Plan {
  id: PlanTier;
  name: string;
  tagline: string;
  price_monthly: number;
  price_annual: number;
  currency: string;
  popular: boolean;
  features: string[];
  limits: PlanLimits;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  is_active: boolean;
  tier: PlanTier;
  subscription_status: string;
  created_at: string;
  upi_merchant_id?: string;
  last_payment_ref?: string;
  last_payment_at?: string;
  last_payment_amount?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Analyst' | 'Viewer';
  status: 'Active' | 'Invited';
}

export interface KpiSummary {
  total_revenue: number;
  gross_margin_pct: number;
  total_orders: number;
  yoy_growth_pct: number;
  avg_basket_size: number;
  active_stores: number;
}

export interface PosTransaction {
  id: string;
  timestamp: string;
  store_name: string;
  category: string;
  sku: string;
  amount: number;
  margin_pct: number;
  payment_method: 'UPI' | 'Card' | 'Cash';
  is_new?: boolean;
}

export interface MarginRiskItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  selling_price: number;
  cost_price: number;
  margin_pct: number;
  loss_amount: number;
  store: string;
  suggested_price: number;
}

export interface StockoutAlert {
  id: string;
  sku: string;
  name: string;
  store: string;
  current_stock: number;
  daily_sales_velocity: number;
  days_of_supply: number;
  risk_level: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'anomaly';
  title: string;
  impact_amount: string;
  recommendation: string;
  confidence_score: number;
}
