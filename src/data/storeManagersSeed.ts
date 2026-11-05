import type { StoreManagerContact } from '../types';

/**
 * Returns empty initial directory.
 * Store manager details are strictly entered dynamically by merchandisers during store audits.
 */
export function buildInitialStoreManagers(): Record<string, StoreManagerContact> {
  return {};
}
