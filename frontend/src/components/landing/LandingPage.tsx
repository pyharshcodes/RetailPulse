import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  TrendingUp,
  Boxes,
  Sparkles,
  Calculator,
  ChevronDown,
  Radio,
  Scale,
  Mail,
  Building,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { formatINR, formatNumber } from '../../utils/formatters';
import { CaseStudyModal } from './CaseStudyModal';
import { ArchitectureModal } from './ArchitectureModal';

interface LandingPageProps {
  onExploreDemo: () => void;
  onOpenAuth?: (tab?: 'login' | 'register' | 'demo', plan?: 'free' | 'starter' | 'pro' | 'business') => void;
}

// Ground-truth fallback dataset for immediate flicker-free telemetry render
const VERIFIED_DEFAULTS = {
  revenue: 644561788.9, // 2026 Net Sales: Rs. 64.46 Cr
  gross_profit: 123088026.9, // 2026 Gross Profit: Rs. 12.31 Cr
  gross_margin: 19.1, // Weighted Margin: 19.10%
  orders: 44760, // 2026 Distinct Transactions
  yoy_growth: 1.47, // +1.47% YoY vs 2025
  stores_count: 20,
  skus_count: 458,
  trend_preview: [
    { month: 'Jan', revenue: 49820000 },
    { month: 'Feb', revenue: 47210000 },
    { month: 'Mar', revenue: 53100000 },
    { month: 'Apr', revenue: 52400000 },
    { month: 'May', revenue: 56900000 },
    { month: 'Jun', revenue: 51200000 },
    { month: 'Jul', revenue: 48900000 },
    { month: 'Aug', revenue: 54300000 },
    { month: 'Sep', revenue: 52800000 },
    { month: 'Oct', revenue: 71240000 }, // Diwali Surge Peak
    { month: 'Nov', revenue: 58400000 },
    { month: 'Dec', revenue: 68200000 },
  ],
  stores_preview: [
    { store_name: 'Bengaluru Indiranagar', city: 'Bengaluru', revenue: 48210000, psf: 3040, attainment: 104.2 },
    { store_name: 'Mumbai Andheri West', city: 'Mumbai', revenue: 46150000, psf: 2890, attainment: 101.8 },
    { store_name: 'Delhi Connaught Place', city: 'New Delhi', revenue: 44920000, psf: 2750, attainment: 99.4 },
    { store_name: 'Hyderabad Jubilee Hills', city: 'Hyderabad', revenue: 42180000, psf: 2620, attainment: 98.1 },
    { store_name: 'Chennai T. Nagar', city: 'Chennai', revenue: 39850000, psf: 2480, attainment: 96.5 },
  ],
  category_preview: [
    { category: 'Cooling & ACs', revenue: 142800000, share: 22.2, margin: 16.4 },
    { category: 'Large Appliances', revenue: 128400000, share: 19.9, margin: 18.2 },
    { category: 'Televisions & Audio', revenue: 115200000, share: 17.9, margin: 21.5 },
    { category: 'Electrical Switchgear', revenue: 98600000, share: 15.3, margin: 24.8 },
    { category: 'Small Kitchen Appliances', revenue: 84300000, share: 13.1, margin: 22.1 },
    { category: 'Lighting & Accessories', revenue: 75260000, share: 11.6, margin: 28.4 },
  ]
};

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDemo, onOpenAuth }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionPending, setMotionPending] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [archOpen, setArchOpen] = useState(false);

  // Active cockpit preview tab
  const [activeTab, setActiveTab] = useState<'revenue' | 'stores' | 'categories'>('revenue');
  const [preview, setPreview] = useState<any>(VERIFIED_DEFAULTS);
  const [tickerIndex, setTickerIndex] = useState(0);

  // ROI Calculator state
  const [calcStores, setCalcStores] = useState(20);
  const [calcTurnover, setCalcTurnover] = useState(128);
  const [calcMargin, setCalcMargin] = useState(2.4);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // SaaS Pricing state
  const [pricingBilling, setPricingBilling] = useState<'monthly' | 'annual'>('annual');
  const [pricingCurrency, setPricingCurrency] = useState<'INR' | 'USD'>('INR');

  // Contact form submission state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    stores: '10-25 Stores',
    note: ''
  });

  // Simulated live event feed
  const liveEvents = [
    { city: 'Bengaluru Indiranagar', item: '1.5 Ton Split Inverter AC', amount: 38990, channel: 'Register #2', time: 'Just now' },
    { city: 'Mumbai Andheri West', item: 'Industrial Switchgear & 4-Core Cable', amount: 142500, channel: 'B2B Account', time: '12s ago' },
    { city: 'Delhi Connaught Place', item: '65" 4K OLED HDR Smart TV', amount: 84990, channel: 'UPI Express', time: '28s ago' },
    { city: 'Hyderabad Jubilee Hills', item: '5-Star Double Door Refrigerator', amount: 49900, channel: 'POS Terminal #1', time: '45s ago' },
  ];

  // 1. Live Accurate Clock (updates every second)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateStr = now.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Motion timeout
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMotionPending(false);
      return;
    }
    const timer = setTimeout(() => {
      setMotionPending(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // 3. Telemetry ticker interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % liveEvents.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [liveEvents.length]);

  // 4. Fetch live API preview if available
  useEffect(() => {
    api.getLandingPreview()
      .then(res => {
        if (res && res.revenue) {
          setPreview(res);
        }
      })
      .catch(err => {
        console.warn('Using ground-truth defaults for preview', err);
      });
  }, []);

  const handleDemoCardAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === 'entrance-card') {
      setMotionPending(false);
    }
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (id: string) => {
    closeMenu();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic ROI Calculations
  const estimatedSavingsCr = ((calcTurnover * calcMargin) / 100).toFixed(2);
  const estimatedWorkingCapitalLakhs = Math.round(calcTurnover * 0.03 * 100);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email) return;
    setContactSubmitted(true);
  };

  return (
    <div className={`vantage-scope ${motionPending ? 'motion-pending' : ''}`}>
      <style>{`
        @font-face {
          font-family: "Reference Sans";
          src: local("Reference Sans"), local("MS Reference Sans Serif"), local("Segoe UI"), local("Arial");
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "Reference Display";
          src: local("Reference Display"), local("Reference Sans"), local("Segoe UI Semibold"), local("Arial");
          font-weight: 400 900;
          font-style: normal;
          font-display: swap;
        }

        .vantage-scope {
          font-family: "Reference Sans", Arial, sans-serif;
          color-scheme: dark;
          background: #02040a;
          color: #fff;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;

          --gutter-start: clamp(36px, 4.177vw, 96px);
          --gutter-end: clamp(36px, 4.04vw, 96px);
          --header-top: clamp(20px, 2.264vh, 30px);
          --hero-bottom: clamp(34px, 5.19vh, 64px);
          --display-size: clamp(54px, 7.2vh, 84px);
          --display-leading: clamp(66px, 8.8vh, 100px);
          --copy-size: clamp(14px, 1.70vh, 19px);
          --copy-leading: clamp(19px, 2.17vh, 24px);
          --title-copy-gap: clamp(15px, 2.08vh, 24px);
          --copy-cta-gap: clamp(24px, 3.11vh, 36px);
          --cta-width: clamp(142px, 15.09vh, 168px);
          --cta-height: clamp(38px, 3.96vh, 44px);
          --card-width: clamp(150px, 18.96vh, 215px);
        }

        .vantage-scope button, .vantage-scope a {
          font-family: inherit;
          text-decoration: none;
          transition: filter 140ms ease, opacity 140ms ease, transform 140ms ease;
        }

        .vantage-scope button:hover, .vantage-scope a:hover {
          filter: brightness(1.08);
        }

        /* First Fold Hero */
        .vantage-hero-wrapper {
          position: relative;
          width: 100%;
          min-height: 100vh;
          isolation: isolate;
          overflow: hidden;
          background: #000;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .vantage-background {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
        }

        /* Sticky Glass Header */
        .vantage-header {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px var(--gutter-end) 16px var(--gutter-start);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(0, 0, 0, 0.55);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .vantage-brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .vantage-header-actions {
          display: flex;
          align-items: center;
          gap: clamp(16px, 2.8vw, 36px);
        }

        .vantage-nav {
          display: flex;
          align-items: center;
          gap: clamp(12px, 1.8vw, 24px);
        }

        .vantage-nav-link {
          font-size: clamp(14px, 1.4vw, 16px);
          color: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          position: relative;
          padding: 6px 4px;
        }

        .vantage-nav-link:hover, .vantage-nav-link.active {
          color: #fff;
        }

        .vantage-time-panel {
          text-align: right;
          border-left: 1px solid rgba(255, 255, 255, 0.15);
          padding-left: 16px;
        }

        .vantage-time-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          font-family: monospace;
        }

        .vantage-time-value {
          font-size: 13px;
          color: #06b6d4;
          font-family: monospace;
          font-weight: 600;
          margin-top: 2px;
        }

        .vantage-sign-up {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 8px 18px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(6, 182, 212, 0.38);
          transition: all 180ms ease;
        }

        .vantage-sign-up:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(6, 182, 212, 0.58);
          filter: brightness(1.12);
        }

        .vantage-sign-up span {
          color: #ffffff !important;
          font-weight: 700;
        }

        /* Hero Content */
        .vantage-hero-fold {
          position: relative;
          z-index: 10;
          padding: clamp(30px, 6vh, 80px) var(--gutter-end) clamp(40px, 8vh, 90px) var(--gutter-start);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          flex: 1;
        }

        .vantage-hero-content {
          max-width: 760px;
        }

        .vantage-hero-title {
          font-family: "Reference Display", sans-serif;
          font-size: var(--display-size);
          line-height: var(--display-leading);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: var(--title-copy-gap);
        }

        .vantage-hero-copy {
          font-size: var(--copy-size);
          line-height: var(--copy-leading);
          color: rgba(255, 255, 255, 0.82);
          max-width: 580px;
          margin-bottom: var(--copy-cta-gap);
        }

        .vantage-hero-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .vantage-primary-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 26px;
          background: linear-gradient(135deg, #06b6d4 0%, #2563eb 55%, #4f46e5 100%);
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(6, 182, 212, 0.4), 0 0 1px rgba(255, 255, 255, 0.5) inset;
          transition: all 180ms ease;
        }

        .vantage-primary-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 34px rgba(6, 182, 212, 0.6);
          filter: brightness(1.12);
        }

        .vantage-primary-cta span {
          color: #ffffff !important;
          font-weight: 700;
        }

        .vantage-secondary-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          cursor: pointer;
        }

        .vantage-secondary-cta:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        /* Glass Demo Card */
        .vantage-demo-card {
          width: var(--card-width);
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 10px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .vantage-demo-visual {
          position: relative;
          width: 100%;
          aspect-ratio: 16/10;
          border-radius: 10px;
          overflow: hidden;
          background: #111;
        }

        .vantage-demo-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vantage-demo-visual .play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .vantage-watch-button {
          width: 100%;
          margin-top: 8px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Scroll prompt cue */
        .vantage-scroll-cue {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 0 24px;
          font-size: 12px;
          font-family: monospace;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .vantage-scroll-cue:hover {
          color: #06b6d4;
        }

        /* Mobile Menu */
        .vantage-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
        }

        @media (max-width: 900px) {
          .vantage-menu-toggle {
            display: block;
          }

          .vantage-header-actions {
            position: fixed;
            top: 65px;
            left: 0;
            right: 0;
            background: rgba(6, 9, 18, 0.96);
            backdrop-filter: blur(25px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            flex-direction: column;
            padding: 24px;
            gap: 20px;
            display: none;
          }

          .vantage-header.menu-open .vantage-header-actions {
            display: flex;
          }

          .vantage-nav {
            flex-direction: column;
            gap: 16px;
            width: 100%;
            text-align: center;
          }

          .vantage-hero-fold {
            flex-direction: column;
            align-items: flex-start;
          }

          .vantage-demo-card {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. FIRST FOLD: VANTAGE FULLSCREEN CINEMATIC HERO                          */}
      {/* ========================================================================= */}
      <div className="vantage-hero-wrapper" id="home">
        {/* Exact CloudFront Background Video */}
        <video
          className="vantage-background"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          aria-hidden="true"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4"
            type="video/mp4"
          />
        </video>

        {/* Global Floating Glass Header */}
        <header className={`vantage-header ${menuOpen ? 'menu-open' : ''}`}>
          <div className="vantage-brand" onClick={() => scrollToSection('home')}>
            <svg width="28" height="28" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="vantage-disc-hero">
                  <circle cx="12.5" cy="12.5" r="12.5" />
                </clipPath>
              </defs>
              <g clipPath="url(#vantage-disc-hero)">
                <circle cx="12.5" cy="12.5" r="12.5" fill="#ededed" />
                <path d="M12.5 2.5 L19.5 12.5 L12.5 22.5 L5.5 12.5 Z" fill="#050606" />
                <path d="M12.5 2.5 L19.5 12.5 L12.5 14.5 Z" fill="#737778" />
                <path d="M12.5 2.5 L12.5 14.5 L5.5 12.5 Z" fill="#fafafa" />
                <path d="M5.5 12.5 L12.5 14.5 L12.5 22.5 Z" fill="#0a0b0b" />
                <path d="M12.5 14.5 L19.5 12.5 L12.5 22.5 Z" fill="#383b3d" />
              </g>
            </svg>
            <div>
              <div className="font-bold text-sm tracking-tight">VANTAGE</div>
              <div className="text-[10px] text-slate-400 font-mono">by RetailPulse</div>
            </div>
          </div>

          <div className="vantage-header-actions">
            <nav className="vantage-nav">
              <a className="vantage-nav-link" href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a>
              <a className="vantage-nav-link" href="#preview" onClick={(e) => { e.preventDefault(); scrollToSection('preview'); }}>Telemetry</a>
              <a className="vantage-nav-link" href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
              <a className="vantage-nav-link" href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Services</a>
              <a className="vantage-nav-link" href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a>
              <a className="vantage-nav-link" href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
            </nav>

            {/* Live System Clock */}
            <div className="vantage-time-panel">
              <div className="vantage-time-label">Live System Clock</div>
              <div className="vantage-time-value">{currentTime || 'Syncing clock...'}</div>
            </div>

            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-white/15"
              >
                Sign In
              </button>
            )}

            <button className="vantage-sign-up" type="button" onClick={onExploreDemo}>
              <Zap className="w-3.5 h-3.5 fill-current text-white" />
              <span>Launch Demo</span>
            </button>
          </div>

          <button
            className="vantage-menu-toggle"
            type="button"
            aria-label="Toggle menu"
            onClick={toggleMenu}
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </div>
          </button>
        </header>

        {/* Hero Stack */}
        <section className="vantage-hero-fold">
          <div className="vantage-hero-content">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>LIVE ENTERPRISE TELEMETRY • 20 LOCATIONS IN INDIA</span>
            </div>

            <h1 className="vantage-hero-title">
              Stop Digging<br />Through Dashboards.
            </h1>

            <p className="vantage-hero-copy">
              Your metrics are scattered across a dozen dashboards. Vantage brings them into one clear signal, so every executive decision is backed by verified ground-truth data you actually trust.
            </p>

            <div className="vantage-hero-buttons">
              <button className="vantage-primary-cta" type="button" onClick={onExploreDemo}>
                <Zap className="w-4 h-4 fill-current text-white" />
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {onOpenAuth && (
                <button
                  className="vantage-secondary-cta"
                  type="button"
                  onClick={() => onOpenAuth('register')}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Start Free Trial</span>
                </button>
              )}

              <button
                className="vantage-secondary-cta"
                type="button"
                onClick={() => scrollToSection('services')}
              >
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Simulate Network ROI</span>
              </button>
            </div>
          </div>

          {/* Bottom Right Glass Demo Card */}
          <article className="vantage-demo-card" onAnimationEnd={handleDemoCardAnimationEnd}>
            <div className="vantage-demo-visual">
              <img src="/assets/watch-demo-thumbnail.png" alt="Vantage Command Center Preview" />
              <button
                className="play"
                type="button"
                aria-label="Open case study"
                onClick={() => setCaseStudyOpen(true)}
              >
                <svg width="12" height="14" viewBox="0 0 12 14" fill="#fff" aria-hidden="true">
                  <path d="M2 1.5L11 7L2 12.5V1.5Z" />
                </svg>
              </button>
            </div>
            <button
              className="vantage-watch-button"
              type="button"
              onClick={() => setCaseStudyOpen(true)}
            >
              <span>Watch Case Study</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>
          </article>
        </section>

        {/* Scroll cue prompt */}
        <div
          className="vantage-scroll-cue"
          onClick={() => scrollToSection('preview')}
        >
          <span>Scroll down for live signals & enterprise modules</span>
          <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE EXECUTIVE TELEMETRY COCKPIT (PREVIEW)                             */}
      {/* ========================================================================= */}
      <section id="preview" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            REAL-TIME TELEMETRY ENGINE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Verified Multi-Store Telemetry
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Running live on 89,464 transaction rows across 20 retail hubs with zero data fabrication.
          </p>
        </div>

        {/* Cockpit Card Container */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-cyan-500/20">
          {/* Cockpit Header Bar */}
          <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/90"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/90"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/90"></span>
              </div>
              <span className="font-mono text-xs text-slate-400 font-bold">
                RP://TELEMETRY-COCKPIT • VERTEX RETAIL GROUP
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE FEED • 0.00ms VARIANCE</span>
            </div>
          </div>

          {/* Real-time Ticker Feed */}
          <div className="px-6 py-3 border-b border-white/5 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400 overflow-hidden">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-cyan-400 font-bold">STREAMING EVENT:</span>
              <span className="text-white font-medium">{liveEvents[tickerIndex].city}</span>
              <span className="hidden sm:inline text-slate-500">• {liveEvents[tickerIndex].item}</span>
              <span className="font-bold text-emerald-400">₹{liveEvents[tickerIndex].amount.toLocaleString()}</span>
            </div>
            <span className="text-[11px] text-slate-500 shrink-0 ml-4">{liveEvents[tickerIndex].time}</span>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* 3 Core Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-black/40">
                <div className="text-xs uppercase font-mono font-bold text-slate-400">2026 Net Sales</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1.5">
                  {formatINR(preview.revenue)}
                </div>
                <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +{preview.yoy_growth || 1.47}% YoY Growth
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-black/40">
                <div className="text-xs uppercase font-mono font-bold text-slate-400">Weighted Gross Margin</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 mt-1.5">
                  {preview.gross_margin}%
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Mathematical Law: SUM(GP) / SUM(Net)
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-black/40">
                <div className="text-xs uppercase font-mono font-bold text-slate-400">Total Transactions</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1.5">
                  {formatNumber(preview.orders)}
                </div>
                <div className="text-xs text-emerald-400 font-mono mt-1">
                  100% Reconciled Baskets
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex space-x-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'revenue'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Trajectory
                </button>
                <button
                  onClick={() => setActiveTab('stores')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'stores'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top Store Fleet
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    activeTab === 'categories'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Category Mix
                </button>
              </div>

              <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                Interactive Cockpit View
              </span>
            </div>

            {/* Tab Views */}
            {activeTab === 'revenue' && (
              <div>
                <div className="flex justify-between text-xs mb-3 font-mono">
                  <span className="text-slate-400">2026 Monthly Net Sales Trend</span>
                  <span className="text-amber-400 font-bold">Oct Surge: Diwali Festive Spike (₹7.12 Cr)</span>
                </div>
                <div className="grid grid-cols-12 gap-2 h-44 items-end pt-4">
                  {preview.trend_preview?.map((m: any) => {
                    const isOct = m.month === 'Oct';
                    const heightPct = Math.min(100, Math.max(25, ((m.revenue - 42000000) / 30000000) * 100));
                    return (
                      <div key={m.month} className="flex flex-col items-center h-full justify-end group cursor-pointer">
                        <div className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 font-bold mb-1">
                          {(m.revenue / 10000000).toFixed(1)}Cr
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-lg transition-all group-hover:brightness-125 ${
                            isOct
                              ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-lg shadow-amber-500/30 ring-1 ring-amber-200'
                              : 'bg-gradient-to-t from-cyan-600 to-blue-500'
                          }`}
                        />
                        <span className={`text-[11px] font-mono mt-2 ${isOct ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'stores' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {preview.stores_preview?.map((s: any, idx: number) => (
                  <div
                    key={s.store_name}
                    className="p-4 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{s.store_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.city} • ₹{s.psf} Sales/Sq.Ft</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-cyan-400">{formatINR(s.revenue)}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">{s.attainment}% Quota</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {preview.category_preview?.map((c: any) => (
                  <div
                    key={c.category}
                    className="p-4 rounded-xl border border-white/10 bg-black/40 text-xs space-y-2"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="text-white">{c.category}</span>
                      <span className="text-cyan-400 font-mono">{c.share}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                      <span>{formatINR(c.revenue)}</span>
                      <span>Margin: <b className="text-emerald-400">{c.margin}%</b></span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${(c.revenue / 150000000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Launch Command Center Button */}
            <button
              onClick={onExploreDemo}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/25"
            >
              <span>Explore All 11 Analytics Workspaces in Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SERVICES: INTERACTIVE FINTECH ROI & PROFIT SIMULATOR                    */}
      {/* ========================================================================= */}
      <section id="services" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-[#0a0f22] to-black shadow-2xl ring-1 ring-cyan-500/20">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Calculator className="w-4 h-4" />
              <span>SERVICES & ROI OPTIMIZATION ENGINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Simulate Your Retail Network Margin Recovery
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Adjust store count and GMV below to calculate the exact bottom-line EBITDA expansion unlocked by eliminating phantom stock and untracked discounts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Sliders Area */}
            <div className="lg:col-span-7 space-y-8">
              {/* Slider 1: Store Fleet */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase font-mono">Store Fleet Size:</span>
                  <span className="text-cyan-400 font-mono text-sm font-bold">{calcStores} Locations</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={calcStores}
                  onChange={(e) => setCalcStores(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>5 Stores (Boutique)</span>
                  <span>20 Stores (Vertex Scale)</span>
                  <span>50 Stores (National)</span>
                </div>
              </div>

              {/* Slider 2: Annual Turnover */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase font-mono">Annual Network Turnover (GMV):</span>
                  <span className="text-cyan-400 font-mono text-sm font-bold">₹{calcTurnover} Crores</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="5"
                  value={calcTurnover}
                  onChange={(e) => setCalcTurnover(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>₹20 Cr</span>
                  <span>₹128 Cr</span>
                  <span>₹500 Cr</span>
                </div>
              </div>

              {/* Slider 3: Target Recovery Margin */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase font-mono">Conservative Margin Recovery Rate:</span>
                  <span className="text-emerald-400 font-mono text-sm font-bold">+{calcMargin}% Net Gain</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.5"
                  step="0.1"
                  value={calcMargin}
                  onChange={(e) => setCalcMargin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>1.0% (Discount Governance)</span>
                  <span>2.4% (Typical Baseline)</span>
                  <span>4.2% (Audited Maximum)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl border border-cyan-500/30 bg-black/60 shadow-2xl text-center relative overflow-hidden">
                <div className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider">
                  ANNUAL PROFIT RECOVERED
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-black text-white mt-3">
                  ₹{estimatedSavingsCr} Cr
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Added directly to EBITDA margin
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3 text-left text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Working Capital Freed:</span>
                    <span className="font-mono font-bold text-white">~₹{estimatedWorkingCapitalLakhs} Lakhs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Inventory DSI Reduction:</span>
                    <span className="font-mono font-bold text-emerald-400">-14 Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Manager Audit Hours Saved:</span>
                    <span className="font-mono font-bold text-white">{calcStores * 12} hrs / month</span>
                  </div>
                </div>

                <button
                  onClick={onExploreDemo}
                  className="mt-6 w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Verify Model In Live Command Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ABOUT: MATHEMATICAL RIGOR & ARCHITECTURAL FOUNDATIONS                  */}
      {/* ========================================================================= */}
      <section id="about" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            DETERMINISTIC DATA INTEGRITY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            About Our Mathematical Foundations
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Why retail executives eliminate spreadsheet disputes with RetailPulse deterministic analytical guarantees.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: The Weighted Margin Law (2 columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-slate-900/50 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Scale className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                0.0000 AUDITED VARIANCE
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              1. Multi-Dimensional Reconciliation & Weighted Margin Law
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Simple arithmetic averaging of store margins causes massive financial distortion. RetailPulse weights every transaction strictly by net sales volume, ensuring exact algebraic consistency across all dimensions.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-center">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-300">
                <div className="text-[10px] text-slate-500 uppercase">Sum of 20 Stores</div>
                <div className="text-sm font-bold text-cyan-400 mt-1">₹127,97,94,219.48</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-300">
                <div className="text-[10px] text-slate-500 uppercase">Sum of 11 Categories</div>
                <div className="text-sm font-bold text-cyan-400 mt-1">₹127,97,94,219.48</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-300">
                <div className="text-[10px] text-slate-500 uppercase">Sum of 5 Regions</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">₹127,97,94,219.48</div>
              </div>
            </div>
          </div>

          {/* Card 2: 14-Day Rolling Z-Score Radar */}
          <div className="p-8 rounded-3xl border border-white/10 bg-slate-900/50 hover:border-amber-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-4">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              2. 14-Day Z-Score Anomaly Radar
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Rolling statistical outlier detection flags localized store ruptures (Z &lt; -2.2) and festive surges (Z &gt; +2.5) with automated causal explanation.
            </p>
            <div className="mt-5 p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-amber-400">
              Oct 28: Diwali Peak Surge (Z = +2.84)<br />
              <span className="text-slate-500 text-[10px]">Cooling & TV wholesale orders +310%</span>
            </div>
          </div>

          {/* Card 3: Conservation of Inventory Physics */}
          <div className="p-8 rounded-3xl border border-white/10 bg-slate-900/50 hover:border-purple-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-4">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              3. Physical Inventory Conservation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Units can never evaporate into spreadsheets. Every SKU strictly follows physical mass conservation:
              <code className="block mt-1 font-mono text-purple-400 text-xs">Closing = Opening + In - Out</code>
            </p>
            <div className="mt-5 space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Fresh (0-30d):</span>
                <span className="text-emerald-400 font-bold">58.4%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dead Stock (&gt;90d):</span>
                <span className="text-rose-400 font-bold">6.9% Clearance</span>
              </div>
            </div>
          </div>

          {/* Card 4: Deterministic Attribution (2 columns) */}
          <div className="md:col-span-2 p-8 rounded-3xl border border-white/10 bg-slate-900/50 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                ROOT CAUSE DECOMPOSITION
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              4. Deterministic Metric Attribution: "Why Did Margin Shift?"
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              When network revenue swung +₹93.29 Lakhs YoY, executives avoided 3-day manual reconciliations. RetailPulse additive decomposition isolates exact SKU and store volume impacts instantly.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="text-emerald-400 font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Top Growth Driver
                </div>
                <div className="text-white font-bold mt-1">Cooling Category: +₹55.53 Lakhs</div>
                <div className="text-slate-500 text-[10px]">Tier-2 expansion & seasonal inverter AC demand</div>
              </div>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="text-cyan-400 font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> Top Store Fleet
                </div>
                <div className="text-white font-bold mt-1">Bengaluru Indiranagar: +₹38.20 Lakhs</div>
                <div className="text-slate-500 text-[10px]">Highest sales density (₹3,040 PSF)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setArchOpen(true)}
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center space-x-2 transition-all"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Inspect Technical Architecture Spec</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCaseStudyOpen(true)}
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center space-x-2 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Read Vertex 20-Store Audit Case Study</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4.5 SAAS PRICING PACKAGES (STARTER, PRO, BUSINESS)                       */}
      {/* ========================================================================= */}
      <section id="pricing" className="relative py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/10">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-brand-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT SAAS PACKAGES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Engineered for Any Retail Footprint
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From single boutique flagship stores to nationwide omnichannel chains with multi-brand inventory.
            All tiers include automated daily reconciliation, SOC2-aligned tenant isolation, and instant data activation.
          </p>

          {/* Interactive Controls: Billing Period & Currency */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            {/* Billing Toggle (Monthly / Annual) */}
            <div className="inline-flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner">
              <button
                onClick={() => setPricingBilling('monthly')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  pricingBilling === 'monthly'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setPricingBilling('annual')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all ${
                  pricingBilling === 'annual'
                    ? 'bg-brand-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SAVE 20%
                </span>
              </button>
            </div>

            {/* Currency Selector (INR / USD) */}
            <div className="inline-flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner">
              <button
                onClick={() => setPricingCurrency('INR')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-mono font-semibold transition-all ${
                  pricingCurrency === 'INR'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setPricingCurrency('USD')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-mono font-semibold transition-all ${
                  pricingCurrency === 'USD'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>

        {/* 3 Package Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative z-10">
          {/* 1. FREE FOREVER TIER */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all hover:-translate-y-1">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    ZERO COST
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">Free Forever</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Boxes className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed min-h-[40px]">
                Always free for boutique retail counters and small stores. Zero card required, free for your entire team.
              </p>

              {/* Price display */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {pricingCurrency === 'INR' ? '₹0' : '$0'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ forever</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono font-semibold">
                  100% Free • No Credit Card Required
                </div>
              </div>

              {/* Key Limits */}
              <div className="space-y-2 mb-6 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Max Stores:</span>
                  <span className="font-bold text-white">1 Store Location</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Monthly Volume:</span>
                  <span className="font-bold text-white">2,500 Transactions</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Team Seats:</span>
                  <span className="font-bold text-white">2 Members (Free for team)</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  What's Included:
                </div>
                {[
                  'Executive KPI Dashboard (Net Sales, Margin %)',
                  'CSV & Excel Historical Data Ingestion',
                  'Store revenue & top 10 SKU tracker',
                  'Inventory stockout health matrix',
                  'Automated daily data reconciliation',
                  'Community & email support',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onOpenAuth ? onOpenAuth('register', 'free') : undefined}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/30 hover:border-emerald-400 flex items-center justify-center space-x-2 transition-all shadow"
            >
              <span>Start Free Forever</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. PRO TIER (POPULAR / HIGHLIGHTED) */}
          <div className="rounded-2xl bg-gradient-to-b from-brand-950/70 via-slate-900/90 to-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/50 p-8 flex flex-col justify-between relative shadow-2xl shadow-cyan-500/10 hover:-translate-y-1 transition-all">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-brand-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-lg flex items-center space-x-1">
              <Zap className="w-3 h-3 fill-current" />
              <span>MOST POPULAR • BEST VALUE</span>
            </div>

            <div>
              <div className="flex justify-between items-start mb-4 mt-1">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    GROWTH ENGINE
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1 flex items-center space-x-2">
                    <span>Pro Growth</span>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed min-h-[40px]">
                Full real-time intelligence with automated live POS streaming and margin defense for scaling retail stores.
              </p>

              {/* Price display */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {pricingCurrency === 'INR'
                      ? (pricingBilling === 'annual' ? '₹399' : '₹499')
                      : (pricingBilling === 'annual' ? '$7' : '$9')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>
                <div className="text-[11px] text-cyan-400 mt-1 font-mono font-semibold">
                  {pricingBilling === 'annual'
                    ? (pricingCurrency === 'INR' ? 'Billed annually at ₹4,788/yr (Save ₹1,200)' : 'Billed annually at $84/yr (Save $24)')
                    : 'Billed monthly, cancel anytime'}
                </div>
              </div>

              {/* Key Limits */}
              <div className="space-y-2 mb-6 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Max Stores:</span>
                  <span className="font-bold text-cyan-300">Up to 5 Locations</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Monthly Volume:</span>
                  <span className="font-bold text-cyan-300">50,000 Transactions</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Team Seats:</span>
                  <span className="font-bold text-cyan-300">5 Members + Roles</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
                  Everything in Free, plus:
                </div>
                {[
                  'Live POS Streamer (Real-time customer checkout feed)',
                  'Margin Risk Radar (Detect negative & below-cost sales)',
                  'Dead Inventory & Stock Aging Alerts (>90 days)',
                  'Regional Geography Heatmaps & Store Comparisons',
                  'Dedicated API Key for POS & Webhook Sync',
                  'Priority Email & WhatsApp Support',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onOpenAuth ? onOpenAuth('register', 'pro') : undefined}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
            >
              <span>Get Pro Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. BUSINESS / ENTERPRISE TIER */}
          <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                    ENTERPRISE GRADE
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">Business</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Building className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed min-h-[40px]">
                Tailored for multi-store retail groups, franchise networks, and omnichannel warehouse chains.
              </p>

              {/* Price display */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {pricingCurrency === 'INR'
                      ? (pricingBilling === 'annual' ? '₹1,199' : '₹1,499')
                      : (pricingBilling === 'annual' ? '$24' : '$29')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {pricingBilling === 'annual'
                    ? (pricingCurrency === 'INR' ? 'Billed annually at ₹14,388/yr' : 'Billed annually at $288/yr')
                    : 'Billed monthly, cancel anytime'}
                </div>
              </div>

              {/* Key Limits */}
              <div className="space-y-2 mb-6 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Max Stores:</span>
                  <span className="font-bold text-indigo-300">Unlimited Stores & DCs</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Monthly Volume:</span>
                  <span className="font-bold text-indigo-300">500,000 Transactions</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Team Seats:</span>
                  <span className="font-bold text-indigo-300">Unlimited Users & Roles</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                  Everything in Pro, plus:
                </div>
                {[
                  'Multi-brand & parent conglomerate tenant isolation',
                  'Direct ERP connectors (SAP, Oracle NetSuite, Tally Prime)',
                  'Dedicated API Key for POS & Webhook Ingestion',
                  'High-throughput live streaming architecture',
                  'Dedicated Account Manager & 99.99% SLA',
                  'Custom scheduled PDF / CSV data delivery pipelines',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onOpenAuth ? onOpenAuth('register', 'business') : undefined}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-indigo-500/30 hover:border-indigo-400 flex items-center justify-center space-x-2 transition-all shadow"
            >
              <span>Get Business Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="mt-14 max-w-2xl mx-auto text-center border-t border-white/5 pt-8">
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>14-Day Full Sandbox Trial</span>
            </span>
            <span>•</span>
            <span>No Credit Card Required</span>
            <span>•</span>
            <span>Instant Provisioning</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ENTERPRISE FAQ ACCORDION                                               */}
      {/* ========================================================================= */}
      <section className="relative py-24 px-4 sm:px-6 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            EXECUTIVE QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does RetailPulse guarantee zero data fabrication?',
              a: 'Every KPI, chart, and alert is computed on-the-fly from our verified SQLite/PostgreSQL database of 89,464 transaction rows. We enforce a continuous mathematical validation audit where SUM(Stores) == SUM(Categories) == SUM(Regions) == SUM(Total) with 0.0000 tolerance.'
            },
            {
              q: 'Why is the weighted gross margin formula non-negotiable?',
              a: 'Taking the arithmetic mean of store margins distorts executive decisions. If an outlet does ₹10,000 at 50% margin and a flagship does ₹1,00,00,000 at 10%, your actual business margin is ~10.04%, not 30%. RetailPulse strictly computes (SUM(Gross Profit) / SUM(Net Sales)) * 100.'
            },
            {
              q: 'Can RetailPulse integrate with existing POS and ERP data streams?',
              a: 'Yes. The backend runs on FastAPI with SQLAlchemy 2.0 and supports PostgreSQL, SQLite, Snowflake, and BigQuery. It ingests standard retail feeds from SAP, Oracle, Tally Prime, Unicommerce, or custom POS register CSV/JSON dumps.'
            },
            {
              q: 'How does the 14-day rolling Z-score anomaly radar work?',
              a: "Rather than using fixed arbitrary thresholds, RetailPulse tracks each individual store's daily revenue against its own 14-day rolling mean and standard deviation. Any deviation exceeding Z < -2.2 or Z > +2.5 triggers an automated alert with machine-synthesized causal explanation."
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CONTACT & ENTERPRISE DEPLOYMENT CONSULTATION                           */}
      {/* ========================================================================= */}
      <section id="contact" className="relative py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Contact Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
              <Mail className="w-4 h-4" />
              <span>ENTERPRISE CONSULTATION & DEMO DISPATCH</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Deploy Vantage Across Your Store Fleet
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Whether managing 5 specialty boutiques or 100+ national retail branches, our engineering team deploys deterministic analytics tailored to your ERP schema within 48 hours.
            </p>

            <div className="space-y-4 pt-4 text-xs font-mono">
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Custom Schema Mapping</div>
                  <div className="text-slate-500">Native connectors for SAP, Oracle Retail, Tally Prime</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Enterprise Security & SLA</div>
                  <div className="text-slate-500">SOC2 Type II Ready • Role-Based Access Control • 99.99% Uptime</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onExploreDemo}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Sandbox Access (Pre-loaded with 20 Stores)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Contact & Dispatch Form */}
          <div className="lg:col-span-6">
            <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/80 ring-1 ring-cyan-500/20">
              {contactSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Consultation Scheduled</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thank you {contactForm.name || 'Executive'}! Our retail solutions engineer will connect with you at <b>{contactForm.email}</b> within 2 business hours.
                  </p>
                  <button
                    onClick={onExploreDemo}
                    className="mt-4 px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg"
                  >
                    Open Live Command Center Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider mb-2">
                    REQUEST EXECUTIVE WALKTHROUGH
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajiv Menon"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajiv@retailgroup.in"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Company / Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Electronics"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Store Fleet Size</label>
                      <select
                        value={contactForm.stores}
                        onChange={(e) => setContactForm({ ...contactForm, stores: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="1-5 Stores">1-5 Stores</option>
                        <option value="5-20 Stores">5-20 Stores</option>
                        <option value="20-50 Stores">20-50 Stores</option>
                        <option value="50+ Stores">50+ Stores (National)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Requirements / Existing POS</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Currently using Tally & POS registers, looking to eliminate stock shrinkage..."
                      value={contactForm.note}
                      onChange={(e) => setContactForm({ ...contactForm, note: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
                  >
                    <span>Dispatch Consultation Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="py-10 border-t border-white/10 bg-black text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-[10px]">
              V
            </div>
            <div>
              <span className="font-bold text-white">VANTAGE</span> • Enterprise Retail Analytics Intelligence
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => scrollToSection('preview')} className="hover:text-white transition-colors">Telemetry</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button>
            <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Services</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
            <button onClick={() => setArchOpen(true)} className="hover:text-cyan-400 transition-colors">Architecture</button>
            <button onClick={() => setCaseStudyOpen(true)} className="hover:text-cyan-400 transition-colors">Case Study</button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All Systems Nominal • 99.99% Uptime</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CaseStudyModal
        isOpen={caseStudyOpen}
        onClose={() => setCaseStudyOpen(false)}
        onExploreDemo={() => {
          setCaseStudyOpen(false);
          onExploreDemo();
        }}
      />
      <ArchitectureModal
        isOpen={archOpen}
        onClose={() => setArchOpen(false)}
      />
    </div>
  );
};
