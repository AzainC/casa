export type ChainType = string;

export interface ChainConfig {
  id: string;
  name: string;
  color: string;
  icon?: 'building' | 'fuel' | 'cart' | 'store' | 'tag';
}

export interface StoreLocation {
  id: string;
  name: string;
  chain: ChainType;
  region: string; // e.g., 'Dubai', 'Sharjah', 'Ajman', 'Abu Dhabi', 'Ras Al Khaimah'
  fullLabel: string;
}

export interface StoreManagerContact {
  name: string;
  phone: string;
}

export interface ProductItem {
  id: string;
  name: string;
  weightCategory?: string;
  flavorProfile: string;
  barcode: string;
  imageUrl: string;
  description: string;
  suggestedRetailPrice?: string;
  chains?: string[]; // Specific supermarket chains this SKU is assigned to (e.g. ['Choithrams', 'Emarat'], ['Grandiose'], or ['All'])
}

export type ShelfAvailability = 'Available' | 'Out of Stock' | 'N/A';

export interface ProductInventoryState {
  productId: string;
  productName: string;
  weight?: string;
  isAvailable: boolean; // Shelf availability: Yes / No
  availabilityStatus?: ShelfAvailability;
  stockOnHand: number;  // In PCS
  expiryDate: string;   // YYYY-MM-DD
}

export type OrderNeededStatus = 'Yes' | 'No';

export interface OrderItemRequest {
  productId: string;
  productName: string;
  requested: boolean;
  quantity: number; // in PCS / cartons
}

export type DisplayCondition = 
  | 'Excellent - Pristine & Front Faced'
  | 'Good - Minor Adjustments Needed'
  | 'Fair - Needs Restock / Re-facing'
  | 'Poor - Disorganized / Damaged';

export interface StorePhoto {
  id: string;
  dataUrl: string;
  caption?: string;
  takenAt: string;
}

export interface VisitReport {
  id: string;
  merchandiserName: string;
  merchandiserId: string;
  store: StoreLocation;
  timestamp: string; // ISO string
  formattedDate: string;
  formattedTime: string;
  
  // Store Manager Contact
  managerName?: string;
  managerPhone?: string;

  // Inventory
  inventory: ProductInventoryState[];
  
  // Order
  orderNeeded: OrderNeededStatus;
  orderItems: OrderItemRequest[];
  orderNotes?: string;
  
  // Display & Cleanliness
  displayCondition: DisplayCondition;
  isClean: boolean; // Cleanliness toggle: Yes / No
  displayNotes?: string;
  
  // Photos
  photos: StorePhoto[];
  
  // Computed summary for quick dashboard consumption
  totalStockOnHand: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  hasOrderRequest: boolean;
  status: 'Completed' | 'Pending Review' | 'Urgent Restock';
}

export type TimePeriodPreset = 
  | 'this-month' 
  | 'today' 
  | 'yesterday'
  | 'this-week' 
  | 'last-30-days' 
  | 'last-month' 
  | 'custom';

export interface UncompletedStoreInfo {
  store: StoreLocation;
  lastVisitDate: string | null;
  lastVisitReportId?: string;
  daysSinceLastVisit: number | null;
  managerContact?: StoreManagerContact | null;
}
