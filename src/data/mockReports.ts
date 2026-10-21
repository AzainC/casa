import type { VisitReport, StorePhoto } from '../types';
import { STORES_DATA } from './stores';
import { CASA_PONS_PRODUCTS } from './products';

// SVG Sample display photos for testing & pre-seeded reports
export const SAMPLE_STORE_PHOTOS: StorePhoto[] = [
  {
    id: 'sample-photo-1',
    takenAt: '2026-10-21T14:30:00Z',
    caption: 'Main Confectionery Endcap - Clean & Fully Restocked',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <defs>
          <linearGradient id="shelfBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E293B"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
          <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2E180C"/>
            <stop offset="50%" stop-color="#78350F"/>
            <stop offset="100%" stop-color="#C87D32"/>
          </linearGradient>
        </defs>
        <!-- Store Aisle Background -->
        <rect width="600" height="450" fill="url(#shelfBg)"/>
        <!-- Floor -->
        <polygon points="0,410 600,410 600,450 0,450" fill="#334155"/>
        <line x1="0" y1="410" x2="600" y2="410" stroke="#475569" stroke-width="2"/>
        
        <!-- Shelf Unit Structure -->
        <rect x="50" y="30" width="500" height="380" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="3"/>
        
        <!-- Header Banner -->
        <rect x="50" y="30" width="500" height="55" rx="6" fill="url(#headerGrad)"/>
        <rect x="50" y="80" width="500" height="5" fill="#E5A93C"/>
        <text x="300" y="65" font-family="serif" font-size="22" font-weight="900" fill="#FEF3C7" text-anchor="middle" letter-spacing="2">CASA PONS</text>
        <text x="300" y="78" font-family="sans-serif" font-size="9" font-weight="700" fill="#FDE68A" text-anchor="middle" letter-spacing="3">FINE ARTISAN CONFECTIONERY</text>

        <!-- Shelf 1 (Top) -->
        <rect x="60" y="160" width="480" height="10" fill="#94A3B8"/>
        <!-- Top Shelf Products: Baby Pecan Caramel -->
        <g transform="translate(80, 95)">
          <rect width="45" height="62" rx="4" fill="#854D0E" stroke="#E5A93C" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FEF3C7" text-anchor="middle">PECAN</text>
          <text x="22.5" y="44" font-family="sans-serif" font-size="6" fill="#FEF08A" text-anchor="middle">CARAMEL</text>
        </g>
        <g transform="translate(135, 95)">
          <rect width="45" height="62" rx="4" fill="#854D0E" stroke="#E5A93C" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FEF3C7" text-anchor="middle">PECAN</text>
        </g>
        <g transform="translate(190, 95)">
          <rect width="45" height="62" rx="4" fill="#854D0E" stroke="#E5A93C" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="7" font-weight="bold" fill="#FEF3C7" text-anchor="middle">PECAN</text>
        </g>
        <!-- Choco Chips 140g -->
        <g transform="translate(260, 95)">
          <rect width="45" height="62" rx="4" fill="#1E3A8A" stroke="#FBBF24" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#EFF6FF" text-anchor="middle">MILK</text>
          <text x="22.5" y="44" font-family="sans-serif" font-size="6" fill="#93C5FD" text-anchor="middle">140g</text>
        </g>
        <g transform="translate(315, 95)">
          <rect width="45" height="62" rx="4" fill="#1E3A8A" stroke="#FBBF24" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#EFF6FF" text-anchor="middle">MILK</text>
        </g>
        <!-- Peanut Butter 140g -->
        <g transform="translate(385, 95)">
          <rect width="45" height="62" rx="4" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">PEANUT</text>
          <text x="22.5" y="44" font-family="sans-serif" font-size="6" fill="#FDE68A" text-anchor="middle">140g</text>
        </g>
        <g transform="translate(440, 95)">
          <rect width="45" height="62" rx="4" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
          <text x="22.5" y="35" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">PEANUT</text>
        </g>

        <!-- Shelf 2 (Middle) -->
        <rect x="60" y="260" width="480" height="10" fill="#94A3B8"/>
        <!-- Grab & Go 40g pouches in display trays -->
        <rect x="75" y="240" width="195" height="18" fill="#0284C7" rx="3"/>
        <text x="172" y="253" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">MILK CHOCO 40g TRAY</text>
        <rect x="300" y="240" width="195" height="18" fill="#B45309" rx="3"/>
        <text x="397" y="253" font-family="sans-serif" font-size="9" font-weight="bold" fill="#FEF3C7" text-anchor="middle">PEANUT BUTTER 40g TRAY</text>

        <!-- Shelf 3 (Bottom) -->
        <rect x="60" y="360" width="480" height="10" fill="#94A3B8"/>
        <!-- Promotional POP Box -->
        <rect x="180" y="300" width="240" height="55" rx="6" fill="#C87D32"/>
        <text x="300" y="325" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">SPECIAL PROMOTION</text>
        <text x="300" y="342" font-family="sans-serif" font-size="10" fill="#FEF3C7" text-anchor="middle">Buy 2 Get 1 Free Grab &amp; Go</text>

        <!-- Merchandiser Timestamp Stamp -->
        <rect x="360" y="375" width="170" height="28" rx="4" fill="rgba(0,0,0,0.7)"/>
        <circle cx="375" cy="389" r="4" fill="#10B981"/>
        <text x="388" y="393" font-family="monospace" font-size="9" fill="#10B981" font-weight="bold">AUDIT PASSED • VERIFIED</text>
      </svg>
    `)}`,
  },
  {
    id: 'sample-photo-2',
    takenAt: '2026-10-21T11:15:00Z',
    caption: 'Front Checkout Impulse Rack - Needs Facing & Restock',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
        <rect width="600" height="450" fill="#1E1B18"/>
        <rect x="80" y="40" width="440" height="360" rx="8" fill="#292524" stroke="#78716C" stroke-width="2"/>
        <rect x="80" y="40" width="440" height="45" fill="#451A03"/>
        <text x="300" y="68" font-family="serif" font-size="18" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CASA PONS • CASHIER DISPLAY</text>
        
        <!-- Shelf Wire Baskets with low stock items -->
        <rect x="100" y="150" width="400" height="8" fill="#A8A29E"/>
        <g transform="translate(130, 95)">
          <rect width="38" height="52" rx="3" fill="#0284C7"/>
          <text x="19" y="30" font-family="sans-serif" font-size="6" fill="#FFF" text-anchor="middle">40g</text>
        </g>
        <g transform="translate(180, 95)">
          <rect width="38" height="52" rx="3" fill="#0284C7"/>
        </g>
        <!-- Out of stock gap notice -->
        <rect x="250" y="105" width="90" height="40" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" stroke-width="1.5" stroke-dasharray="3,3"/>
        <text x="295" y="128" font-family="sans-serif" font-size="8" font-weight="bold" fill="#F87171" text-anchor="middle">OUT OF STOCK</text>
        
        <rect x="100" y="260" width="400" height="8" fill="#A8A29E"/>
        <rect x="100" y="360" width="400" height="8" fill="#A8A29E"/>
        
        <rect x="370" y="375" width="160" height="25" rx="4" fill="rgba(0,0,0,0.8)"/>
        <circle cx="385" cy="387" r="4" fill="#F59E0B"/>
        <text x="396" y="391" font-family="monospace" font-size="8.5" fill="#FBBF24">RESTOCK REQ #409</text>
      </svg>
    `)}`,
  },
];

export const INITIAL_MOCK_REPORTS: VisitReport[] = [
  {
    id: 'CP-REP-1001',
    merchandiserName: 'Tariq Mansoor',
    merchandiserId: 'CP-M04',
    store: STORES_DATA.find(s => s.name === 'The Greens' && s.chain === 'Choithrams') || STORES_DATA[0],
    timestamp: '2026-10-21T09:15:00+04:00',
    formattedDate: '2026-10-21',
    formattedTime: '09:15 AM',
    managerName: 'Mohammad Rashid',
    managerPhone: '+971 50 421 8839',
    inventory: [
      {
        productId: CASA_PONS_PRODUCTS[0].id,
        productName: CASA_PONS_PRODUCTS[0].name,
        isAvailable: true,
        stockOnHand: 18,
        expiryDate: '2027-04-15',
      },
      {
        productId: CASA_PONS_PRODUCTS[1].id,
        productName: CASA_PONS_PRODUCTS[1].name,
        isAvailable: true,
        stockOnHand: 12,
        expiryDate: '2027-02-28',
      },
      {
        productId: CASA_PONS_PRODUCTS[2].id,
        productName: CASA_PONS_PRODUCTS[2].name,
        isAvailable: true,
        stockOnHand: 34,
        expiryDate: '2027-03-10',
      },
      {
        productId: CASA_PONS_PRODUCTS[3].id,
        productName: CASA_PONS_PRODUCTS[3].name,
        isAvailable: false,
        stockOnHand: 0,
        expiryDate: '2026-11-05',
      },
      {
        productId: CASA_PONS_PRODUCTS[4].id,
        productName: CASA_PONS_PRODUCTS[4].name,
        isAvailable: true,
        stockOnHand: 8,
        expiryDate: '2026-12-15',
      },
    ],
    orderNeeded: 'Yes',
    orderItems: [
      {
        productId: CASA_PONS_PRODUCTS[3].id,
        productName: CASA_PONS_PRODUCTS[3].name,
        requested: true,
        quantity: 24,
      },
      {
        productId: CASA_PONS_PRODUCTS[4].id,
        productName: CASA_PONS_PRODUCTS[4].name,
        requested: true,
        quantity: 30,
      },
    ],
    orderNotes: 'Urgent restocking needed for Peanut Butter 140g due to weekend promotional flyer.',
    displayCondition: 'Good - Minor Adjustments Needed',
    isClean: true,
    displayNotes: 'Fronted shelves and dusted top shelf display.',
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 72,
    outOfStockCount: 1,
    expiringSoonCount: 1,
    hasOrderRequest: true,
    status: 'Completed',
  },
  {
    id: 'CP-REP-1002',
    merchandiserName: 'Farhan Zaidi',
    merchandiserId: 'CP-M02',
    store: STORES_DATA.find(s => s.name === 'Al Khail' && s.chain === 'Emarat') || STORES_DATA[25],
    timestamp: '2026-10-21T11:45:00+04:00',
    formattedDate: '2026-10-21',
    formattedTime: '11:45 AM',
    managerName: 'Fahad Al Nuaimi',
    managerPhone: '+971 52 719 3302',
    inventory: [
      {
        productId: CASA_PONS_PRODUCTS[0].id,
        productName: CASA_PONS_PRODUCTS[0].name,
        isAvailable: true,
        stockOnHand: 25,
        expiryDate: '2027-05-20',
      },
      {
        productId: CASA_PONS_PRODUCTS[1].id,
        productName: CASA_PONS_PRODUCTS[1].name,
        isAvailable: true,
        stockOnHand: 16,
        expiryDate: '2027-03-15',
      },
      {
        productId: CASA_PONS_PRODUCTS[2].id,
        productName: CASA_PONS_PRODUCTS[2].name,
        isAvailable: true,
        stockOnHand: 42,
        expiryDate: '2027-04-10',
      },
      {
        productId: CASA_PONS_PRODUCTS[3].id,
        productName: CASA_PONS_PRODUCTS[3].name,
        isAvailable: true,
        stockOnHand: 14,
        expiryDate: '2027-01-30',
      },
      {
        productId: CASA_PONS_PRODUCTS[4].id,
        productName: CASA_PONS_PRODUCTS[4].name,
        isAvailable: true,
        stockOnHand: 28,
        expiryDate: '2027-02-15',
      },
    ],
    orderNeeded: 'No',
    orderItems: [],
    orderNotes: 'All shelves fully stocked; backup carton available in backroom.',
    displayCondition: 'Excellent - Pristine & Front Faced',
    isClean: true,
    displayNotes: 'Pristine arrangement near payment counter.',
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 125,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    hasOrderRequest: false,
    status: 'Completed',
  },
  {
    id: 'CP-REP-1003',
    merchandiserName: 'Zubair Qasim',
    merchandiserId: 'CP-M07',
    store: STORES_DATA.find(s => s.name === 'Juwaiza (Sharjah)' && s.chain === 'Emarat') || STORES_DATA[35],
    timestamp: '2026-10-21T13:20:00+04:00',
    formattedDate: '2026-10-21',
    formattedTime: '01:20 PM',
    managerName: 'Omar Al Qasimi',
    managerPhone: '+971 55 632 9941',
    inventory: [
      {
        productId: CASA_PONS_PRODUCTS[0].id,
        productName: CASA_PONS_PRODUCTS[0].name,
        isAvailable: false,
        stockOnHand: 0,
        expiryDate: '2026-10-30',
      },
      {
        productId: CASA_PONS_PRODUCTS[1].id,
        productName: CASA_PONS_PRODUCTS[1].name,
        isAvailable: false,
        stockOnHand: 0,
        expiryDate: '2026-10-31',
      },
      {
        productId: CASA_PONS_PRODUCTS[2].id,
        productName: CASA_PONS_PRODUCTS[2].name,
        isAvailable: true,
        stockOnHand: 11,
        expiryDate: '2027-01-15',
      },
      {
        productId: CASA_PONS_PRODUCTS[3].id,
        productName: CASA_PONS_PRODUCTS[3].name,
        isAvailable: true,
        stockOnHand: 5,
        expiryDate: '2026-11-20',
      },
      {
        productId: CASA_PONS_PRODUCTS[4].id,
        productName: CASA_PONS_PRODUCTS[4].name,
        isAvailable: true,
        stockOnHand: 7,
        expiryDate: '2027-01-10',
      },
    ],
    orderNeeded: 'Follow-up required',
    orderItems: [
      {
        productId: CASA_PONS_PRODUCTS[0].id,
        productName: CASA_PONS_PRODUCTS[0].name,
        requested: true,
        quantity: 18,
      },
      {
        productId: CASA_PONS_PRODUCTS[1].id,
        productName: CASA_PONS_PRODUCTS[1].name,
        requested: true,
        quantity: 20,
      },
    ],
    orderNotes: 'Store manager on shift requested quotation invoice before confirming 40-pack delivery.',
    displayCondition: 'Fair - Needs Restock / Re-facing',
    isClean: false,
    displayNotes: 'Shelf requires wiping due to spilled beverage adjacent to chocolate unit.',
    photos: [SAMPLE_STORE_PHOTOS[1]],
    totalStockOnHand: 23,
    outOfStockCount: 2,
    expiringSoonCount: 2,
    hasOrderRequest: true,
    status: 'Urgent Restock',
  },
  {
    id: 'CP-REP-1004',
    merchandiserName: 'Tariq Mansoor',
    merchandiserId: 'CP-M04',
    store: STORES_DATA.find(s => s.name === 'DIFC' && s.chain === 'Choithrams') || STORES_DATA[9],
    timestamp: '2026-10-21T15:40:00+04:00',
    formattedDate: '2026-10-21',
    formattedTime: '03:40 PM',
    managerName: 'Alexander Smith',
    managerPhone: '+971 50 914 5520',
    inventory: [
      {
        productId: CASA_PONS_PRODUCTS[0].id,
        productName: CASA_PONS_PRODUCTS[0].name,
        isAvailable: true,
        stockOnHand: 22,
        expiryDate: '2027-04-18',
      },
      {
        productId: CASA_PONS_PRODUCTS[1].id,
        productName: CASA_PONS_PRODUCTS[1].name,
        isAvailable: true,
        stockOnHand: 19,
        expiryDate: '2027-03-22',
      },
      {
        productId: CASA_PONS_PRODUCTS[2].id,
        productName: CASA_PONS_PRODUCTS[2].name,
        isAvailable: true,
        stockOnHand: 36,
        expiryDate: '2027-04-05',
      },
      {
        productId: CASA_PONS_PRODUCTS[3].id,
        productName: CASA_PONS_PRODUCTS[3].name,
        isAvailable: true,
        stockOnHand: 24,
        expiryDate: '2027-03-12',
      },
      {
        productId: CASA_PONS_PRODUCTS[4].id,
        productName: CASA_PONS_PRODUCTS[4].name,
        isAvailable: true,
        stockOnHand: 30,
        expiryDate: '2027-04-10',
      },
    ],
    orderNeeded: 'No',
    orderItems: [],
    orderNotes: 'Corporate customer traffic strong. Display fully primed.',
    displayCondition: 'Excellent - Pristine & Front Faced',
    isClean: true,
    displayNotes: 'Cleaned acrylic dividers and faced all 5 SKU lines.',
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 131,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    hasOrderRequest: false,
    status: 'Completed',
  },
  {
    id: 'CP-REP-1005',
    merchandiserName: 'Farhan Zaidi',
    merchandiserId: 'CP-M02',
    store: STORES_DATA.find(s => s.name === 'Al Quoz' && s.chain === 'Emarat') || STORES_DATA[28],
    timestamp: '2026-10-18T10:15:00+04:00',
    formattedDate: '2026-10-18',
    formattedTime: '10:15 AM',
    managerName: 'Rashid Bin Khalifa',
    managerPhone: '+971 56 388 1204',
    inventory: [
      { productId: CASA_PONS_PRODUCTS[0].id, productName: CASA_PONS_PRODUCTS[0].name, isAvailable: true, stockOnHand: 15, expiryDate: '2027-04-10' },
      { productId: CASA_PONS_PRODUCTS[1].id, productName: CASA_PONS_PRODUCTS[1].name, isAvailable: true, stockOnHand: 20, expiryDate: '2027-03-15' },
      { productId: CASA_PONS_PRODUCTS[2].id, productName: CASA_PONS_PRODUCTS[2].name, isAvailable: true, stockOnHand: 30, expiryDate: '2027-04-01' },
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, isAvailable: true, stockOnHand: 18, expiryDate: '2027-03-20' },
      { productId: CASA_PONS_PRODUCTS[4].id, productName: CASA_PONS_PRODUCTS[4].name, isAvailable: true, stockOnHand: 22, expiryDate: '2027-04-05' },
    ],
    orderNeeded: 'No',
    orderItems: [],
    displayCondition: 'Excellent - Pristine & Front Faced',
    isClean: true,
    displayNotes: 'High customer footfall during morning commute. Facing maintained.',
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 105,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    hasOrderRequest: false,
    status: 'Completed',
  },
  {
    id: 'CP-REP-1006',
    merchandiserName: 'Tariq Mansoor',
    merchandiserId: 'CP-M04',
    store: STORES_DATA.find(s => s.name === 'Safa Park' && s.chain === 'Choithrams') || STORES_DATA[3],
    timestamp: '2026-10-12T14:45:00+04:00',
    formattedDate: '2026-10-12',
    formattedTime: '02:45 PM',
    managerName: 'Kareem Mansour',
    managerPhone: '+971 50 119 7743',
    inventory: [
      { productId: CASA_PONS_PRODUCTS[0].id, productName: CASA_PONS_PRODUCTS[0].name, isAvailable: true, stockOnHand: 10, expiryDate: '2027-03-10' },
      { productId: CASA_PONS_PRODUCTS[1].id, productName: CASA_PONS_PRODUCTS[1].name, isAvailable: false, stockOnHand: 0, expiryDate: '2026-11-01' },
      { productId: CASA_PONS_PRODUCTS[2].id, productName: CASA_PONS_PRODUCTS[2].name, isAvailable: true, stockOnHand: 16, expiryDate: '2027-02-15' },
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, isAvailable: false, stockOnHand: 0, expiryDate: '2026-11-05' },
      { productId: CASA_PONS_PRODUCTS[4].id, productName: CASA_PONS_PRODUCTS[4].name, isAvailable: true, stockOnHand: 12, expiryDate: '2027-01-20' },
    ],
    orderNeeded: 'Yes',
    orderItems: [
      { productId: CASA_PONS_PRODUCTS[1].id, productName: CASA_PONS_PRODUCTS[1].name, requested: true, quantity: 24 },
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, requested: true, quantity: 24 },
    ],
    orderNotes: 'Two SKUs sold out over the weekend. Restock required.',
    displayCondition: 'Fair - Needs Restock / Re-facing',
    isClean: true,
    photos: [SAMPLE_STORE_PHOTOS[1]],
    totalStockOnHand: 38,
    outOfStockCount: 2,
    expiringSoonCount: 2,
    hasOrderRequest: true,
    status: 'Urgent Restock',
  },
  {
    id: 'CP-REP-0901',
    merchandiserName: 'Zubair Qasim',
    merchandiserId: 'CP-M07',
    store: STORES_DATA.find(s => s.name === 'Bay Square' && s.chain === 'Choithrams') || STORES_DATA[10],
    timestamp: '2026-09-28T16:20:00+04:00',
    formattedDate: '2026-09-28',
    formattedTime: '04:20 PM',
    managerName: 'Naveen Kumar',
    managerPhone: '+971 52 890 4411',
    inventory: [
      { productId: CASA_PONS_PRODUCTS[0].id, productName: CASA_PONS_PRODUCTS[0].name, isAvailable: true, stockOnHand: 22, expiryDate: '2027-05-15' },
      { productId: CASA_PONS_PRODUCTS[1].id, productName: CASA_PONS_PRODUCTS[1].name, isAvailable: true, stockOnHand: 19, expiryDate: '2027-04-10' },
      { productId: CASA_PONS_PRODUCTS[2].id, productName: CASA_PONS_PRODUCTS[2].name, isAvailable: true, stockOnHand: 35, expiryDate: '2027-04-20' },
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, isAvailable: true, stockOnHand: 18, expiryDate: '2027-03-30' },
      { productId: CASA_PONS_PRODUCTS[4].id, productName: CASA_PONS_PRODUCTS[4].name, isAvailable: true, stockOnHand: 25, expiryDate: '2027-04-12' },
    ],
    orderNeeded: 'No',
    orderItems: [],
    displayCondition: 'Excellent - Pristine & Front Faced',
    isClean: true,
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 119,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    hasOrderRequest: false,
    status: 'Completed',
  },
  {
    id: 'CP-REP-0902',
    merchandiserName: 'Karim Al Zaabi',
    merchandiserId: 'CP-M12',
    store: STORES_DATA.find(s => s.name === 'Karama' && s.chain === 'Emarat') || STORES_DATA[30],
    timestamp: '2026-09-22T11:30:00+04:00',
    formattedDate: '2026-09-22',
    formattedTime: '11:30 AM',
    managerName: 'Sunil Varma',
    managerPhone: '+971 55 304 8872',
    inventory: [
      { productId: CASA_PONS_PRODUCTS[0].id, productName: CASA_PONS_PRODUCTS[0].name, isAvailable: true, stockOnHand: 14, expiryDate: '2027-04-01' },
      { productId: CASA_PONS_PRODUCTS[1].id, productName: CASA_PONS_PRODUCTS[1].name, isAvailable: true, stockOnHand: 11, expiryDate: '2027-03-15' },
      { productId: CASA_PONS_PRODUCTS[2].id, productName: CASA_PONS_PRODUCTS[2].name, isAvailable: true, stockOnHand: 28, expiryDate: '2027-04-10' },
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, isAvailable: true, stockOnHand: 8, expiryDate: '2027-02-28' },
      { productId: CASA_PONS_PRODUCTS[4].id, productName: CASA_PONS_PRODUCTS[4].name, isAvailable: true, stockOnHand: 16, expiryDate: '2027-03-05' },
    ],
    orderNeeded: 'Follow-up required',
    orderItems: [
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, requested: true, quantity: 24 }
    ],
    orderNotes: 'Manager will place LPO early next month.',
    displayCondition: 'Good - Minor Adjustments Needed',
    isClean: true,
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 77,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    hasOrderRequest: true,
    status: 'Pending Review',
  },
  {
    id: 'CP-REP-0801',
    merchandiserName: 'Farhan Zaidi',
    merchandiserId: 'CP-M02',
    store: STORES_DATA.find(s => s.name === 'Garhoud' && s.chain === 'Emarat') || STORES_DATA[26],
    timestamp: '2026-08-29T15:10:00+04:00',
    formattedDate: '2026-08-29',
    formattedTime: '03:10 PM',
    managerName: 'Saeed Al Marri',
    managerPhone: '+971 50 673 2219',
    inventory: [
      { productId: CASA_PONS_PRODUCTS[0].id, productName: CASA_PONS_PRODUCTS[0].name, isAvailable: true, stockOnHand: 20, expiryDate: '2027-03-25' },
      { productId: CASA_PONS_PRODUCTS[1].id, productName: CASA_PONS_PRODUCTS[1].name, isAvailable: true, stockOnHand: 15, expiryDate: '2027-02-18' },
      { productId: CASA_PONS_PRODUCTS[2].id, productName: CASA_PONS_PRODUCTS[2].name, isAvailable: true, stockOnHand: 32, expiryDate: '2027-03-12' },
      { productId: CASA_PONS_PRODUCTS[3].id, productName: CASA_PONS_PRODUCTS[3].name, isAvailable: true, stockOnHand: 12, expiryDate: '2027-02-20' },
      { productId: CASA_PONS_PRODUCTS[4].id, productName: CASA_PONS_PRODUCTS[4].name, isAvailable: true, stockOnHand: 24, expiryDate: '2027-03-05' },
    ],
    orderNeeded: 'No',
    orderItems: [],
    displayCondition: 'Excellent - Pristine & Front Faced',
    isClean: true,
    photos: [SAMPLE_STORE_PHOTOS[0]],
    totalStockOnHand: 103,
    outOfStockCount: 0,
    expiringSoonCount: 0,
    hasOrderRequest: false,
    status: 'Completed',
  },
];
