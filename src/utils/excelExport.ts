import type { VisitReport, ProductItem, StoreLocation, StoreManagerContact } from '../types';
import { CASA_PONS_PRODUCTS } from '../data/products';

/**
 * Escapes CSV values and wraps in quotes if containing commas, quotes, or newlines.
 */
const escapeCSV = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generates an Excel-ready CSV file with UTF-8 BOM so Microsoft Excel opens it natively
 * with proper character encoding, column alignments, and all input fields.
 *
 * Product columns are dynamically generated from current catalog products,
 * ensuring that any renamed product or added SKU is immediately reflected in Excel headers.
 */
export const exportReportsToExcel = (
  reports: VisitReport[], 
  periodLabel: string, 
  customProducts?: ProductItem[]
) => {
  const products = (customProducts && customProducts.length > 0) ? customProducts : CASA_PONS_PRODUCTS;

  // Dynamically build headers for all products currently active in the catalog
  const dynamicProductHeaders = products.flatMap((p) => [
    `${p.name} - Available`,
    `${p.name} - Stock (PCS)`,
    `${p.name} - Expiry Date`,
  ]);

  const headers = [
    'Report ID',
    'Date',
    'Time',
    'Merchandiser Name',
    'Merchandiser ID',
    'Store Chain',
    'Store Location',
    'Emirate / Region',
    'Store Manager Name',
    'Store Manager Phone',
    'Total Stock On Hand (PCS)',
    'Out of Stock Count',
    'Expiring Soon Count',
    // Dynamic Product SKU Columns
    ...dynamicProductHeaders,
    // Order Requests
    'New Order Needed?',
    'Requested Order Items & Quantities',
    'Order Notes / LPO Reference',
    // Merchandising & Display
    'Display Condition Rating',
    'Cleanliness Standards Met?',
    'Display Observations / Notes',
    'Photos Attached Count',
    'Overall Status',
  ];

  const rows = reports.map((rep) => {
    // Dynamically retrieve SKU inventory metrics for each catalog product
    const productDataCells = products.flatMap((p) => {
      // Match by exact productId first, then case-insensitive name
      const item = rep.inventory.find(
        (i) => i.productId === p.id || i.productName.toLowerCase().trim() === p.name.toLowerCase().trim()
      );

      if (!item) {
        return ['N/A', 0, ''];
      }

      let availabilityLabel = 'N/A';
      if (item.availabilityStatus === 'N/A') {
        availabilityLabel = 'N/A';
      } else if (item.availabilityStatus === 'Out of Stock' || !item.isAvailable || Number(item.stockOnHand) === 0) {
        availabilityLabel = 'No (Out of Stock)';
      } else {
        availabilityLabel = 'Yes (Available)';
      }

      return [
        availabilityLabel,
        Number(item.stockOnHand) || 0,
        item.expiryDate || '',
      ];
    });

    // Summarize order items
    const orderItemsSummary =
      rep.orderNeeded === 'Yes'
        ? rep.orderItems
            .filter((i) => i.requested && i.quantity > 0)
            .map((i) => `${i.productName}: ${i.quantity} PCS`)
            .join('; ')
        : 'None';

    const baseData = [
      escapeCSV(rep.id),
      escapeCSV(rep.formattedDate),
      escapeCSV(rep.formattedTime),
      escapeCSV(rep.merchandiserName),
      escapeCSV(rep.merchandiserId),
      escapeCSV(rep.store.chain),
      escapeCSV(rep.store.name),
      escapeCSV(rep.store.region || ''),
      escapeCSV(rep.managerName || 'Not Provided'),
      escapeCSV(rep.managerPhone || 'Not Provided'),
      escapeCSV(rep.totalStockOnHand),
      escapeCSV(rep.outOfStockCount),
      escapeCSV(rep.expiringSoonCount),
      // Dynamic product metrics
      ...productDataCells.map((val) => escapeCSV(val)),
      // Order Requests
      escapeCSV(rep.orderNeeded),
      escapeCSV(orderItemsSummary || 'None'),
      escapeCSV(rep.orderNotes || ''),
      // Merchandising & Display
      escapeCSV(rep.displayCondition),
      escapeCSV(rep.isClean ? 'Yes (Clean & Dusted)' : 'No (Needs Cleaning)'),
      escapeCSV(rep.displayNotes || ''),
      escapeCSV(rep.photos ? rep.photos.length : 0),
      escapeCSV(rep.status),
    ];

    return baseData.join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters correctly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const sanitizedPeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Casa_Pons_Visit_Reports_${sanitizedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates an Excel-ready CSV file of all store managers across all retail stations.
 */
export const exportManagersToExcel = (
  stores: StoreLocation[],
  managers: Record<string, StoreManagerContact>,
  reports: VisitReport[] = []
) => {
  const headers = [
    'Store ID',
    'Store Name',
    'Retail Chain',
    'Emirate / Region',
    'Store Manager Name',
    'Phone Number',
    'Contact Status',
    'Total Completed Visits',
    'Last Visited Date',
    'Last Visit Merchandiser',
  ];

  const rows = stores.map((store) => {
    const contact = managers[store.id];
    const storeVisits = reports
      .filter((r) => r.store.id === store.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const lastVisit = storeVisits[0];

    const hasContact = Boolean(contact && (contact.name?.trim() || contact.phone?.trim()));
    const status = hasContact ? 'Verified on File' : 'Pending First Visit';

    return [
      escapeCSV(store.id),
      escapeCSV(store.name),
      escapeCSV(store.chain),
      escapeCSV(store.region),
      escapeCSV(contact?.name || 'Not on file'),
      escapeCSV(contact?.phone || 'Not on file'),
      escapeCSV(status),
      escapeCSV(storeVisits.length),
      escapeCSV(lastVisit ? lastVisit.formattedDate : 'No visits logged yet'),
      escapeCSV(lastVisit ? lastVisit.merchandiserName : '—'),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = `Casa_Pons_Store_Managers_Directory_${new Date().toISOString().split('T')[0]}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
