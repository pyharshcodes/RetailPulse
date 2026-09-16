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

  // Team states
  const [teamMembers, setTeamMembers] = useState<UserOut[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('manager');
  const [inviting, setInviting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleUpgradePlan = async (tier: string) => {
    if (isDemo) {
      alert('Plan switching is disabled in demo mode. Create an organization workspace to choose your package.');
      return;
    }
    setSaving(true);
    setStatusMsg(null);
    try {
      await api.changePlan(tier);
      await refreshTenant();
      setStatusMsg({ type: 'success', text: `Subscription successfully updated to ${tier.toUpperCase()} package!` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update subscription.' });
    } finally {
      setSaving(false);
    }
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
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Active Plan</div>
                  <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    <span>{tenant?.plan_tier?.toUpperCase() || 'PRO'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Workspace</div>
                  <div className="text-xs font-semibold text-brand-400">{tenant?.name}</div>
                </div>
              </div>

              {/* 3 Package Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Starter */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  (tenant?.plan_tier || 'trial') === 'starter'
                    ? 'bg-slate-950 border-brand-500 ring-1 ring-brand-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="text-sm font-bold text-white">Starter</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">For single stores & boutique retail</p>
                    <div className="mt-3">
                      <span className="text-xl font-extrabold text-white">
                        {tenant?.currency === 'USD' ? '$59' : '₹4,999'}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Up to 3 Store Locations
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        25k Monthly Txns
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        CSV Data Ingestion
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        2 Team Seats
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={(tenant?.plan_tier || 'trial') === 'starter' || saving}
                    onClick={() => handleUpgradePlan('starter')}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-bold transition-all border border-slate-700 hover:bg-slate-800 disabled:opacity-50 text-slate-200"
                  >
                    {(tenant?.plan_tier || 'trial') === 'starter' ? 'Current Package' : 'Switch to Starter'}
                  </button>
                </div>

                {/* Pro */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                  (tenant?.plan_tier || 'trial') === 'pro' || (tenant?.plan_tier || 'trial') === 'trial'
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-brand-500 to-indigo-500 text-[9px] font-bold text-white rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">Professional</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">For growing multi-store chains</p>
                    <div className="mt-3">
                      <span className="text-xl font-extrabold text-white">
                        {tenant?.currency === 'USD' ? '$179' : '₹14,999'}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Up to 15 Store Locations
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        250k Monthly Txns
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Live POS Streamer Engine
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ERP Sync API Key
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        10 Team Seats
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={(tenant?.plan_tier || 'trial') === 'pro' || saving}
                    onClick={() => handleUpgradePlan('pro')}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-md"
                  >
                    {(tenant?.plan_tier || 'trial') === 'pro' ? 'Current Package' : 'Select Pro'}
                  </button>
                </div>

                {/* Business */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  (tenant?.plan_tier || 'trial') === 'business'
                    ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="text-sm font-bold text-white">Business Enterprise</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">For warehouse networks & chains</p>
                    <div className="mt-3">
                      <span className="text-xl font-extrabold text-white">
                        {tenant?.currency === 'USD' ? '$479' : '₹39,999'}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>
                    <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Unlimited Stores & Warehouses
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Unlimited Transactions
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Custom ERP Connectors (SAP/Oracle)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Unlimited Team Seats
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Dedicated SLA & Account Manager
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={(tenant?.plan_tier || 'trial') === 'business' || saving}
                    onClick={() => handleUpgradePlan('business')}
                    className="mt-5 w-full py-2 rounded-lg text-xs font-bold transition-all bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-md"
                  >
                    {(tenant?.plan_tier || 'trial') === 'business' ? 'Current Package' : 'Upgrade to Enterprise'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
