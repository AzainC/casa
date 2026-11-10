import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { VisitReport, StoreLocation, StoreManagerContact, ProductItem, ChainConfig } from '../types';
import { INITIAL_MOCK_REPORTS } from '../data/mockReports';
import { CASA_PONS_PRODUCTS } from '../data/products';
import { STORES_DATA } from '../data/stores';
import { DEFAULT_CHAINS } from '../utils/chainStyles';
import { buildInitialStoreManagers } from '../data/storeManagersSeed';
import { 
  getSavedWebhookUrl, 
  saveWebhookUrl, 
  syncReportToGoogleSheets 
} from '../services/googleSheetsService';
import {
  getSupabase,
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  fetchReportsFromCloud,
  insertReportToCloud,
  deleteReportFromCloud,
  fetchUnifiedCloudConfig,
  fetchStoreManagersFromCloud,
  upsertStoreManagerInCloud,
  fetchProductsFromCloud,
  saveProductsToCloud,
  fetchStoresFromCloud,
  saveStoresToCloud,
  fetchChainsFromCloud,
  saveChainsToCloud,
  APP_PRODUCTS_CONFIG_KEY,
  APP_STORES_CONFIG_KEY,
  APP_CHAINS_CONFIG_KEY,
  mapRowToReport
} from '../services/supabaseClient';

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'synced' | 'error';
  message: string;
  timestamp?: string;
}

interface ReportContextType {
  reports: VisitReport[];
  activeView: 'merchandiser' | 'manager' | 'admin';
  setActiveView: (view: 'merchandiser' | 'manager' | 'admin') => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  activeMerchandiser: { name: string; id: string };
  setActiveMerchandiser: (val: { name: string; id: string }) => void;
  addReport: (report: Omit<VisitReport, 'id' | 'timestamp' | 'formattedDate' | 'formattedTime' | 'totalStockOnHand' | 'outOfStockCount' | 'expiringSoonCount' | 'hasOrderRequest' | 'status'>) => VisitReport;
  deleteReport: (id: string) => void;
  resetToDefaults: () => void;
  selectedReport: VisitReport | null;
  setSelectedReport: (report: VisitReport | null) => void;
  pendingStoreToLog: StoreLocation | null;
  setPendingStoreToLog: (store: StoreLocation | null) => void;
  getStoreManager: (storeId: string) => StoreManagerContact | null;
  saveStoreManager: (storeId: string, contact: StoreManagerContact) => void;
  storeManagers: Record<string, StoreManagerContact>;
  // Dynamic Products Catalog
  products: ProductItem[];
  updateProduct: (product: ProductItem) => void;
  addProduct: (product: ProductItem) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  // Dynamic Stores / Places Catalog
  stores: StoreLocation[];
  addStore: (store: Omit<StoreLocation, 'id' | 'fullLabel'> & { id?: string }) => StoreLocation;
  updateStore: (store: StoreLocation) => void;
  deleteStore: (id: string) => void;
  resetStores: () => void;
  // Supermarket Categories / Chains Catalog
  chains: ChainConfig[];
  addChain: (chain: { name: string; color: string; icon?: 'building' | 'fuel' | 'cart' | 'store' | 'tag' }) => ChainConfig;
  updateChain: (chain: ChainConfig) => void;
  deleteChain: (idOrName: string) => void;
  resetChains: () => void;
  sheetsWebhookUrl: string;
  updateSheetsWebhookUrl: (url: string) => void;
  syncStatus: SyncStatus;
  // Supabase Cloud & Realtime
  isCloudConnected: boolean;
  isRealtimeActive: boolean;
  cloudConfig: { url: string; key: string };
  updateCloudConfig: (url: string, key: string) => Promise<boolean>;
  bulkPushToCloud: () => Promise<number>;
}

const STORAGE_KEY = 'casa_pons_visit_reports_v1';
const MANAGERS_STORAGE_KEY = 'casa_pons_store_managers_v3';
const PRODUCTS_STORAGE_KEY = 'casa_pons_custom_products_v1';
const STORES_STORAGE_KEY = 'casa_pons_custom_stores_v1';
const CHAINS_STORAGE_KEY = 'casa_pons_custom_chains_v1';

// Strips heavy base64 strings so browser localStorage 5MB quota is never exceeded
function sanitizeReportForStorage(r: VisitReport): VisitReport {
  return {
    ...r,
    photos: (r.photos || []).map((p) => ({
      ...p,
      dataUrl: p.dataUrl && p.dataUrl.length > 30000 ? '' : p.dataUrl,
    })),
  };
}

function safeSaveReportsToStorage(list: VisitReport[]) {
  try {
    const sanitized = list.map(sanitizeReportForStorage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('Failed to save reports to localStorage:', e);
  }
}

// Seed initial manager directory (clean empty object - no fake manager pre-seeds)
function getSeedManagers(): Record<string, StoreManagerContact> {
  return buildInitialStoreManagers();
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<VisitReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load reports from localStorage', e);
    }
    return INITIAL_MOCK_REPORTS;
  });

  const [storeManagers, setStoreManagers] = useState<Record<string, StoreManagerContact>>(() => {
    try {
      const saved = localStorage.getItem(MANAGERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load store managers from localStorage', e);
    }
    return {};
  });

  // Dynamic Products Catalog
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load products from localStorage', e);
    }
    return CASA_PONS_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  const updateProduct = (updated: ProductItem) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      saveProductsToCloud(next);
      return next;
    });
  };

  const addProduct = (newProd: ProductItem) => {
    setProducts((prev) => {
      const next = [...prev, newProd];
      saveProductsToCloud(next);
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProductsToCloud(next);
      return next;
    });
  };

  const resetProducts = () => {
    setProducts(CASA_PONS_PRODUCTS);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    saveProductsToCloud(CASA_PONS_PRODUCTS);
  };

  // Dynamic Stores / Places Catalog
  const [stores, setStores] = useState<StoreLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load stores from localStorage', e);
    }
    return STORES_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
    } catch (e) {
      console.error('Failed to save stores to localStorage', e);
    }
  }, [stores]);

  const addStore = (newStoreData: Omit<StoreLocation, 'id' | 'fullLabel'> & { id?: string }): StoreLocation => {
    const chainSlug = (newStoreData.chain || 'store').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameSlug = newStoreData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const id = newStoreData.id || `${chainSlug}-${nameSlug}-${Date.now().toString().slice(-4)}`;
    const fullLabel = `${newStoreData.chain} - ${newStoreData.name}`;

    const newStore: StoreLocation = {
      id,
      name: newStoreData.name.trim(),
      chain: newStoreData.chain as any,
      region: newStoreData.region || 'Dubai',
      fullLabel,
    };

    setStores((prev) => {
      const next = [newStore, ...prev];
      saveStoresToCloud(next);
      return next;
    });

    return newStore;
  };

  const updateStore = (updated: StoreLocation) => {
    const fullLabel = `${updated.chain} - ${updated.name.trim()}`;
    const normalized: StoreLocation = {
      ...updated,
      name: updated.name.trim(),
      fullLabel,
    };

    setStores((prev) => {
      const next = prev.map((s) => (s.id === normalized.id ? normalized : s));
      saveStoresToCloud(next);
      return next;
    });
  };

  const deleteStore = (id: string) => {
    setStores((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveStoresToCloud(next);
      return next;
    });
  };

  const resetStores = () => {
    setStores(STORES_DATA);
    localStorage.removeItem(STORES_STORAGE_KEY);
    saveStoresToCloud(STORES_DATA);
  };

  // Supermarket Categories / Chains Catalog
  const [chains, setChains] = useState<ChainConfig[]>(() => {
    try {
      const saved = localStorage.getItem(CHAINS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load chains from localStorage', e);
    }
    return DEFAULT_CHAINS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHAINS_STORAGE_KEY, JSON.stringify(chains));
    } catch (e) {
      console.error('Failed to save chains to localStorage', e);
    }
  }, [chains]);

  // Ensure any chain present in stores (e.g. Grandiose) is automatically registered
  useEffect(() => {
    const existingMap = new Map(chains.map((c) => [c.name.toLowerCase(), c]));
    let hasChanges = false;
    const nextChains = [...chains];

    stores.forEach((s) => {
      if (s.chain && !existingMap.has(s.chain.toLowerCase())) {
        const lower = s.chain.toLowerCase();
        const autoColor = lower.includes('grandiose') ? 'purple' : lower.includes('lulu') ? 'red' : 'blue';
        const newEntry: ChainConfig = {
          id: lower.replace(/[^a-z0-9]/g, ''),
          name: s.chain,
          color: autoColor,
          icon: 'cart',
        };
        existingMap.set(lower, newEntry);
        nextChains.push(newEntry);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setChains(nextChains);
      saveChainsToCloud(nextChains);
    }
  }, [stores]);

  const addChain = (data: { name: string; color: string; icon?: any }): ChainConfig => {
    const trimmedName = data.name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const existing = chains.find((c) => c.name.toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      const updated: ChainConfig = {
        ...existing,
        color: data.color || existing.color,
        icon: data.icon || existing.icon,
      };
      updateChain(updated);
      return updated;
    }

    const newChain: ChainConfig = {
      id: slug || `chain-${Date.now().toString().slice(-4)}`,
      name: trimmedName,
      color: data.color || 'purple',
      icon: data.icon || 'store',
    };

    setChains((prev) => {
      const next = [...prev, newChain];
      saveChainsToCloud(next);
      return next;
    });

    return newChain;
  };

  const updateChain = (updated: ChainConfig) => {
    setChains((prev) => {
      const next = prev.map((c) =>
        c.id === updated.id || c.name.toLowerCase() === updated.name.toLowerCase()
          ? { ...c, ...updated }
          : c
      );
      saveChainsToCloud(next);
      return next;
    });
  };

  const deleteChain = (idOrName: string) => {
    const target = idOrName.toLowerCase();
    setChains((prev) => {
      const next = prev.filter(
        (c) => c.id.toLowerCase() !== target && c.name.toLowerCase() !== target
      );
      saveChainsToCloud(next);
      return next;
    });
  };

  const resetChains = () => {
    setChains(DEFAULT_CHAINS);
    localStorage.removeItem(CHAINS_STORAGE_KEY);
    saveChainsToCloud(DEFAULT_CHAINS);
  };

  // Inspect URL for initial view (/admin or #/admin)
  const getInitialView = (): 'merchandiser' | 'manager' | 'admin' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash.startsWith('#/admin') || hash === '#admin') {
        return 'admin';
      }
    }
    return 'merchandiser';
  };

  const [activeView, setActiveViewState] = useState<'merchandiser' | 'manager' | 'admin'>(getInitialView);

  // Sync activeView with browser URL history without reload
  const setActiveView = useCallback((view: 'merchandiser' | 'manager' | 'admin') => {
    setActiveViewState(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        if (!window.location.pathname.startsWith('/admin')) {
          window.history.pushState({ view: 'admin' }, '', '/admin');
        }
      } else {
        if (window.location.pathname.startsWith('/admin')) {
          window.history.pushState({ view }, '', '/');
        }
      }
    }
  }, []);

  // Listen to browser Back/Forward buttons and Hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash.startsWith('#/admin') || hash === '#admin') {
        setActiveViewState('admin');
      } else {
        setActiveViewState((prev) => (prev === 'admin' ? 'merchandiser' : prev));
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [activeMerchandiser, setActiveMerchandiser] = useState<{ name: string; id: string }>({
    name: 'Casapons',
    id: 'CP-M12',
  });
  const [selectedReport, setSelectedReport] = useState<VisitReport | null>(null);
  const [pendingStoreToLog, setPendingStoreToLog] = useState<StoreLocation | null>(null);

  useEffect(() => {
    safeSaveReportsToStorage(reports);
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(MANAGERS_STORAGE_KEY, JSON.stringify(storeManagers));
    } catch (e) {
      console.error('Failed to save store managers to localStorage', e);
    }
  }, [storeManagers]);

  const [cloudConfig, setCloudConfig] = useState<{ url: string; key: string }>(() => getSavedSupabaseConfig());
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);

  // Update Supabase configuration and trigger reconnection
  const updateCloudConfig = useCallback(async (url: string, key: string): Promise<boolean> => {
    saveSupabaseConfig(url, key);
    setCloudConfig({ url: url.trim(), key: key.trim() });
    if (!url.trim() || !key.trim()) {
      setIsCloudConnected(false);
      setIsRealtimeActive(false);
      return true;
    }
    const supabase = getSupabase();
    if (!supabase) return false;

    // Test fetch
    const cloudReports = await fetchReportsFromCloud();
    if (cloudReports) {
      if (cloudReports.length > 0) {
        setReports(cloudReports);
      }
      setIsCloudConnected(true);
      return true;
    }
    return false;
  }, []);

  // Bulk push local reports to Supabase
  const bulkPushToCloud = useCallback(async (): Promise<number> => {
    let pushed = 0;
    for (const r of reports) {
      const ok = await insertReportToCloud(r);
      if (ok) pushed++;
    }
    // Also push managers
    for (const [storeId, contact] of Object.entries(storeManagers)) {
      await upsertStoreManagerInCloud(storeId, contact);
    }
    // Also push products
    await saveProductsToCloud(products);
    // Also push stores / places
    await saveStoresToCloud(stores);
    return pushed;
  }, [reports, storeManagers, products, stores]);

  // Connect to Supabase on mount and establish live Realtime subscription
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsCloudConnected(false);
      setIsRealtimeActive(false);
      return;
    }

    let isMounted = true;
    setIsCloudConnected(true);

    // Fast initial fetch of recent reports from cloud to load full history
    fetchReportsFromCloud({ limit: 100 })
      .then(async (cloudReports) => {
        if (!isMounted || !cloudReports || cloudReports.length === 0) return;
        setReports((prev) => {
          const incomingMap = new Map(cloudReports.map((r) => [r.id, r]));
          const merged = [...cloudReports];
          for (const localRep of prev) {
            if (!incomingMap.has(localRep.id)) {
              merged.push(localRep);
            }
          }
          merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          safeSaveReportsToStorage(merged);
          return merged;
        });
      });

    // Unified fetch: loads managers, dynamic products, and dynamic stores in a single roundtrip (66% less egress)
    fetchUnifiedCloudConfig().then(async (config) => {
      if (!isMounted || !config) return;

      if (Object.keys(config.managers).length > 0) {
        setStoreManagers((prev) => ({ ...prev, ...config.managers }));
      }

      if (config.products && config.products.length > 0) {
        setProducts(config.products);
        try {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(config.products));
        } catch (e) {}
      }

      if (config.stores && config.stores.length > 0) {
        setStores(config.stores);
        try {
          localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(config.stores));
        } catch (e) {}
      }

      if (config.chains && config.chains.length > 0) {
        setChains(config.chains);
        try {
          localStorage.setItem(CHAINS_STORAGE_KEY, JSON.stringify(config.chains));
        } catch (e) {}
      }
    });

    // Live Realtime Subscription (WebSockets)
    const channel = supabase
      .channel('casa_pons_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'visit_reports' },
        (payload) => {
          if (isMounted && payload.new) {
            const newReport = mapRowToReport(payload.new);
            setReports((prev) => {
              // Avoid duplicates if this client initiated the insert
              if (prev.some((r) => r.id === newReport.id)) return prev;
              return [newReport, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'visit_reports' },
        (payload) => {
          if (isMounted && payload.old && payload.old.id) {
            setReports((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_managers' },
        (payload) => {
          const newRow = payload.new as { store_id?: string; name?: string; phone?: string } | undefined;
          if (isMounted && newRow && newRow.store_id) {
            // Live cross-device sync of products catalog
            if (newRow.store_id === APP_PRODUCTS_CONFIG_KEY) {
              try {
                const parsedProds = JSON.parse(newRow.phone || '[]');
                if (Array.isArray(parsedProds) && parsedProds.length > 0) {
                  setProducts(parsedProds);
                  try {
                    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(parsedProds));
                  } catch (e) {}
                }
              } catch (err) {
                console.error('Failed to parse realtime products:', err);
              }
              return;
            }

            // Live cross-device sync of stores / places catalog
            if (newRow.store_id === APP_STORES_CONFIG_KEY) {
              try {
                const parsedStores = JSON.parse(newRow.phone || '[]');
                if (Array.isArray(parsedStores) && parsedStores.length > 0) {
                  setStores(parsedStores);
                  try {
                    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(parsedStores));
                  } catch (e) {}
                }
              } catch (err) {
                console.error('Failed to parse realtime stores:', err);
              }
              return;
            }

            // Live cross-device sync of chains / supermarket categories
            if (newRow.store_id === APP_CHAINS_CONFIG_KEY) {
              try {
                const parsedChains = JSON.parse(newRow.phone || '[]');
                if (Array.isArray(parsedChains) && parsedChains.length > 0) {
                  setChains(parsedChains);
                  try {
                    localStorage.setItem(CHAINS_STORAGE_KEY, JSON.stringify(parsedChains));
                  } catch (e) {}
                }
              } catch (err) {
                console.error('Failed to parse realtime chains:', err);
              }
              return;
            }

            setStoreManagers((prev) => ({
              ...prev,
              [newRow.store_id!]: {
                name: newRow.name || '',
                phone: newRow.phone || '',
              },
            }));
          }
        }
      )
      .subscribe((status) => {
        if (isMounted) {
          if (status === 'SUBSCRIBED') {
            setIsRealtimeActive(true);
            setIsCloudConnected(true);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setIsRealtimeActive(false);
          }
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [cloudConfig.url, cloudConfig.key]);

  const [sheetsWebhookUrl, setSheetsWebhookUrl] = useState<string>(() => getSavedWebhookUrl());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'idle',
    message: getSavedWebhookUrl() ? 'Google Sheet connected' : 'Local storage (Cloud sync available)',
  });

  const updateSheetsWebhookUrl = (url: string) => {
    saveWebhookUrl(url);
    setSheetsWebhookUrl(url.trim());
    if (url.trim()) {
      setSyncStatus({
        state: 'idle',
        message: 'Google Sheet connected',
      });
    } else {
      setSyncStatus({
        state: 'idle',
        message: 'Local storage (No webhook configured)',
      });
    }
  };

  const getStoreManager = (storeId: string): StoreManagerContact | null => {
    return storeManagers[storeId] || null;
  };

  const saveStoreManager = (storeId: string, contact: StoreManagerContact) => {
    if (!storeId || (!contact.name && !contact.phone)) return;
    setStoreManagers((prev) => ({
      ...prev,
      [storeId]: {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
      },
    }));

    // Sync to Supabase in background
    upsertStoreManagerInCloud(storeId, contact).catch(console.error);
  };

  const addReport = (data: Omit<VisitReport, 'id' | 'timestamp' | 'formattedDate' | 'formattedTime' | 'totalStockOnHand' | 'outOfStockCount' | 'expiringSoonCount' | 'hasOrderRequest' | 'status'>): VisitReport => {
    const now = new Date();
    const timestamp = now.toISOString();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Save/update manager memory if entered
    if (data.managerName || data.managerPhone) {
      saveStoreManager(data.store.id, {
        name: data.managerName || '',
        phone: data.managerPhone || '',
      });
    }

    // Compute stats
    let totalStockOnHand = 0;
    let outOfStockCount = 0;
    let expiringSoonCount = 0;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    data.inventory.forEach(item => {
      totalStockOnHand += Number(item.stockOnHand) || 0;
      if (item.availabilityStatus !== 'N/A' && (!item.isAvailable || (Number(item.stockOnHand) === 0))) {
        outOfStockCount++;
      }
      if (item.expiryDate) {
        const expDate = new Date(item.expiryDate);
        if (!isNaN(expDate.getTime()) && expDate <= thirtyDaysFromNow) {
          expiringSoonCount++;
        }
      }
    });

    const hasOrderRequest = data.orderNeeded !== 'No' && data.orderItems.some(i => i.requested && i.quantity > 0);
    
    let status: 'Completed' | 'Pending Review' | 'Urgent Restock' = 'Completed';
    if (outOfStockCount > 1 || (data.orderNeeded === 'Yes' && outOfStockCount > 0)) {
      status = 'Urgent Restock';
    }

    const newReport: VisitReport = {
      ...data,
      id: `CP-REP-${Date.now().toString().slice(-4)}`,
      timestamp,
      formattedDate,
      formattedTime,
      totalStockOnHand,
      outOfStockCount,
      expiringSoonCount,
      hasOrderRequest,
      status,
    };

    // Save locally first (offline-first)
    setReports(prev => [newReport, ...prev]);

    // Push to Supabase Cloud Database (Realtime propagates to all other devices)
    insertReportToCloud(newReport).then((ok) => {
      if (ok) {
        console.log('Report streamed to Supabase cloud successfully');
      }
    }).catch(console.error);

    // Dispatch sync to Google Sheets if configured
    if (sheetsWebhookUrl) {
      setSyncStatus({ state: 'syncing', message: 'Syncing report to Google Sheet...' });
      syncReportToGoogleSheets(newReport, sheetsWebhookUrl)
        .then((res) => {
          setSyncStatus({
            state: res.success ? 'synced' : 'error',
            message: res.success ? 'Synced to Google Sheet' : res.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        })
        .catch(() => {
          setSyncStatus({
            state: 'error',
            message: 'Sync error (report saved locally)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        });
    }

    return newReport;
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
    deleteReportFromCloud(id).catch(console.error);
  };

  const resetToDefaults = () => {
    setReports(INITIAL_MOCK_REPORTS);
    const seeds = getSeedManagers();
    setStoreManagers(seeds);
    setProducts(CASA_PONS_PRODUCTS);
    setStores(STORES_DATA);
    setChains(DEFAULT_CHAINS);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MANAGERS_STORAGE_KEY);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(STORES_STORAGE_KEY);
    localStorage.removeItem(CHAINS_STORAGE_KEY);
    saveStoresToCloud(STORES_DATA);
    saveChainsToCloud(DEFAULT_CHAINS);
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        activeView,
        setActiveView,
        isMobileFrame,
        setIsMobileFrame,
        activeMerchandiser,
        setActiveMerchandiser,
        addReport,
        deleteReport,
        resetToDefaults,
        selectedReport,
        setSelectedReport,
        pendingStoreToLog,
        setPendingStoreToLog,
        getStoreManager,
        saveStoreManager,
        storeManagers,
        products,
        updateProduct,
        addProduct,
        deleteProduct,
        resetProducts,
        stores,
        addStore,
        updateStore,
        deleteStore,
        resetStores,
        chains,
        addChain,
        updateChain,
        deleteChain,
        resetChains,
        sheetsWebhookUrl,
        updateSheetsWebhookUrl,
        syncStatus,
        isCloudConnected,
        isRealtimeActive,
        cloudConfig,
        updateCloudConfig,
        bulkPushToCloud,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
