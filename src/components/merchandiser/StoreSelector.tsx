import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { StoreLocation } from '../../types';
import { REGIONS } from '../../data/stores';
import { useReports } from '../../context/ReportContext';
import { getChainStyle, renderChainIcon } from '../../utils/chainStyles';
import {
  Store,
  Search,
  MapPin,
  Check,
  ChevronDown,
  X,
  Clock
} from 'lucide-react';

interface StoreSelectorProps {
  selectedStore: StoreLocation | null;
  onSelectStore: (store: StoreLocation) => void;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({ selectedStore, onSelectStore }) => {
  const { stores, chains } = useReports();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chainFilter, setChainFilter] = useState<string>('All');
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

  // Compute all unique chains currently present in the stores list
  const availableChains = useMemo(() => {
    const set = new Set<string>();
    // Prioritize configured chains order first
    chains.forEach((c) => {
      if (stores.some((s) => s.chain?.toLowerCase() === c.name.toLowerCase())) {
        set.add(c.name);
      }
    });
    // Then any other chain present in stores
    stores.forEach((s) => {
      if (s.chain) set.add(s.chain);
    });
    return Array.from(set);
  }, [stores, chains]);

  const filteredStores = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return stores.filter((store) => {
      if (chainFilter !== 'All' && store.chain !== chainFilter) return false;
      if (regionFilter !== 'All' && store.region !== regionFilter) return false;
      if (!q) return true;
      return (
        store.name.toLowerCase().includes(q) ||
        store.chain.toLowerCase().includes(q) ||
        store.region.toLowerCase().includes(q)
      );
    });
  }, [stores, searchQuery, chainFilter, regionFilter]);

  // Dynamically group stores by their retail category / chain
  const groupedStores = useMemo(() => {
    const map = new Map<string, StoreLocation[]>();
    filteredStores.forEach((store) => {
      const c = store.chain || 'Other';
      if (!map.has(c)) {
        map.set(c, []);
      }
      map.get(c)!.push(store);
    });
    return Array.from(map.entries());
  }, [filteredStores]);

  const handleSelect = (store: StoreLocation) => {
    onSelectStore(store);
    setIsOpen(false);
    setSearchQuery('');
  };

  const popularStores = useMemo(() => [
    stores.find(s => s.name === 'The Greens' && s.chain === 'Choithrams'),
    stores.find(s => s.name === 'Al Khail' && s.chain === 'Emarat'),
    stores.find(s => s.chain === 'Grandiose'),
    stores.find(s => s.name === 'DIFC' && s.chain === 'Choithrams'),
    stores.find(s => s.name === 'Juwaiza (Sharjah)' && s.chain === 'Emarat'),
  ].filter(Boolean) as StoreLocation[], [stores]);

  const selectedChainStyle = selectedStore ? getChainStyle(selectedStore.chain, chains) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Label and Section Header */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 flex items-center">
          <Store className="w-3.5 h-3.5 mr-1.5 text-stone-900" />
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
        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${isOpen
          ? 'border-stone-400 ring-2 ring-stone-200 bg-white shadow-xs'
          : selectedStore
            ? 'border-black/[0.08] bg-stone-50/60 hover:bg-stone-50'
            : 'border-dashed border-stone-300 bg-white hover:border-stone-400'
          }`}
      >
        {selectedStore && selectedChainStyle ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-2xs ${selectedChainStyle.solidClass}`}
              >
                {renderChainIcon(selectedChainStyle.iconType, 'w-4 h-4')}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${selectedChainStyle.pillClass}`}
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
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-stone-800' : ''
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
                  Select Station or Retail Branch
                </p>
                <p className="text-[11px] text-stone-400">
                  {stores.length} verified retail locations across UAE
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
        <div className="mt-2 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-stone-400 text-[10px] whitespace-nowrap flex items-center mr-1">
            <Clock className="w-3 h-3 mr-1" /> Quick:
          </span>
          {popularStores.map((pStore) => {
            const pStyle = getChainStyle(pStore.chain, chains);
            return (
              <button
                key={pStore.id}
                type="button"
                onClick={() => onSelectStore(pStore)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 font-medium text-[11px] transition shadow-2xs flex items-center space-x-1"
              >
                <span className={pStyle.textClass}>•</span>
                <span>{pStore.name}</span>
                <span className="text-[9px] text-stone-400">({pStore.chain})</span>
              </button>
            );
          })}
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
                placeholder="Search branch name (e.g. Greens, Al Khail, Hoor 17)..."
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

            {/* Dynamic Chain Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setChainFilter('All')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1 shrink-0 ${chainFilter === 'All'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:bg-stone-50'
                    }`}
                >
                  <span>All</span>
                  <span className="text-[10px] opacity-75">({stores.length})</span>
                </button>

                {availableChains.map((cName) => {
                  const cStyle = getChainStyle(cName, chains);
                  const isCurActive = chainFilter === cName;
                  const countForChain = stores.filter((s) => s.chain === cName).length;
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setChainFilter(cName)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${isCurActive
                        ? `${cStyle.solidClass} shadow-2xs`
                        : `bg-white text-stone-700 hover:bg-stone-50 border border-stone-200/80`
                        }`}
                    >
                      {renderChainIcon(cStyle.iconType, 'w-3 h-3 shrink-0')}
                      <span>{cName}</span>
                      <span className={`text-[10px] px-1 py-0.1 rounded-full ${isCurActive ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                        {countForChain}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] text-stone-400 text-right hidden sm:block shrink-0">
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
                  className={`px-2 py-0.5 rounded-full whitespace-nowrap transition ${regionFilter === r
                    ? 'bg-stone-900 text-white font-medium'
                    : 'bg-stone-200/60 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* List of Store Results Grouped Dynamically by Category */}
          <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 p-1">
            {filteredStores.length === 0 ? (
              <div className="p-8 text-center text-stone-400">
                <Store className="w-7 h-7 mx-auto mb-1.5 text-stone-300" />
                <p className="font-semibold text-stone-700 text-xs">No retail branches match criteria</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Try adjusting the chain or region filters</p>
              </div>
            ) : (
              groupedStores.map(([groupChain, groupStores]) => {
                const groupStyle = getChainStyle(groupChain, chains);
                return (
                  <div key={groupChain} className="py-1.5 first:pt-0.5 last:pb-1">
                    <div className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border ${groupStyle.pillClass}`}>
                        {renderChainIcon(groupStyle.iconType, 'w-2.5 h-2.5 mr-1')}
                        <span>{groupChain}</span>
                      </span>
                      <span className="font-mono text-stone-400 text-[10px]">{groupStores.length} branches</span>
                    </div>

                    <div className="space-y-0.5 mt-0.5">
                      {groupStores.map((store) => {
                        const isSelected = selectedStore?.id === store.id;
                        return (
                          <div
                            key={store.id}
                            onClick={() => handleSelect(store)}
                            className={`flex items-center justify-between px-3 py-2 mx-1 rounded-xl cursor-pointer transition ${isSelected
                              ? `${groupStyle.pillClass} font-semibold shadow-2xs`
                              : 'hover:bg-stone-50 text-stone-800'
                              }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${groupStyle.lightClass}`}>
                                {groupStyle.avatarText}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{store.name}</p>
                                <p className="text-[10px] text-stone-400 flex items-center truncate">
                                  <MapPin className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                                  <span>{store.region}</span>
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className={`w-4 h-4 shrink-0 ${groupStyle.textClass}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
