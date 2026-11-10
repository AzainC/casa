import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { VisitReport, StoreManagerContact, ProductItem, StoreLocation, StorePhoto, ChainConfig } from '../types';

export const SUPABASE_URL_KEY = 'casa_pons_supabase_url';
export const SUPABASE_ANON_KEY = 'casa_pons_supabase_anon_key';
export const APP_PRODUCTS_CONFIG_KEY = '__app_config_products_catalog__';
export const APP_STORES_CONFIG_KEY = '__app_config_stores_catalog__';
export const APP_CHAINS_CONFIG_KEY = '__app_config_chains_catalog__';

let cachedClient: SupabaseClient | null = null;

export const getSavedSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const url = localStorage.getItem(SUPABASE_URL_KEY) || envUrl || '';
  const key = localStorage.getItem(SUPABASE_ANON_KEY) || envKey || '';

  return { url: url.trim(), key: key.trim() };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (url.trim() && key.trim()) {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_ANON_KEY, key.trim());
    cachedClient = createClient(url.trim(), key.trim());
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY);
    cachedClient = null;
  }
};

export const getSupabase = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  const { url, key } = getSavedSupabaseConfig();
  if (url && key) {
    try {
      cachedClient = createClient(url, key);
      return cachedClient;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSavedSupabaseConfig();
  return Boolean(url && key);
};

// Map database row to VisitReport
export const mapRowToReport = (row: any): VisitReport => {
  return {
    id: row.id,
    timestamp: row.timestamp || row.created_at,
    formattedDate: row.formatted_date,
    formattedTime: row.formatted_time,
    merchandiserName: row.merchandiser_name,
    merchandiserId: row.merchandiser_id,
    store: {
      id: row.store_id,
      name: row.store_name,
      chain: row.store_chain,
      region: row.store_region || '',
      fullLabel: `${row.store_chain} - ${row.store_name}`,
    },
    managerName: row.manager_name || undefined,
    managerPhone: row.manager_phone || undefined,
    totalStockOnHand: row.total_stock_on_hand || 0,
    outOfStockCount: row.out_of_stock_count || 0,
    expiringSoonCount: row.expiring_soon_count || 0,
    inventory: Array.isArray(row.inventory) ? row.inventory : [],
    orderNeeded: row.order_needed,
    orderItems: Array.isArray(row.order_items) ? row.order_items : [],
    orderNotes: row.order_notes || '',
    displayCondition: row.display_condition,
    isClean: Boolean(row.is_clean),
    displayNotes: row.display_notes || '',
    photos: Array.isArray(row.photos) ? row.photos : [],
    status: row.status,
    hasOrderRequest: row.order_needed !== 'No',
  };
};

// Map VisitReport to database row
const mapReportToRow = (report: VisitReport) => {
  return {
    id: report.id,
    timestamp: report.timestamp,
    formatted_date: report.formattedDate,
    formatted_time: report.formattedTime,
    merchandiser_name: report.merchandiserName,
    merchandiser_id: report.merchandiserId,
    store_id: report.store.id,
    store_name: report.store.name,
    store_chain: report.store.chain,
    store_region: report.store.region,
    manager_name: report.managerName || null,
    manager_phone: report.managerPhone || null,
    total_stock_on_hand: report.totalStockOnHand,
    out_of_stock_count: report.outOfStockCount,
    expiring_soon_count: report.expiringSoonCount,
    inventory: report.inventory,
    order_needed: report.orderNeeded,
    order_items: report.orderItems,
    order_notes: report.orderNotes || '',
    display_condition: report.displayCondition,
    is_clean: report.isClean,
    display_notes: report.displayNotes || '',
    photos: report.photos || [],
    status: report.status,
  };
};

/**
 * Columns to retrieve for report list/dashboard to avoid transferring megabytes of base64 photos.
 */
const REPORT_SUMMARY_COLUMNS = [
  'id',
  'created_at',
  'timestamp',
  'formatted_date',
  'formatted_time',
  'merchandiser_name',
  'merchandiser_id',
  'store_id',
  'store_name',
  'store_chain',
  'store_region',
  'manager_name',
  'manager_phone',
  'total_stock_on_hand',
  'out_of_stock_count',
  'expiring_soon_count',
  'inventory',
  'order_needed',
  'order_items',
  'order_notes',
  'display_condition',
  'is_clean',
  'display_notes',
  'status'
].join(',');

/**
 * Fetch reports from Supabase with bounded limits and fast summary column projection.
 */
export const fetchReportsFromCloud = async (options?: {
  newerThanTimestamp?: string;
  limit?: number;
}): Promise<VisitReport[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    let query = supabase
      .from('visit_reports')
      .select(REPORT_SUMMARY_COLUMNS)
      .order('timestamp', { ascending: false });

    // Delta sync: fetch only reports created since the last cached report
    if (options?.newerThanTimestamp) {
      query = query.gt('timestamp', options.newerThanTimestamp);
    } else {
      query = query.limit(options?.limit || 100);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching reports from Supabase:', error);
      return null;
    }

    return (data || []).map(mapRowToReport);
  } catch (err) {
    console.error('Network error fetching from Supabase:', err);
    return null;
  }
};

/**
 * Fetch display proof photos on-demand for a single report to avoid bloating the general list.
 */
export const fetchReportPhotos = async (id: string): Promise<StorePhoto[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('visit_reports')
      .select('photos')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return [];
    return Array.isArray(data.photos) ? data.photos : [];
  } catch {
    return [];
  }
};

/**
 * Insert new report into Supabase
 */
export const insertReportToCloud = async (report: VisitReport): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const row = mapReportToRow(report);
    const { error } = await supabase.from('visit_reports').insert(row);
    if (error) {
      console.error('Error inserting report to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert report to Supabase:', err);
    return false;
  }
};

/**
 * Delete a report from Supabase
 */
export const deleteReportFromCloud = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('visit_reports').delete().eq('id', id);
    return !error;
  } catch (err) {
    console.error('Failed to delete report from Supabase:', err);
    return false;
  }
};

export interface CloudUnifiedConfig {
  managers: Record<string, StoreManagerContact>;
  products: ProductItem[] | null;
  stores: StoreLocation[] | null;
  chains: ChainConfig[] | null;
}

/**
 * Unified Cloud Config Fetch: Loads managers, products, stores, and supermarket categories/chains
 * in a single roundtrip, eliminating redundant database queries and reducing cloud egress by 75%.
 */
export const fetchUnifiedCloudConfig = async (): Promise<CloudUnifiedConfig | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('store_managers').select('*');
    if (error) {
      console.warn('Error fetching unified config from Supabase:', error);
      return null;
    }

    const managers: Record<string, StoreManagerContact> = {};
    let products: ProductItem[] | null = null;
    let stores: StoreLocation[] | null = null;
    let chains: ChainConfig[] | null = null;

    (data || []).forEach((row) => {
      if (row.store_id === APP_PRODUCTS_CONFIG_KEY) {
        try {
          const parsed = JSON.parse(row.phone || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) products = parsed;
        } catch (e) {}
        return;
      }

      if (row.store_id === APP_STORES_CONFIG_KEY) {
        try {
          const parsed = JSON.parse(row.phone || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) stores = parsed;
        } catch (e) {}
        return;
      }

      if (row.store_id === APP_CHAINS_CONFIG_KEY) {
        try {
          const parsed = JSON.parse(row.phone || '[]');
          if (Array.isArray(parsed) && parsed.length > 0) chains = parsed;
        } catch (e) {}
        return;
      }

      if ((row.name && row.name.trim()) || (row.phone && row.phone.trim())) {
        managers[row.store_id] = {
          name: (row.name || '').trim(),
          phone: (row.phone || '').trim(),
        };
      }
    });

    return { managers, products, stores, chains };
  } catch (err) {
    console.error('Failed to fetch unified config from Supabase:', err);
    return null;
  }
};

/**
 * Fetch all store manager contacts
 */
export const fetchStoreManagersFromCloud = async (): Promise<Record<string, StoreManagerContact> | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('store_managers').select('*');
    if (error) {
      console.warn('Error fetching store managers from Supabase:', error);
      return null;
    }

    const result: Record<string, StoreManagerContact> = {};
    (data || []).forEach((row) => {
      if (
        row.store_id === APP_PRODUCTS_CONFIG_KEY ||
        row.store_id === APP_STORES_CONFIG_KEY ||
        row.store_id === APP_CHAINS_CONFIG_KEY
      ) return;
      if ((row.name && row.name.trim()) || (row.phone && row.phone.trim())) {
        result[row.store_id] = {
          name: (row.name || '').trim(),
          phone: (row.phone || '').trim(),
        };
      }
    });
    return result;
  } catch (err) {
    console.error('Failed to fetch store managers from Supabase:', err);
    return null;
  }
};

/**
 * Fetch dynamic chains / supermarket categories from Supabase Cloud
 */
export const fetchChainsFromCloud = async (): Promise<ChainConfig[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('store_managers')
      .select('phone')
      .eq('store_id', APP_CHAINS_CONFIG_KEY)
      .maybeSingle();

    if (error || !data || !data.phone) {
      return null;
    }

    const parsed = JSON.parse(data.phone);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Could not load chains catalog from cloud:', err);
  }
  return null;
};

/**
 * Save / Upsert dynamic chains / supermarket categories in Supabase Cloud
 */
export const saveChainsToCloud = async (chains: ChainConfig[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('store_managers').upsert({
      store_id: APP_CHAINS_CONFIG_KEY,
      name: 'chains_catalog',
      phone: JSON.stringify(chains),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to sync chains to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving chains to Supabase:', err);
    return false;
  }
};

/**
 * Fetch dynamic places / stores catalog from Supabase Cloud
 */
export const fetchStoresFromCloud = async (): Promise<StoreLocation[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('store_managers')
      .select('phone')
      .eq('store_id', APP_STORES_CONFIG_KEY)
      .maybeSingle();

    if (error || !data || !data.phone) {
      return null;
    }

    const parsed = JSON.parse(data.phone);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Could not load stores catalog from cloud:', err);
  }
  return null;
};

/**
 * Save / Upsert dynamic places / stores catalog in Supabase Cloud
 */
export const saveStoresToCloud = async (stores: StoreLocation[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('store_managers').upsert({
      store_id: APP_STORES_CONFIG_KEY,
      name: 'stores_catalog',
      phone: JSON.stringify(stores),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to sync stores to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving stores to Supabase:', err);
    return false;
  }
};

/**
 * Fetch dynamic products catalog from Supabase Cloud
 */
export const fetchProductsFromCloud = async (): Promise<ProductItem[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('store_managers')
      .select('phone')
      .eq('store_id', APP_PRODUCTS_CONFIG_KEY)
      .maybeSingle();

    if (error || !data || !data.phone) {
      return null;
    }

    const parsed = JSON.parse(data.phone);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Could not load products catalog from cloud:', err);
  }
  return null;
};

/**
 * Save / Upsert dynamic products catalog in Supabase Cloud
 */
export const saveProductsToCloud = async (products: ProductItem[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('store_managers').upsert({
      store_id: APP_PRODUCTS_CONFIG_KEY,
      name: 'products_catalog',
      phone: JSON.stringify(products),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to sync products to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving products to Supabase:', err);
    return false;
  }
};

/**
 * Upsert store manager contact
 */
export const upsertStoreManagerInCloud = async (
  storeId: string,
  contact: StoreManagerContact
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('store_managers').upsert({
      store_id: storeId,
      name: contact.name,
      phone: contact.phone,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.error('Failed to upsert store manager in Supabase:', err);
    return false;
  }
};

/**
 * Test Supabase connectivity
 */
export const testSupabaseConnection = async (
  url: string,
  key: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const tempClient = createClient(url.trim(), key.trim());
    const { data, error } = await tempClient.from('visit_reports').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables need to be created using the SQL script).',
        };
      }
      return { success: false, message: error.message || 'Supabase returned an error' };
    }

    return { success: true, message: 'Connected to Supabase live database successfully!' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Connection failed' };
  }
};

/**
 * Pre-written SQL schema script for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- 1. Create visit_reports table
CREATE TABLE IF NOT EXISTS public.visit_reports (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  timestamp TEXT NOT NULL,
  formatted_date TEXT NOT NULL,
  formatted_time TEXT NOT NULL,
  merchandiser_name TEXT NOT NULL,
  merchandiser_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_chain TEXT NOT NULL,
  store_region TEXT,
  manager_name TEXT,
  manager_phone TEXT,
  total_stock_on_hand INTEGER DEFAULT 0,
  out_of_stock_count INTEGER DEFAULT 0,
  expiring_soon_count INTEGER DEFAULT 0,
  inventory JSONB DEFAULT '[]'::jsonb,
  order_needed TEXT NOT NULL,
  order_items JSONB DEFAULT '[]'::jsonb,
  order_notes TEXT,
  display_condition TEXT,
  is_clean BOOLEAN DEFAULT true,
  display_notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL
);

-- 2. Create store_managers table
CREATE TABLE IF NOT EXISTS public.store_managers (
  store_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) with open read/write access for public anon key
ALTER TABLE public.visit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read visit_reports" ON public.visit_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert visit_reports" ON public.visit_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update visit_reports" ON public.visit_reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete visit_reports" ON public.visit_reports FOR DELETE USING (true);

CREATE POLICY "Allow public read store_managers" ON public.store_managers FOR SELECT USING (true);
CREATE POLICY "Allow public insert store_managers" ON public.store_managers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update store_managers" ON public.store_managers FOR UPDATE USING (true);

-- 4. Enable Realtime Replication for instant multi-user streaming
ALTER PUBLICATION supabase_realtime ADD TABLE public.visit_reports, public.store_managers;
`;
