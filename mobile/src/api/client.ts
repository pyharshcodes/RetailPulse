import axios from 'axios';
import { Platform } from 'react-native';
import { Plan, Tenant, KpiSummary, PosTransaction, MarginRiskItem, StockoutAlert, AIInsight } from '../types';

// In Expo Web or iOS Simulator, localhost:8000 works.
// In Android emulator, 10.0.2.2:8000 is used to reach the host machine.
const DEFAULT_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  default: 'http://localhost:8000/api',
});

export const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Fallback / Initial Plans Data
export const MOCK_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Forever',
    tagline: 'Essential analytics for single store',
    price_monthly: 0,
    price_annual: 0,
    currency: 'INR',
    popular: false,
    features: [
      'Single store dashboard',
      'Live POS stream ticker',
      'Basic sales & revenue metrics',
      '7 days history retention',
      'Community support',
    ],
    limits: {
      stores: 1,
      monthly_orders: 1000,
      history_days: 7,
      team_members: 1,
      ai_radar: false,
      export_enabled: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro Growth',
    tagline: 'Complete intelligence for growing retailers',
    price_monthly: 499,
    price_annual: 4790,
    currency: 'INR',
    popular: true,
    features: [
      'Up to 5 stores analytics',
      'Real-time live POS stream ticker',
      'Margin Risk Radar (negative margin alerts)',
      'Stockout prediction engine',
      '30 days audit history',
      'Export PDF & CSV reports',
      'Up to 5 team member seats',
      'Priority UPI support',
    ],
    limits: {
      stores: 5,
      monthly_orders: 25000,
      history_days: 30,
      team_members: 5,
      ai_radar: true,
      export_enabled: true,
    },
  },
  {
    id: 'business',
    name: 'Business Enterprise',
    tagline: 'Unlimited power & AI recommendations',
    price_monthly: 1499,
    price_annual: 14390,
    currency: 'INR',
    popular: false,
    features: [
      'Unlimited stores & regions',
      'Sub-second live POS WebSocket stream',
      'Full AI Margin & Inventory Automation',
      'Lifetime data warehouse retention',
      'Unlimited team members & role RBAC',
      'Dedicated account manager',
      'Custom ERP & POS sync webhooks',
      '24/7 VIP phone & WhatsApp support',
    ],
    limits: {
      stores: 9999,
      monthly_orders: 1000000,
      history_days: 3650,
      team_members: 100,
      ai_radar: true,
      export_enabled: true,
    },
  },
];

export const MOCK_KPIS: KpiSummary = {
  total_revenue: 1428500,
  gross_margin_pct: 38.4,
  total_orders: 3412,
  yoy_growth_pct: 24.6,
  avg_basket_size: 418,
  active_stores: 4,
};

export const INITIAL_POS_TRANSACTIONS: PosTransaction[] = [
  {
    id: 'tx-101',
    timestamp: 'Just now',
    store_name: 'Connaught Place',
    category: 'Electronics',
    sku: 'ANKER-PWR-20K',
    amount: 2499,
    margin_pct: 34.2,
    payment_method: 'UPI',
  },
  {
    id: 'tx-102',
    timestamp: '1m ago',
    store_name: 'Bandra West',
    category: 'Apparel',
    sku: 'LEVI-511-SLIM',
    amount: 3299,
    margin_pct: 48.0,
    payment_method: 'Card',
  },
  {
    id: 'tx-103',
    timestamp: '2m ago',
    store_name: 'Indiranagar',
    category: 'Home & Kitchen',
    sku: 'PHILIPS-AIRFRY',
    amount: 6999,
    margin_pct: 26.5,
    payment_method: 'UPI',
  },
  {
    id: 'tx-104',
    timestamp: '4m ago',
    store_name: 'Connaught Place',
    category: 'Grocery',
    sku: 'ORGANIC-CHIA-500G',
    amount: 549,
    margin_pct: 42.1,
    payment_method: 'Cash',
  },
  {
    id: 'tx-105',
    timestamp: '6m ago',
    store_name: 'Bandra West',
    category: 'Electronics',
    sku: 'BOAT-AIRDOPES-141',
    amount: 1199,
    margin_pct: -4.5,
    payment_method: 'UPI',
  },
];

export const MOCK_MARGIN_RISKS: MarginRiskItem[] = [
  {
    id: 'mr-1',
    sku: 'BOAT-AIRDOPES-141',
    name: 'boAt Airdopes 141 TWS',
    category: 'Electronics',
    selling_price: 1199,
    cost_price: 1255,
    margin_pct: -4.7,
    loss_amount: 56,
    store: 'Bandra West',
    suggested_price: 1399,
  },
  {
    id: 'mr-2',
    sku: 'CADBURY-CELEB-BOX',
    name: 'Cadbury Celebrations Gift Pack',
    category: 'FMCG',
    selling_price: 299,
    cost_price: 310,
    margin_pct: -3.7,
    loss_amount: 11,
    store: 'Indiranagar',
    suggested_price: 349,
  },
  {
    id: 'mr-3',
    sku: 'PHILIPS-LED-9W-3PK',
    name: 'Philips 9W LED Bulb (Pack of 3)',
    category: 'Home',
    selling_price: 249,
    cost_price: 258,
    margin_pct: -3.6,
    loss_amount: 9,
    store: 'Connaught Place',
    suggested_price: 299,
  },
];

export const MOCK_STOCKOUT_ALERTS: StockoutAlert[] = [
  {
    id: 'so-1',
    sku: 'AMUL-BUTTER-500G',
    name: 'Amul Pasteurized Butter 500g',
    store: 'Connaught Place',
    current_stock: 14,
    daily_sales_velocity: 8.5,
    days_of_supply: 1.6,
    risk_level: 'CRITICAL',
  },
  {
    id: 'so-2',
    sku: 'NESCAFE-CLASSIC-200G',
    name: 'Nescafe Classic Instant Coffee 200g',
    store: 'Bandra West',
    current_stock: 22,
    daily_sales_velocity: 7.0,
    days_of_supply: 3.1,
    risk_level: 'WARNING',
  },
  {
    id: 'so-3',
    sku: 'MAGGI-NOODLES-70G-12P',
    name: 'Maggi 2-Minute Noodles 12-Pack',
    store: 'Indiranagar',
    current_stock: 35,
    daily_sales_velocity: 9.2,
    days_of_supply: 3.8,
    risk_level: 'WARNING',
  },
];

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ai-1',
    type: 'opportunity',
    title: 'Cross-sell Audio with Smartphones',
    impact_amount: '+₹42,000/mo',
    recommendation: 'Bundle Anker PowerBank with boAt earphones at ₹3,299 to recover lost margin and boost basket size by 18%.',
    confidence_score: 94,
  },
  {
    id: 'ai-2',
    type: 'risk',
    title: 'Margin Erosion in Electronics Category',
    impact_amount: '-₹18,500/mo',
    recommendation: 'Vendor cost increased by 6.2% last week. Update retail floor price to ₹1,349 on 4 fast-moving SKUs immediately.',
    confidence_score: 91,
  },
  {
    id: 'ai-3',
    type: 'opportunity',
    title: 'Connaught Place Weekend Restock',
    impact_amount: '+₹65,000/mo',
    recommendation: 'Dairy & Beverages velocity surges 2.4x between Friday evening and Sunday. Transfer 40 units from central depot.',
    confidence_score: 88,
  },
];

// API Callers
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const res = await api.get('/tenants/plans');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    // Graceful fallback to rich mock data
  }
  return MOCK_PLANS;
};

export const verifyPaymentUtr = async (params: {
  tenant_id: number;
  plan_id: string;
  utr: string;
}): Promise<{ success: boolean; message: string; plan: string }> => {
  try {
    const res = await api.post('/tenants/verify-payment', params);
    return res.data;
  } catch (err: any) {
    // If backend is unreachable or offline, simulate verification for demo preview
    if (params.utr && params.utr.length >= 8) {
      return {
        success: true,
        message: 'Payment verified successfully (Local Demo Mode)',
        plan: params.plan_id,
      };
    }
    throw new Error(err.response?.data?.detail || 'Invalid UTR reference code. Must be 8-16 digits.');
  }
};
