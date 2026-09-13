import React from 'react';
import { X, Database, Server, Cpu, Globe, BarChart3, ShieldCheck } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-start justify-between">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              System Engineering
            </span>
            <h2 className="text-xl font-bold mt-2">Technical Architecture & Stack</h2>
            <p className="text-xs text-slate-300 mt-1">
              Engineered for data accuracy, high concurrency, and sub-15ms query execution.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture Flow Diagram */}
        <div className="p-6 space-y-6 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          {/* Architecture Pipeline */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
              End-to-End Data Pipeline
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle">
                <Database className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900">Storage Layer</div>
                <div className="text-[10px] text-slate-500 mt-0.5">PostgreSQL / SQLite WAL</div>
                <div className="text-[9px] text-slate-400 font-mono mt-1">89k+ Transactions</div>
              </div>

              <div className="hidden sm:block text-slate-300 font-bold">→</div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle">
                <Cpu className="w-5 h-5 text-brand-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900">Analytics Engine</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Pandas • NumPy • SQL</div>
                <div className="text-[9px] text-slate-400 font-mono mt-1">RFM • Z-Score • Aging</div>
              </div>

              <div className="hidden sm:block text-slate-300 font-bold">→</div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle">
                <Server className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900">API Gateway</div>
                <div className="text-[10px] text-slate-500 mt-0.5">FastAPI • Pydantic v2</div>
                <div className="text-[9px] text-slate-400 font-mono mt-1">REST • ReportLab PDF</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-center">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle text-center max-w-sm w-full">
                <BarChart3 className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900">Frontend Presentation</div>
                <div className="text-[10px] text-slate-500 mt-0.5">React 19 • TypeScript • Tailwind CSS • Apache ECharts</div>
                <div className="text-[9px] text-slate-400 font-mono mt-1">Interactive Cross-Filtering & Drilldowns</div>
              </div>
            </div>
          </div>

          {/* Core Architectural Guarantees */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
              Core Architectural Guarantees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-semibold text-slate-900">Zero Fabricated Numbers</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Every card, chart, and alert is calculated directly from row-level transactions using SQL aggregations. No hardcoded KPIs.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-semibold text-slate-900">Weighted Gross Margin</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Weighted arithmetic: <code className="text-brand-600">SUM(gross_profit) / SUM(net_sales) * 100</code>. Never averages row-level percentages.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-semibold text-slate-900">Inventory Conservation Equation</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Strictly validates <code className="text-brand-600">closing = opening + purchases + returns - sold</code> across all 9,160 store SKU pairs.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="font-semibold text-slate-900">Deterministic Attribution</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  "Why did this change?" decomposes variances into exact category, regional, and store delta contributions without LLM hallucination.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Close Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
