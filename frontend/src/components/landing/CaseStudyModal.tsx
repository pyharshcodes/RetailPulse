import React from 'react';
import { X, CheckCircle, ArrowRight, FileSpreadsheet, Layers, ShieldCheck, Zap } from 'lucide-react';

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDemo: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ isOpen, onClose, onExploreDemo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-start justify-between">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Demo Case Study
            </span>
            <h2 className="text-xl font-bold mt-2">Vertex Retail Group</h2>
            <p className="text-xs text-slate-300 mt-1">
              Electrical & Consumer Electronics Retail • 20 Stores • ₹128+ Cr Annual Turnover
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          {/* Challenge */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
              The Operating Challenge
            </h3>
            <p className="text-slate-600">
              Management monitored 20 retail outlets across India through fragmented weekly spreadsheets exported from disparate POS registers. Store managers manually consolidated sales tallies on Mondays, creating a 7-day blind spot for executive leadership.
            </p>
            <div className="mt-3 p-3 bg-rose-50/60 border border-rose-200 rounded-lg text-rose-900 space-y-1 text-[11px]">
              <div>• <b>Regional blind spots:</b> North region stores appeared healthy on top-line revenue, masking severe underperformance in the Agra and Kanpur branches.</div>
              <div>• <b>Margin destruction:</b> High sales in cooling and television categories concealed margin compression down to 11% while high-margin accessories sat unsold.</div>
              <div>• <b>Capital trapped in inventory:</b> Over ₹18 Cr in working capital was locked in 90+ day aging stock without replenishment governance.</div>
            </div>
          </div>

          {/* Approach & Solution */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-brand-500 mr-2"></span>
              The RetailPulse Solution
            </h3>
            <p className="text-slate-600">
              Vertex Retail Group deployed RetailPulse to establish an unified analytics command center connected directly to transaction-level logs. Rather than relying on static tabular dumps, leadership gained real-time visibility into every store, category, and rupee.
            </p>
          </div>

          {/* Before vs After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Before: Fragmented Spreadsheets
              </div>
              <ul className="space-y-2 text-[11px] text-slate-600">
                <li className="flex items-start">
                  <span className="text-rose-500 mr-1.5">✕</span>
                  14 distinct Excel files consolidated every Monday
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-1.5">✕</span>
                  Row-level margin averages producing distorted profitability
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-1.5">✕</span>
                  Zero visibility into customer repeat rates or RFM tiers
                </li>
                <li className="flex items-start">
                  <span className="text-rose-500 mr-1.5">✕</span>
                  Stockout surprises occurring alongside overstocked aging SKUs
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40">
              <div className="text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-2 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                After: RetailPulse Command Center
              </div>
              <ul className="space-y-2 text-[11px] text-slate-800 font-medium">
                <li className="flex items-start">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0 mt-0.5" />
                  Instant executive overview refreshed from 89,000+ transactions
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0 mt-0.5" />
                  Weighted gross margin with deterministic variance attribution
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0 mt-0.5" />
                  RFM segmentation and monthly cohort retention heatmap
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0 mt-0.5" />
                  Automated aging alerts saving working capital across stores
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-[11px]">Experience the real analytics environment loaded with this dataset:</span>
          <button
            onClick={() => {
              onClose();
              onExploreDemo();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            <span>Explore Vertex Retail Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
