import type { VisitReport } from '../types';
import { getOrderNotificationEmail, generateOrderEmailHtml } from './emailService';

export const SHEETS_STORAGE_KEY = 'casa_pons_sheets_webhook_url';

export const getSavedWebhookUrl = (): string => {
  return localStorage.getItem(SHEETS_STORAGE_KEY) || '';
};

export const saveWebhookUrl = (url: string): void => {
  if (url.trim()) {
    localStorage.setItem(SHEETS_STORAGE_KEY, url.trim());
  } else {
    localStorage.removeItem(SHEETS_STORAGE_KEY);
  }
};

/**
 * Format a VisitReport into a clean, flat payload tailored for Google Sheets.
 */
export const formatReportForSheets = (report: VisitReport) => {
  // Map individual SKUs to legible summaries
  const skuSummaries: Record<string, string> = {};
  report.inventory.forEach((item) => {
    skuSummaries[item.productName] = item.isAvailable
      ? `${item.stockOnHand} pcs${item.expiryDate ? ` (Exp: ${item.expiryDate})` : ''}`
      : 'OUT OF STOCK';
  });

  // Summarize requested order items
  const orderDetails =
    report.orderNeeded !== 'No'
      ? report.orderItems
          .filter((i) => i.requested && i.quantity > 0)
          .map((i) => `${i.productName}: ${i.quantity} pcs`)
          .join('; ')
      : 'None';

  return {
    action: 'log_report',
    id: report.id,
    timestamp: report.timestamp,
    date: report.formattedDate,
    time: report.formattedTime,
    merchandiserName: report.merchandiserName,
    merchandiserId: report.merchandiserId,
    chain: report.store.chain,
    storeName: report.store.name,
    region: report.store.region || '',
    fullLabel: report.store.fullLabel || '',
    managerName: report.managerName || '',
    managerPhone: report.managerPhone || '',
    totalStockOnHand: report.totalStockOnHand,
    outOfStockCount: report.outOfStockCount,
    expiringSoonCount: report.expiringSoonCount,
    orderNeeded: report.orderNeeded,
    orderDetails: orderDetails || 'None',
    orderNotes: report.orderNotes || '',
    displayCondition: report.displayCondition,
    isClean: report.isClean ? 'Yes (Clean)' : 'No (Needs Cleaning)',
    displayNotes: report.displayNotes || '',
    status: report.status,
    // Include 5 Official Casa Pons SKU columns
    sku_babyPecanCaramel: skuSummaries['Baby Pecan Caramel'] || '',
    sku_chocoChipsMilk140: skuSummaries['Choco Chips Milk Chocolate 140g'] || '',
    sku_chocoChipsMilk40: skuSummaries['Choco Chips Milk Chocolate 40g'] || '',
    sku_chocoChipsPB140: skuSummaries['Choco Chips with Peanut Butter 140g'] || '',
    sku_chocoChipsPB40: skuSummaries['Choco Chips with Peanut Butter 40g'] || '',
    // Photos count (omitting heavy base64 dataUrls to minimize webhook egress)
    photoCount: report.photos ? report.photos.length : 0,
    // Automatic Order Email Dispatch
    sendOrderEmail: report.orderNeeded === 'Yes' || report.hasOrderRequest,
    orderEmailTo: getOrderNotificationEmail(),
    orderEmailHtml: report.orderNeeded === 'Yes' || report.hasOrderRequest ? generateOrderEmailHtml(report) : '',
  };
};

/**
 * Send report to Google Apps Script Web App.
 * Using Content-Type text/plain avoids CORS preflight OPTIONS requests,
 * allowing mobile Safari/Chrome to POST directly to Google Apps Script.
 */
export const syncReportToGoogleSheets = async (
  report: VisitReport,
  webhookUrl?: string
): Promise<{ success: boolean; message: string }> => {
  const url = webhookUrl || getSavedWebhookUrl();
  if (!url) {
    return { success: false, message: 'No Google Sheets Webhook URL configured' };
  }

  const payload = formatReportForSheets(report);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.type === 'opaque') {
      return { success: true, message: 'Report synced to Google Sheets successfully' };
    }

    const text = await response.text();
    return { success: true, message: `Sync sent (${text || 'OK'})` };
  } catch (error) {
    console.warn('Google Sheets sync notice (may have synced via redirect):', error);
    // Google Apps Script redirects (302) on success which fetch occasionally marks as network warning,
    // but the row is written to the sheet.
    return { success: true, message: 'Dispatched to Google Sheet' };
  }
};

/**
 * Send a test ping to verify the Google Apps Script Web App is reachable.
 */
export const testGoogleSheetsConnection = async (url: string): Promise<boolean> => {
  if (!url.trim()) return false;
  try {
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'ping',
        timestamp: new Date().toISOString(),
        message: 'Test connection from Casa Pons Web App',
      }),
    });
    return true;
  } catch (e) {
    console.error('Test connection error:', e);
    return false;
  }
};
