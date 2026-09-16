import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Building,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  LogOut,
  Clock,
  Smartphone
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TenantOut } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: 'pro' | 'business';
  defaultBilling?: 'monthly' | 'annual';
  onSuccess?: (tenant: TenantOut) => void;
  isPaywall?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPlan = 'pro',
  defaultBilling = 'monthly',
  onSuccess,
  isPaywall = false,
}) => {
  const { tenant, refreshTenant, logout } = useAuth();

  const [activePlan, setActivePlan] = useState<'pro' | 'business'>(
    selectedPlan === 'business' ? 'business' : 'pro'
  );
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(defaultBilling);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [utrRef, setUtrRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 10-Minute Payment Session Countdown
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (selectedPlan) {
      setActivePlan(selectedPlan === 'business' ? 'business' : 'pro');
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      setUtrRef('');
      setErrorMsg(null);
      setSuccess(false);
      return;
    }

    setBillingCycle(defaultBilling);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, defaultBilling]);

  if (!isOpen) return null;

  // Plan Pricing Matrix
  const pricingData = {
    pro: {
      name: 'Pro Growth',
      tagline: 'High-velocity intelligence for scaling retail stores & chains',
      INR: {
        monthly: 499,
        annual: 399 * 12, // ₹4,788
        monthlyEquivalent: 399
      },
      USD: {
        monthly: 9,
        annual: 7 * 12, // $84
        monthlyEquivalent: 7
      },
      features: [
        'Up to 5 Store Locations',
        '50,000 Monthly Transactions',
        'Real-Time Live POS Streamer Engine',
        'Margin Risk Radar & Alarms',
        '5 Team Seats with Role Access'
      ]
    },
    business: {
      name: 'Business Enterprise',
      tagline: 'Omnichannel architecture for warehouse networks & retail groups',
      INR: {
        monthly: 1499,
        annual: 1199 * 12, // ₹14,388
        monthlyEquivalent: 1199
      },
      USD: {
        monthly: 29,
        annual: 24 * 12, // $288
        monthlyEquivalent: 24
      },
      features: [
        'Unlimited Stores & Warehouses',
        '500,000 Monthly Transactions',
        'Real-Time Live POS Ingestion Streamer',
        'REST API Key for SAP / ERP Sync',
        'Unlimited Team Seats & 99.99% SLA'
      ]
    }
  };

  const planInfo = pricingData[activePlan];
  const payableAmount =
    currency === 'INR'
      ? (billingCycle === 'annual' ? planInfo.INR.annual : planInfo.INR.monthly)
      : (billingCycle === 'annual' ? planInfo.USD.annual : planInfo.USD.monthly);

  const formattedAmount =
    currency === 'INR'
      ? `₹${payableAmount.toLocaleString('en-IN')}`
      : `$${payableAmount}`;

  // Official UPI merchant receiver - Harsh deep Chak
  const upiId = 'harshdeepchak97-1@oksbi';
  const payeeName = 'Harsh deep Chak';
  const upiNote = `RetailPulse ${planInfo.name} ${billingCycle}`;
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${payableAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const qrCodeUrl = `/assets/payment-qr.jpg`;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrRef.trim() || utrRef.trim().length < 4) {
      setErrorMsg('Please enter a valid 12-digit UPI UTR reference or transaction number.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const updatedTenant = await api.verifyPayment({
        plan_tier: activePlan,
        billing_cycle: billingCycle,
        amount: payableAmount,
        currency,
        utr_reference: utrRef.trim().toUpperCase(),
        notes: `Paid via UPI QR for ${activePlan.toUpperCase()} ${billingCycle}`,
      });

      await refreshTenant();
      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(updatedTenant);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || 'Payment verification failed. Please check your 12-digit UTR reference.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[95vh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isPaywall
                ? 'bg-gradient-to-tr from-amber-600 to-rose-600 shadow-rose-500/20'
                : 'bg-gradient-to-tr from-cyan-600 to-brand-600 shadow-cyan-500/20'
            }`}>
              {isPaywall ? <Lock className="w-5 h-5" /> : (activePlan === 'pro' ? <Zap className="w-5 h-5" /> : <Building className="w-5 h-5" />)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {isPaywall ? 'Workspace Locked — Payment Required' : `Upgrade to ${planInfo.name}`}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {activePlan.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isPaywall ? (
                  <span>Scan QR to activate workspace for <strong className="text-slate-200">{tenant?.name}</strong></span>
                ) : (
                  <span>Workspace: <strong className="text-slate-200 font-medium">{tenant?.name}</strong></span>
                )}
              </p>
            </div>
          </div>

          {!isPaywall && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 relative z-10">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Verified Successfully!</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  Your workspace is now upgraded to <strong className="text-cyan-400">{planInfo.name}</strong>.
                  All team members now have immediate access.
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                UTR: {utrRef} • Status: Active
              </div>
            </div>
          ) : (
            <>
              {/* Paywall Banner Alert */}
              {isPaywall && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">Payment Verification Required</strong>
                    Free access is blocked. Complete payment to <strong>Harsh deep Chak</strong> via the Google Pay QR below to unlock your dashboard and team access.
                  </div>
                </div>
              )}

              {/* Plan Tier Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePlan('pro')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePlan === 'pro'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">Pro Growth</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">₹499/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Up to 5 stores, 50k txns/mo, POS streaming</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlan('business')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activePlan === 'business'
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">Business Enterprise</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">₹1,499/mo</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Unlimited stores, 500k txns/mo, full ERP sync</p>
                </button>
              </div>

              {/* Billing Cycle & Price Header */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                {/* Billing toggle */}
                <div className="inline-flex items-center bg-slate-900 p-1 rounded-lg border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center space-x-1.5 transition-all ${
                      billingCycle === 'annual'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      Save 20%
                    </span>
                  </button>
                </div>

                {/* Payable Amount Badge */}
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Payable Amount</div>
                  <div className="text-2xl font-black text-white tracking-tight flex items-baseline justify-end space-x-1">
                    <span className="text-cyan-400">{formattedAmount}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      {billingCycle === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>
                </div>
              </div>

              {/* UPI QR Payment Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
                {/* QR Code Canvas / Container */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="w-44 h-44 bg-white p-2.5 rounded-xl shadow-lg border border-cyan-400/50 flex items-center justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="Scan UPI QR Code"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  {/* Session Timer */}
                  <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] font-mono text-cyan-300">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>Expires in {timeFormatted}</span>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="flex-1 space-y-3.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-xs font-bold text-slate-200">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>Scan with Google Pay, PhonePe, Paytm or BHIM</span>
                  </div>

                  {/* Merchant Details Box */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Verified Payee:</span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Harsh deep Chak
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Official UPI ID:</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white truncate select-all">
                        {upiId}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors text-slate-300"
                        title="Copy UPI ID"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-tight">
                    Pay <strong className="text-cyan-400">{formattedAmount}</strong> and submit the 12-digit Bank UTR below. Access unlocks immediately.
                  </div>
                </div>
              </div>

              {/* UTR Reference Input Form */}
              <form onSubmit={handleVerifyPayment} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Enter UPI UTR / Bank Reference Number (12 Digits)
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Instant Verification
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={utrRef}
                    onChange={(e) => setUtrRef(e.target.value)}
                    placeholder="e.g. 423985718293"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Check your UPI app (GPay / PhonePe / Paytm) transaction details for the 12-digit UTR / UPI Ref ID.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  {isPaywall ? (
                    <button
                      type="button"
                      onClick={logout}
                      className="py-3 px-4 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/30 flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isVerifying || !utrRef.trim()}
                    className="flex-2 w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 disabled:opacity-50 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                  >
                    {isVerifying ? (
                      <span>Verifying Payment...</span>
                    ) : (
                      <>
                        <span>{isPaywall ? 'Verify & Unlock Workspace' : `Confirm & Activate ${planInfo.name}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security guarantee */}
              <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-500 border-t border-white/5 pt-3">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Encrypted Bank Reconciliation</span>
                </span>
                <span>•</span>
                <span>Team Access Included</span>
                <span>•</span>
                <span>Cancel Anytime</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
