import React, { useState } from 'react';
import { X, Building2, User, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'demo';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onSuccess,
}) => {
  const { login, register, loginDemo, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'demo'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [industry, setIndustry] = useState('Retail & Electronics');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(email, password);
      setSuccessMsg('Successfully signed in.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
      const numFormat = currency === 'INR' ? 'indian' : 'international';

      await register({
        company_name: companyName,
        full_name: fullName,
        email,
        password,
        industry,
        currency,
        currency_symbol: sym,
        number_format: numFormat,
      });

      setSuccessMsg(`Welcome to RetailPulse! Workspace created for ${companyName}.`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to register account. Please try again.');
    }
  };

  const handleDemoClick = async () => {
    setErrorMsg(null);
    try {
      await loginDemo();
      setSuccessMsg('Logged into Vertex Retail Group demo sandbox.');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } catch (err: any) {
      setErrorMsg('Failed to initialize demo sandbox.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 h-1.5 w-full" />

        {/* Modal Top Bar */}
        <div className="p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/20">
              RP
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                RetailPulse Workspace
              </h2>
              <p className="text-xs text-slate-400">Enterprise Multi-Store Analytics Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Create Organization
          </button>
          <button
            type="button"
            onClick={() => { setTab('demo'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'demo'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            Instant Demo
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {successMsg}
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@company.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-300">Demo Credentials:</span> admin@retailpulse.io / admin123
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Signing In...' : 'Sign In to Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER MULTI-TENANT SAAS */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Hypermarkets or Zara Stores"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="INR">₹ INR (Crores / Lakhs)</option>
                    <option value="USD">$ USD (Millions / K)</option>
                    <option value="EUR">€ EUR (Millions)</option>
                    <option value="GBP">£ GBP (Millions)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Retail & Electronics">Consumer Electronics</option>
                    <option value="Supermarket & Grocery">Grocery & FMCG</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Pharmacy & Health">Pharmacy & Health</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min 6 characters)"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-brand-950/40 border border-brand-800/40 rounded-xl text-xs space-y-1">
                <div className="flex items-center text-brand-300 font-semibold gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  14-Day Free Enterprise Trial
                </div>
                <div className="text-[11px] text-slate-400">
                  Isolated multi-tenant SQLite/PostgreSQL store, CSV upload, live POS transaction simulator, and multi-user access included. No credit card required.
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Setting up Workspace...' : 'Launch Isolated SaaS Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: GUEST DEMO */}
          {tab === 'demo' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Globe className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Vertex Retail Group (Public Sandbox)</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Explore full telemetry, cross-store filtering, executive KPIs, and inventory risk across 20 retail locations in India without signing up.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Network Footprint:</span>
                  <span className="font-mono text-cyan-400 font-bold">20 Stores across 12 Cities</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Transaction Volume:</span>
                  <span className="font-mono text-cyan-400 font-bold">89,000+ Receipts Analyzed</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Annual Turnover:</span>
                  <span className="font-mono text-emerald-400 font-bold">₹64.46 Cr (Net Sales)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoClick}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-semibold rounded-xl text-sm border border-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Connecting to Sandbox...' : 'Enter Vertex Demo Cockpit'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
