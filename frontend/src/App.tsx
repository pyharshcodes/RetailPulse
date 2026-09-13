import React, { useState, useEffect } from 'react';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { GlobalFilterBar } from './components/layout/GlobalFilterBar';
import { OmniSearchModal } from './components/common/OmniSearchModal';
import { CaseStudyModal } from './components/landing/CaseStudyModal';
import { ArchitectureModal } from './components/landing/ArchitectureModal';
import { LandingPage } from './components/landing/LandingPage';

// Analytics Views
import { ExecutiveOverviewView } from './components/analytics/ExecutiveOverviewView';
import { SalesView } from './components/analytics/SalesView';
import { StoresView } from './components/analytics/StoresView';
import { ProductsView } from './components/analytics/ProductsView';
import { CustomersView } from './components/analytics/CustomersView';
import { InventoryView } from './components/analytics/InventoryView';
import { ProfitabilityView } from './components/analytics/ProfitabilityView';
import { GeographyView } from './components/analytics/GeographyView';
import { TargetsView } from './components/analytics/TargetsView';
import { AlertsView } from './components/analytics/AlertsView';
import { ReportsView } from './components/analytics/ReportsView';
import { ExplorerView } from './components/analytics/ExplorerView';

export function AppContent() {
  // Experience Switch: 'landing' | 'demo_loading' | 'dashboard'
  const [experience, setExperience] = useState<'landing' | 'demo_loading' | 'dashboard'>('landing');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Drilldown entity selection states
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  // Layout UI states
  const [filterBarOpen, setFilterBarOpen] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [caseStudyOpen, setCaseStudyOpen] = useState<boolean>(false);
  const [archOpen, setArchOpen] = useState<boolean>(false);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K) for OmniSearch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Demo loading sequence (PART 2 of Prompt)
  const steps = [
    'Preparing transaction data...',
    'Calculating network KPIs...',
    'Building store analytics...',
    'Analyzing product performance...',
    'Checking inventory health...',
    'Your dashboard is ready.'
  ];

  const handleStartDemo = () => {
    setExperience('demo_loading');
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => setExperience('dashboard'), 600);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  const handleNavigate = (tab: string, entityId?: string) => {
    setActiveTab(tab);
    if (tab === 'stores' && entityId) {
      setSelectedStoreId(entityId);
    } else if (tab === 'products' && entityId) {
      setSelectedProductId(entityId);
    }
  };

  // 1. Marketing Landing Page Experience
  if (experience === 'landing') {
    return <LandingPage onExploreDemo={handleStartDemo} />;
  }

  // 2. Demo Loading Orchestration (PART 2)
  if (experience === 'demo_loading') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-500/30 animate-pulse mb-6">
          RP
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Vertex Retail Group Command Center</h2>
        <div className="h-8 flex items-center justify-center text-sm font-medium text-brand-400 font-mono">
          {steps[loadingStep]}
        </div>
        <div className="w-64 bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-8 text-xs text-slate-500 font-mono">89,000+ transaction logs loaded</div>
      </div>
    );
  }

  // 3. Live Analytics Command Center Experience
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedStoreId(undefined);
          setSelectedProductId(undefined);
        }}
        onOpenLanding={() => setExperience('landing')}
        onOpenArchitecture={() => setArchOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          activeTab={activeTab}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenCaseStudy={() => setCaseStudyOpen(true)}
          filterBarOpen={filterBarOpen}
          onToggleFilterBar={() => setFilterBarOpen(prev => !prev)}
        />

        {/* Global Persistent Filter Bar */}
        <GlobalFilterBar isOpen={filterBarOpen} />

        {/* Dynamic View Scroll Container */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'overview' && <ExecutiveOverviewView onNavigate={handleNavigate} />}
            {activeTab === 'sales' && <SalesView />}
            {activeTab === 'stores' && (
              <StoresView
                selectedStoreId={selectedStoreId}
                onClearStoreId={() => setSelectedStoreId(undefined)}
              />
            )}
            {activeTab === 'products' && <ProductsView selectedProductId={selectedProductId} />}
            {activeTab === 'customers' && <CustomersView />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'profitability' && <ProfitabilityView />}
            {activeTab === 'geography' && <GeographyView />}
            {activeTab === 'targets' && <TargetsView />}
            {activeTab === 'alerts' && <AlertsView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'explorer' && <ExplorerView />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <OmniSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />
      <CaseStudyModal
        isOpen={caseStudyOpen}
        onClose={() => setCaseStudyOpen(false)}
        onExploreDemo={() => {
          setCaseStudyOpen(false);
          setExperience('dashboard');
        }}
      />
      <ArchitectureModal
        isOpen={archOpen}
        onClose={() => setArchOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <AppContent />
      </FilterProvider>
    </ThemeProvider>
  );
}
