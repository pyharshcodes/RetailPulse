import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Tenant,
  Plan,
  PlanTier,
  KpiSummary,
  PosTransaction,
  MarginRiskItem,
  StockoutAlert,
  AIInsight,
  TeamMember,
} from '../types';
import {
  MOCK_PLANS,
  MOCK_KPIS,
  INITIAL_POS_TRANSACTIONS,
  MOCK_MARGIN_RISKS,
  MOCK_STOCKOUT_ALERTS,
  MOCK_AI_INSIGHTS,
  fetchPlans,
  verifyPaymentUtr,
} from '../api/client';

interface AuthContextType {
  tenant: Tenant;
  plans: Plan[];
  activePlan: Plan;
  currency: 'INR' | 'USD' | 'EUR';
  setCurrency: (c: 'INR' | 'USD' | 'EUR') => void;
  formatCurrency: (amount: number) => string;
  kpis: KpiSummary;
  posTransactions: PosTransaction[];
  liveStreaming: boolean;
  toggleLiveStreaming: () => void;
  simulateNewSale: () => void;
  marginRisks: MarginRiskItem[];
  stockoutAlerts: StockoutAlert[];
  aiInsights: AIInsight[];
  teamMembers: TeamMember[];
  isPaymentModalOpen: boolean;
  targetUpgradePlan: Plan | null;
  openPaymentModal: (plan: Plan) => void;
  closePaymentModal: () => void;
  upgradePlanWithUtr: (planId: PlanTier, utr: string) => Promise<boolean>;
  switchPlanDirect: (tier: PlanTier) => void;
}

const DEFAULT_TENANT: Tenant = {
  id: 1,
  name: 'RetailPulse MegaStore',
  slug: 'retailpulse-hq',
  domain: 'app.retailpulse.ai',
  is_active: true,
  tier: 'pro',
  subscription_status: 'active',
  created_at: new Date().toISOString(),
  upi_merchant_id: 'harshdeepchak97-1@oksbi',
  last_payment_ref: 'UPI/UTR/849204821',
  last_payment_amount: 499,
};

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Harsh Vardhan', email: 'harsh@retailpulse.ai', role: 'Owner', status: 'Active' },
  { id: '2', name: 'Priya Sharma', email: 'priya@retailpulse.ai', role: 'Manager', status: 'Active' },
  { id: '3', name: 'Amit Verma', email: 'amit@retailpulse.ai', role: 'Analyst', status: 'Active' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant>(DEFAULT_TENANT);
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [kpis, setKpis] = useState<KpiSummary>(MOCK_KPIS);
  const [posTransactions, setPosTransactions] = useState<PosTransaction[]>(INITIAL_POS_TRANSACTIONS);
  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);
  const [marginRisks, setMarginRisks] = useState<MarginRiskItem[]>(MOCK_MARGIN_RISKS);
  const [stockoutAlerts, setStockoutAlerts] = useState<StockoutAlert[]>(MOCK_STOCKOUT_ALERTS);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>(MOCK_AI_INSIGHTS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<Plan | null>(null);

  // Load plans from API or mock
  useEffect(() => {
    fetchPlans().then((loadedPlans) => {
      if (loadedPlans && loadedPlans.length > 0) {
        setPlans(loadedPlans);
      }
    });
  }, []);

  const activePlan = plans.find((p) => p.id === tenant.tier) || plans[1] || MOCK_PLANS[1];

  const formatCurrency = useCallback(
    (amount: number) => {
      if (currency === 'USD') {
        const usd = (amount / 86).toFixed(1);
        return `$${Number(usd).toLocaleString()}`;
      }
      if (currency === 'EUR') {
        const eur = (amount / 92).toFixed(1);
        return `€${Number(eur).toLocaleString()}`;
      }
      return `₹${amount.toLocaleString('en-IN')}`;
    },
    [currency]
  );

  // Real-time simulated POS stream ticker
  const simulateNewSale = useCallback(() => {
    const stores = ['Connaught Place', 'Bandra West', 'Indiranagar', 'Cyber Hub', 'Koramangala'];
    const sampleItems = [
      { category: 'Electronics', sku: 'APPLE-AIRPODS-PRO', baseAmount: 18990, margin: 28.5 },
      { category: 'Apparel', sku: 'ZARA-SLIM-CHINO', baseAmount: 2990, margin: 52.4 },
      { category: 'FMCG', sku: 'RED-BULL-CAN-250ML', baseAmount: 125, margin: 36.0 },
      { category: 'Footwear', sku: 'NIKE-PEGASUS-40', baseAmount: 10495, margin: 44.0 },
      { category: 'Beverages', sku: 'STARBUCKS-ROAST-BEAN', baseAmount: 899, margin: 41.2 },
      { category: 'Electronics', sku: 'BOAT-BASSHEADS-100', baseAmount: 399, margin: -3.2 },
    ];

    const pickItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    const pickStore = stores[Math.floor(Math.random() * stores.length)];
    const methods: ('UPI' | 'Card' | 'Cash')[] = ['UPI', 'UPI', 'Card', 'Cash'];
    const pickMethod = methods[Math.floor(Math.random() * methods.length)];

    const newTx: PosTransaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      timestamp: 'Just now',
      store_name: pickStore,
      category: pickItem.category,
      sku: pickItem.sku,
      amount: pickItem.baseAmount,
      margin_pct: pickItem.margin,
      payment_method: pickMethod,
      is_new: true,
    };

    setPosTransactions((prev) => [newTx, ...prev.slice(0, 19)]);
    setKpis((prev) => ({
      ...prev,
      total_revenue: prev.total_revenue + pickItem.baseAmount,
      total_orders: prev.total_orders + 1,
    }));
  }, []);

  // Timer interval for real-time live POS stream simulation
  useEffect(() => {
    if (!liveStreaming) return;
    const interval = setInterval(() => {
      simulateNewSale();
    }, 4500);
    return () => clearInterval(interval);
  }, [liveStreaming, simulateNewSale]);

  const toggleLiveStreaming = () => setLiveStreaming((prev) => !prev);

  const openPaymentModal = (plan: Plan) => {
    setTargetUpgradePlan(plan);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setTargetUpgradePlan(null);
  };

  const upgradePlanWithUtr = async (planId: PlanTier, utr: string): Promise<boolean> => {
    try {
      const res = await verifyPaymentUtr({
        tenant_id: tenant.id,
        plan_id: planId,
        utr,
      });

      if (res.success) {
        const chosenPlan = plans.find((p) => p.id === planId);
        setTenant((prev) => ({
          ...prev,
          tier: planId,
          subscription_status: 'active',
          last_payment_ref: utr,
          last_payment_at: new Date().toISOString(),
          last_payment_amount: chosenPlan?.price_monthly || 0,
        }));
        closePaymentModal();
        return true;
      }
      return false;
    } catch (err: any) {
      throw err;
    }
  };

  const switchPlanDirect = (tier: PlanTier) => {
    setTenant((prev) => ({
      ...prev,
      tier,
      subscription_status: 'active',
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        tenant,
        plans,
        activePlan,
        currency,
        setCurrency,
        formatCurrency,
        kpis,
        posTransactions,
        liveStreaming,
        toggleLiveStreaming,
        simulateNewSale,
        marginRisks,
        stockoutAlerts,
        aiInsights,
        teamMembers,
        isPaymentModalOpen,
        targetUpgradePlan,
        openPaymentModal,
        closePaymentModal,
        upgradePlanWithUtr,
        switchPlanDirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
