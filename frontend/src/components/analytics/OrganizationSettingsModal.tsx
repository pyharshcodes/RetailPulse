import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Key,
  Users,
  Copy,
  Check,
  RefreshCw,
  UserPlus,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserOut } from '../../types';
import { PaymentModal } from '../payment/PaymentModal';

interface OrganizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrganizationSettingsModal: React.FC<OrganizationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { tenant, refreshTenant, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'team' | 'plans'>('profile');

  // Form states
  const [orgName, setOrgName] = useState(tenant?.name || '');
  const [industry, setIndustry] = useState(tenant?.industry || 'Retail & Electronics');
  const [currency, setCurrency] = useState(tenant?.currency || 'INR');

  // API Key state
  const [apiKey, setApiKey] = useState(tenant?.api_key || '');
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState<UserOut[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);

  // Status feedback
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalPlan, setPaymentModalPlan] = useState<'pro' | 'business'>('pro');

  useEffect(() => {
    if (tenant) {
      setOrgName(tenant.name);
      setIndustry(tenant.industry || 'Retail & Electronics');
      setCurrency(tenant.currency || 'INR');
      setApiKey(tenant.api_key || '');
    }
  }, [tenant]);

  useEffect(() => {
    if (isOpen && activeTab === 'team') {
      loadTeam();
    }
  }, [isOpen, activeTab]);

  const loadTeam = async () => {
    try {
      const members = await api.getTeamMembers();
      setTeamMembers(members);
    } catch (err) {
      console.error('Failed to load team', err);
    }
  };

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
      const numFormat = currency === 'INR' ? 'indian' : 'international';
      await api.updateCurrentTenant({
        name: orgName,
        industry,
        currency,
        currency_symbol: sym,
        number_format: numFormat,
      });
      await refreshTenant();
      setStatusMsg({ type: 'success', text: 'Organization settings successfully saved.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Regenerating this API key will immediately invalidate any POS integrations using the previous key. Proceed?')) {
      return;
    }
    setRegenerating(true);
    setStatusMsg(null);
    try {
      const res = await api.regenerateApiKey();
      setApiKey(res.api_key);
      await refreshTenant();
      setStatusMsg({ type: 'success', text: 'New API Key generated.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to regenerate API Key.' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setStatusMsg(null);
    try {
      await api.inviteTeamMember({
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
        password: 'Password@123',
      });
      setInviteEmail('');
      setInviteName('');
      await loadTeam();
      setStatusMsg({ type: 'success', text: `Invitation sent to ${inviteEmail} (Temp password: Password@123)` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to invite team member.' });
    } finally {
      setInviting(false);
    }
  };

  const handleSelectPlan = async (tier: 'free' | 'pro' | 'business') => {
    if (isDemo) {
      alert('Plan switching is disabled in demo mode. Create an organization workspace to choose your package.');
      return;
    }

    // Free plan activates immediately with zero payment
    if (tier === 'free') {
      setSaving(true);
      setStatusMsg(null);
      try {
        await api.changePlan('free');
        await refreshTenant();
        setStatusMsg({
          type: 'success',
          text: 'Switched to Free Forever plan! All team members have free access to your workspace.'
        });
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to switch to Free plan.' });
      } finally {
        setSaving(false);
      }
      return;
    }

    // Paid plans (Pro or Business) trigger the UPI QR Payment Modal
    setPaymentModalPlan(tier);
    setPaymentModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Workspace Settings
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold uppercase border border-brand-500/30">
                  {tenant?.plan_tier || 'PRO'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Organization: {tenant?.name} ({tenant?.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setStatusMsg(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            General & Currency
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('api'); setStatusMsg(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'api'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            API & ERP
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('team'); setStatusMsg(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'team'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Users className="w-4 h-4 text-brand-400" />
            Team
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('plans'); setStatusMsg(null); }}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'plans'
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Plans & Billing
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & CURRENCY */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={isDemo}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Reporting Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={isDemo}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 disabled:opacity-60"
                  >
                    <option value="INR">₹ INR (Crores / Lakhs)</option>
                    <option value="USD">$ USD (Millions / K)</option>
                    <option value="EUR">€ EUR (Millions)</option>
                    <option value="GBP">£ GBP (Millions)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry Vertical</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isDemo}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 disabled:opacity-60"
                  >
                    <option value="Retail & Electronics">Consumer Electronics</option>
                    <option value="Supermarket & Grocery">Supermarket & Grocery</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Pharmacy & Health">Pharmacy & Health</option>
                  </select>
                </div>
              </div>

              {isDemo && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  Settings are read-only in public demo mode. Register a free business workspace to customize currency and business name.
                </div>
              )}

              {!isDemo && (
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </form>
          )}

          {/* TAB 2: API KEY & ERP SYNC */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Live Ingestion API Key</div>
                    <div className="text-xs text-slate-400">Use to pipe real-time POS checkouts via HTTP API</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    disabled={regenerating || isDemo}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs text-cyan-300 truncate">
                    {apiKey || 'No API key generated yet'}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyApiKey}
                    disabled={!apiKey}
                    className="p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-2">
                <div className="font-semibold text-slate-300">HTTP REST Ingestion Example:</div>
                <div className="bg-black/90 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  curl -X POST "https://retailpulse.io/api/onboarding/simulate-live-transaction" \<br />
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_TOKEN" \<br />
                  &nbsp;&nbsp;-H "X-Tenant-Key: {apiKey || 'YOUR_KEY'}"
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM MEMBERS */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Invite Form */}
              {!isDemo && (
                <form onSubmit={handleInviteMember} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-brand-400" />
                    Invite Organization Member
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input
                      type="text"
                      required
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Colleague Full Name"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="work@company.com"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="manager">Store Manager</option>
                      <option value="analyst">Financial Analyst</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="py-2 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {inviting ? 'Inviting...' : 'Send Access Invite'}
                  </button>
                </form>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Workspace Team ({teamMembers.length})
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {teamMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-brand-300">
                          {m.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{m.full_name}</div>
                          <div className="text-[11px] text-slate-400">{m.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                          {m.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLANS & PACKAGES */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Active Plan</div>
                  <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400">
                      {tenant?.plan_tier === 'free' ? 'FREE FOREVER' : (tenant?.plan_tier?.toUpperCase() || 'FREE FOREVER')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                      {tenant?.subscription_status === 'active' ? 'Active' : 'Trial'}
                    </span>
                  </div>
                  {tenant?.last_payment_ref && (
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      Last UTR: <span className="text-white">{tenant.last_payment_ref}</span> • Paid: ₹{tenant.last_payment_amount || 499}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Workspace / Team Access</div>
                  <div className="text-xs font-semibold text-brand-400">
                    {tenant?.name} • All {teamMembers.length || 1} team seats covered
                  </div>
                </div>
              </div>

              {/* 3 Package Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Free Forever */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  (tenant?.plan_tier || 'free') === 'free'
                    ? 'bg-slate-950 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">Free Forever</div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        ₹0 / $0
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Always free for single boutique counters</p>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-white">₹0</span>
                      <span className="text-xs text-slate-400"> / forever</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        1 Store Counter Location
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        2,500 Monthly Transactions
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        CSV Data Ingestion
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        2 Team Seats (Free for team)
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={(tenant?.plan_tier || 'free') === 'free' || saving}
                    onClick={() => handleSelectPlan('free')}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-bold transition-all border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-slate-200"
                  >
                    {(tenant?.plan_tier || 'free') === 'free' ? 'Current Active' : 'Switch to Free'}
                  </button>
                </div>

                {/* 2. Pro Growth */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                  tenant?.plan_tier === 'pro'
                    ? 'bg-indigo-950/40 border-cyan-500 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-cyan-500 to-brand-600 text-[9px] font-bold text-white rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                  <div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm font-bold text-white">Pro Growth</div>
                      <span className="text-[9px] font-mono text-cyan-400 font-semibold">Low Cost</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">For scaling retail stores & chains</p>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-cyan-400">
                        {tenant?.currency === 'USD' ? '$9' : '₹499'}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        Up to 5 Store Locations
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        50,000 Monthly Transactions
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        Live POS Streamer Engine
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        Margin Risk Radar
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        5 Team Seats Included
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={tenant?.plan_tier === 'pro' || saving}
                    onClick={() => handleSelectPlan('pro')}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-cyan-600 to-brand-600 hover:from-cyan-500 hover:to-brand-500 disabled:opacity-50 text-white shadow-md"
                  >
                    {tenant?.plan_tier === 'pro' ? 'Current Package' : 'Upgrade via UPI QR (₹499)'}
                  </button>
                </div>

                {/* 3. Business Enterprise */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  tenant?.plan_tier === 'business'
                    ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">Business</div>
                      <span className="text-[9px] font-mono text-amber-400 font-semibold">Enterprise</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">For warehouse networks & groups</p>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-amber-400">
                        {tenant?.currency === 'USD' ? '$29' : '₹1,499'}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Unlimited Stores & DCs
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        500,000 Transactions
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ERP Sync API Key (SAP/Tally)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Unlimited Team Seats
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        99.99% SLA & Support
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={tenant?.plan_tier === 'business' || saving}
                    onClick={() => handleSelectPlan('business')}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-bold transition-all bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-md"
                  >
                    {tenant?.plan_tier === 'business' ? 'Current Package' : 'Upgrade via UPI QR (₹1,499)'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UPI QR Payment Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedPlan={paymentModalPlan}
        onSuccess={() => {
          setStatusMsg({
            type: 'success',
            text: `Payment verified! Workspace successfully upgraded to ${paymentModalPlan.toUpperCase()}!`
          });
        }}
      />
    </div>
  );
};
