import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Zap,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IngestionSummary, SimulatedTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const {
    tenant,
    isDemo,
    isLiveStreaming,
    streamEvents,
    toggleLiveStreaming,
    triggerLiveTransaction,
    clearStreamEvents,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'upload' | 'stream' | 'templates'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<IngestionSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const activeCurrency = tenant?.currency || 'INR';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setIngestionResult(null);
      setErrorMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setErrorMessage(null);
    try {
      const summary = await api.uploadCsv(selectedFile);
      setIngestionResult(summary);
      setSelectedFile(null);
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to parse and ingest CSV. Please verify file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleSeedTemplate = async () => {
    setSeedLoading(true);
    setErrorMessage(null);
    try {
      const summary = await api.seedSampleData('retail');
      setIngestionResult(summary);
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to seed sample retail template.');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to delete all uploaded transactions for this tenant?')) {
      return;
    }
    setResetLoading(true);
    setErrorMessage(null);
    try {
      await api.resetTenantData();
      setIngestionResult(null);
      clearStreamEvents();
      if (onDataChanged) onDataChanged();
      alert('Tenant transaction data has been safely cleared.');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to reset tenant data.');
    } finally {
      setResetLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "transaction_id,store_id,store_name,city,region,product_id,product_name,category,subcategory,quantity,revenue,cogs,gross_profit,transaction_date,sales_channel,payment_method\n" +
      "TXN-1001,S001,Indiranagar Hub,Bengaluru,South,P101,Sony Bravia 55 OLED,Televisions & Audio,Smart TV,1,114990,88500,26490,2026-03-10,In-Store,Credit Card\n" +
      "TXN-1002,S001,Indiranagar Hub,Bengaluru,South,P102,Daikin 1.5T 5-Star AC,Cooling & ACs,Split AC,2,89980,71000,18980,2026-03-11,In-Store,UPI\n" +
      "TXN-1003,S002,Andheri Flagship,Mumbai,West,P103,Samsung Double Door Fridge,Large Appliances,Refrigerators,1,45990,36000,9990,2026-03-11,Online,Net Banking\n" +
      "TXN-1004,S003,CP Experience Center,New Delhi,North,P104,Bosch Front Load Washer,Large Appliances,Washing Machines,1,38500,30500,8000,2026-03-12,In-Store,Credit Card\n" +
      "TXN-1005,S002,Andheri Flagship,Mumbai,West,P105,Havells Smart BLDC Fan,Electrical Switchgear,Ceiling Fans,4,15960,11600,4360,2026-03-12,In-Store,UPI\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'retailpulse_sample_ingestion.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-cyan-500 via-brand-500 to-indigo-600 h-1.5 w-full" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ingestion & Live Telemetry Stream
                {isLiveStreaming && (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Tenant: <span className="text-brand-400 font-semibold">{tenant?.name || 'Vertex Retail Group'}</span> ({tenant?.currency || 'INR'})
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

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            Upload CSV / Excel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'stream'
                ? 'bg-brand-600/30 text-brand-300 shadow-sm border border-brand-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Live POS Streamer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'templates'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Templates & Reset
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CSV FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-brand-500/80 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/80 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 group-hover:bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Click to browse or drag and drop CSV file'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB ready for ingestion`
                    : 'Upload your store sales, POS receipts, or inventory transaction dump.'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV Template
                </button>
                <span className="text-slate-500">UTF-8 Encoded • Max 50MB</span>
              </div>

              {selectedFile && (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Parsing & Ingesting Transactions...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      Ingest Data into Workspace
                    </>
                  )}
                </button>
              )}

              {/* Ingestion Result Card */}
              {ingestionResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center text-emerald-400 font-bold text-sm gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Ingestion Succeeded!
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-slate-400">Transactions</div>
                      <div className="text-sm font-bold font-mono text-white mt-0.5">
                        {ingestionResult.transactions_ingested.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-slate-400">Stores Found</div>
                      <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                        {ingestionResult.stores_detected}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-slate-400">Products / SKUs</div>
                      <div className="text-sm font-bold font-mono text-indigo-400 mt-0.5">
                        {ingestionResult.products_detected}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <div className="text-slate-400">Total Net Sales</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                        {formatCurrency(ingestionResult.total_revenue, activeCurrency, true)}
                      </div>
                    </div>
                  </div>
                  {ingestionResult.date_span && ingestionResult.date_span.start && (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <span>Date Span Covered:</span>
                      <span className="font-mono text-slate-200">
                        {ingestionResult.date_span.start} to {ingestionResult.date_span.end}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE POS TRANSACTION STREAMER */}
          {activeTab === 'stream' && (
            <div className="space-y-4">
              {/* Stream Control Bar */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Real-Time POS Streamer Engine
                    {isLiveStreaming && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Injects simulated real-world customer checkouts across store locations into your active tenant database.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => triggerLiveTransaction()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    +1 Instant Sale
                  </button>

                  <button
                    type="button"
                    onClick={toggleLiveStreaming}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isLiveStreaming
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    {isLiveStreaming ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        Stop Live Stream
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Live Stream
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time Telemetry Log Terminal */}
              <div className="bg-black/90 rounded-xl border border-slate-800 overflow-hidden font-mono">
                <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-bold text-slate-300">Live Transaction Feed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{streamEvents.length} events logged</span>
                    {streamEvents.length > 0 && (
                      <button
                        type="button"
                        onClick={clearStreamEvents}
                        className="text-[10px] text-slate-400 hover:text-slate-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 max-h-60 overflow-y-auto space-y-2 text-xs">
                  {streamEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      Click "Start Live Stream" or "+1 Instant Sale" to begin transmitting real-time receipts.
                    </div>
                  ) : (
                    streamEvents.map((ev, i) => (
                      <div
                        key={ev.transaction_id + i}
                        className="p-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors animate-in slide-in-from-top-1"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-emerald-400 font-bold">{ev.transaction_id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-300 font-semibold truncate">{ev.store_name}</span>
                          <span className="text-slate-500 truncate hidden sm:inline">({ev.product_name})</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-white font-bold">
                            {formatCurrency(ev.revenue, activeCurrency, true)}
                          </span>
                          <span className="text-emerald-400 text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                            +{ev.margin_pct.toFixed(1)}% margin
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAMPLE TEMPLATES & DATA RESET */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  1-Click Sample Retail Template Seed
                </div>
                <p className="text-xs text-slate-400">
                  Quickly populate your tenant workspace with 500 simulated transactions across 5 flagship retail stores and 20 top-selling electronics SKUs.
                </p>
                <button
                  type="button"
                  onClick={handleSeedTemplate}
                  disabled={seedLoading}
                  className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  {seedLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Seeding Sandbox...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Seed 500 Sample Transactions
                    </>
                  )}
                </button>
              </div>

              {/* Danger Zone: Reset Tenant Data */}
              {!isDemo && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                  <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    Danger Zone: Clear Tenant Transactions
                  </div>
                  <p className="text-xs text-slate-400">
                    Purges all uploaded and simulated sales data for your organization ({tenant?.name}), leaving your stores and product catalog intact.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetData}
                    disabled={resetLoading}
                    className="mt-2 py-2 px-4 bg-rose-600/80 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    {resetLoading ? 'Clearing Data...' : 'Reset Tenant Data'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
