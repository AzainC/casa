import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { VisitReport, StoreLocation, StoreManagerContact } from '../types';
import { INITIAL_MOCK_REPORTS } from '../data/mockReports';
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
  fetchStoreManagersFromCloud,
  upsertStoreManagerInCloud,
  mapRowToReport
} from '../services/supabaseClient';

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'synced' | 'error';
  message: string;
  timestamp?: string;
}

interface ReportContextType {
  reports: VisitReport[];
  activeView: 'merchandiser' | 'manager';
  setActiveView: (view: 'merchandiser' | 'manager') => void;
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
const MANAGERS_STORAGE_KEY = 'casa_pons_store_managers_v1';

// Seed initial manager directory from historical reports
function getSeedManagers(): Record<string, StoreManagerContact> {
  const seed: Record<string, StoreManagerContact> = {};
  INITIAL_MOCK_REPORTS.forEach((r) => {
    if (r.managerName && r.managerPhone) {
      seed[r.store.id] = {
        name: r.managerName,
        phone: r.managerPhone,
      };
    }
  });
  return seed;
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
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load store managers from localStorage', e);
    }
    return getSeedManagers();
  });

  const [activeView, setActiveView] = useState<'merchandiser' | 'manager'>('merchandiser');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [activeMerchandiser, setActiveMerchandiser] = useState<{ name: string; id: string }>({
    name: 'Karim Al Zaabi',
    id: 'CP-M12',
  });
  const [selectedReport, setSelectedReport] = useState<VisitReport | null>(null);
  const [pendingStoreToLog, setPendingStoreToLog] = useState<StoreLocation | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save reports to localStorage', e);
    }
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
    return pushed;
  }, [reports, storeManagers]);

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

    // Initial fetch of live reports
    fetchReportsFromCloud().then((cloudReports) => {
      if (isMounted && cloudReports && cloudReports.length > 0) {
        setReports(cloudReports);
      }
    });

    // Initial fetch of store managers
    fetchStoreManagersFromCloud().then((cloudManagers) => {
      if (isMounted && cloudManagers && Object.keys(cloudManagers).length > 0) {
        setStoreManagers((prev) => ({ ...prev, ...cloudManagers }));
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
          const newMgr = payload.new as { store_id?: string; name?: string; phone?: string } | undefined;
          if (isMounted && newMgr && newMgr.store_id) {
            setStoreManagers((prev) => ({
              ...prev,
              [newMgr.store_id!]: {
                name: newMgr.name || '',
                phone: newMgr.phone || '',
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
    const formattedDate = now.toISOString().split('T')[0];
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
      if (!item.isAvailable || (Number(item.stockOnHand) === 0)) {
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
    } else if (data.orderNeeded === 'Follow-up required') {
      status = 'Pending Review';
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MANAGERS_STORAGE_KEY);
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
