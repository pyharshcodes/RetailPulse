import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Store, Package, Layers, User, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useFilters } from '../../context/FilterContext';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, entityId?: string) => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateFilter } = useFilters();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api.omniSearch(query)
        .then(res => setResults(res))
        .catch(err => console.error('Search failed', err))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative mx-auto max-w-2xl transform divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all">
        {/* Search input bar */}
        <div className="relative flex items-center px-4">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="h-14 w-full border-0 bg-transparent pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            placeholder="Search stores, products, categories, customers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching retail network...
            </div>
          )}

          {!loading && results && results.total_results === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No entities match "{query}". Try "Agra", "Lighting", "Bulb", or "Sharma".
            </div>
          )}

          {/* Stores */}
          {results?.stores?.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <Store className="w-3 h-3 mr-1" /> Stores
              </div>
              {results.stores.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => {
                    updateFilter('store', s.id);
                    onNavigate('stores', s.id);
                    onClose();
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-brand-600">{s.title}</div>
                    <div className="text-[10px] text-slate-400">{s.subtitle}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {results?.products?.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <Package className="w-3 h-3 mr-1" /> Products
              </div>
              {results.products.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onNavigate('products', p.id);
                    onClose();
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-brand-600">{p.title}</div>
                    <div className="text-[10px] text-slate-400">{p.subtitle}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {results?.categories?.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <Layers className="w-3 h-3 mr-1" /> Categories
              </div>
              {results.categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => {
                    updateFilter('category', c.id);
                    onNavigate('products');
                    onClose();
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-brand-600">{c.title}</div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}

          {/* Customers */}
          {results?.customers?.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <User className="w-3 h-3 mr-1" /> Customers
              </div>
              {results.customers.map((cu: any) => (
                <button
                  key={cu.id}
                  onClick={() => {
                    onNavigate('customers');
                    onClose();
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-brand-600">{cu.title}</div>
                    <div className="text-[10px] text-slate-400">{cu.subtitle}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Click any store or category to immediately filter the dashboard</span>
          <span className="font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
