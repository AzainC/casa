import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { StoreLocation, ChainType } from '../../types';
import { STORES_DATA, REGIONS } from '../../data/stores';
import { 
  Store, 
  Search, 
  MapPin, 
  Check, 
  ChevronDown, 
  X, 
  Building2, 
  Fuel, 
  Clock
} from 'lucide-react';

interface StoreSelectorProps {
  selectedStore: StoreLocation | null;
  onSelectStore: (store: StoreLocation) => void;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({ selectedStore, onSelectStore }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState<'All' | ChainType>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStores = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return STORES_DATA.filter((store) => {
      if (chainFilter !== 'All' && store.chain !== chainFilter) return false;
      if (regionFilter !== 'All' && store.region !== regionFilter) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.chain.toLowerCase().includes(q) ||
        store.region.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, chainFilter, regionFilter]);

  const choithramsGroup = useMemo(
    () => filteredStores.filter((s) => s.chain === 'Choithrams'),
    [filteredStores]
  );
  const emaratGroup = useMemo(
    () => filteredStores.filter((s) => s.chain === 'Emarat'),
    [filteredStores]
  );

  const handleSelect = (store: StoreLocation) => {
    onSelectStore(store);
    setIsOpen(false);
    setSearchQuery('');
  };

  const popularStores = useMemo(() => [
    STORES_DATA.find(s => s.name === 'The Greens' && s.chain === 'Choithrams'),
    STORES_DATA.find(s => s.name === 'Al Khail' && s.chain === 'Emarat'),
    STORES_DATA.find(s => s.name === 'DIFC' && s.chain === 'Choithrams'),
    STORES_DATA.find(s => s.name === 'Juwaiza (Sharjah)' && s.chain === 'Emarat'),
  ].filter(Boolean) as StoreLocation[], []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Label and Section Header */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 flex items-center">
          <Store className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
          Station / Retail Branch
          <span className="text-stone-400 ml-0.5">*</span>
        </label>
        {selectedStore && (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/50 flex items-center">
            <Check className="w-2.5 h-2.5 mr-1 text-emerald-600" />
            Selected
          </span>
        )}
      </div>

      {/* Main Trigger Card */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
          isOpen
            ? 'border-stone-400 ring-2 ring-stone-200 bg-white shadow-xs'
            : selectedStore
            ? 'border-black/[0.08] bg-stone-50/60 hover:bg-stone-50'
            : 'border-dashed border-stone-300 bg-white hover:border-stone-400'
        }`}
      >
        {selectedStore ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  selectedStore.chain === 'Choithrams'
                    ? 'bg-emerald-800'
                    : 'bg-amber-700'
                }`}
              >
                {selectedStore.chain === 'Choithrams' ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <Fuel className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      selectedStore.chain === 'Choithrams'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                    }`}
                  >
                    {selectedStore.chain}
                  </span>
                  <span className="text-[11px] font-medium text-stone-400 flex items-center">
                    <MapPin className="w-2.5 h-2.5 mr-0.5" />
                    {selectedStore.region}
                  </span>
                </div>
                <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-tight mt-0.5">
                  {selectedStore.name}
                </h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-400 hover:text-stone-700 font-medium">
                Change
              </span>
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-stone-800' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-stone-800 text-xs sm:text-sm">
                  Select Choithrams or Emarat Station
                </p>
                <p className="text-[11px] text-stone-400">
                  113 verified retail locations across UAE
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Recent/Frequent Station Pills */}
      {!selectedStore && !isOpen && (
        <div className="mt-2 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 text-[10px] whitespace-nowrap flex items-center mr-1">
            <Clock className="w-3 h-3 mr-1" /> Quick:
          </span>
          {popularStores.map((pStore) => (
            <button
              key={pStore.id}
              type="button"
              onClick={() => onSelectStore(pStore)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 font-medium text-[11px] transition shadow-2xs flex items-center space-x-1"
            >
              <span className={pStore.chain === 'Choithrams' ? 'text-emerald-700' : 'text-amber-700'}>
                •
              </span>
              <span>{pStore.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/[0.08] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box Header */}
          <div className="p-3 bg-stone-50 border-b border-stone-100 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search branch name (e.g. Greens, Al Khail, DIFC)..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Chain Filter Tabs */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <div className="flex items-center bg-stone-200/70 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setChainFilter('All')}
                  className={`px-2.5 py-0.5 rounded-md transition ${
                    chainFilter === 'All'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All ({STORES_DATA.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChainFilter('Choithrams')}
                  className={`px-2 py-0.5 rounded-md transition flex items-center space-x-1 ${
                    chainFilter === 'Choithrams'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>Choithrams (24)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChainFilter('Emarat')}
                  className={`px-2 py-0.5 rounded-md transition flex items-center space-x-1 ${
                    chainFilter === 'Emarat'
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'text-amber-800 hover:text-amber-950'
                  }`}
                >
                  <Fuel className="w-3 h-3" />
                  <span>Emarat (89)</span>
                </button>
              </div>

              <span className="text-[10px] text-stone-400">
                {filteredStores.length} found
              </span>
            </div>

            {/* Region Filter Scrollable Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pt-0.5 no-scrollbar text-[10px]">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionFilter(r)}
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${
                    regionFilter === r
                      ? 'bg-stone-900 text-white font-medium'
                      : 'bg-stone-200/60 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* List of Store Results */}
          <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 p-1">
            {filteredStores.length === 0 ? (
              <div className="p-6 text-center text-stone-400">
                <Store className="w-6 h-6 mx-auto mb-1.5 text-stone-300" />
                <p className="font-medium text-stone-600 text-xs">No stations match criteria</p>
              </div>
            ) : (
              <>
                {choithramsGroup.length > 0 && (
                  <div className="mb-1.5">
                    <div className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Choithrams Supermarkets</span>
                      <span className="font-mono">{choithramsGroup.length}</span>
                    </div>
                    {choithramsGroup.map((store) => {
                      const isSelected = selectedStore?.id === store.id;
                      return (
                        <div
                          key={store.id}
                          onClick={() => handleSelect(store)}
                          className={`flex items-center justify-between px-3 py-2 mx-1 my-0.5 rounded-xl cursor-pointer transition ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-semibold'
                              : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                              CH
                            </div>
                            <div>
                              <p className="text-xs font-medium">{store.name}</p>
                              <p className="text-[10px] text-stone-400 flex items-center">
                                <MapPin className="w-2.5 h-2.5 mr-0.5" />
                                {store.region}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-700" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {emaratGroup.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Emarat Service Stations</span>
                      <span className="font-mono">{emaratGroup.length}</span>
                    </div>
                    {emaratGroup.map((store) => {
                      const isSelected = selectedStore?.id === store.id;
                      return (
                        <div
                          key={store.id}
                          onClick={() => handleSelect(store)}
                          className={`flex items-center justify-between px-3 py-2 mx-1 my-0.5 rounded-xl cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-50 text-amber-900 font-semibold'
                              : 'hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                              EM
                            </div>
                            <div>
                              <p className="text-xs font-medium">{store.name}</p>
                              <p className="text-[10px] text-stone-400 flex items-center">
                                <MapPin className="w-2.5 h-2.5 mr-0.5" />
                                {store.region}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-amber-700" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
