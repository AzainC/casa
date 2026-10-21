import type { ProductItem } from '../types';

export const CASA_PONS_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-baby-pecan-caramel',
    name: 'Baby Pecan Caramel',
    weightCategory: 'Gourmet Bag 120g',
    flavorProfile: 'Caramel Glazed Roasted Pecans',
    barcode: '6291100234012',
    description: 'Crisp California baby pecans glazed in slow-cooked artisan butter caramel.',
    suggestedRetailPrice: 'AED 24.50',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgPecan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4A2611" />
            <stop offset="50%" stop-color="#84451D" />
            <stop offset="100%" stop-color="#C87D32" />
          </linearGradient>
          <linearGradient id="caramelGlaze" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FCD34D" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgPecan)"/>
        <!-- Pouch Shape -->
        <rect x="35" y="25" width="130" height="150" rx="14" fill="#2E180C" stroke="#E5A93C" stroke-width="2.5"/>
        <!-- Gold Top Seal -->
        <path d="M 35 38 L 165 38" stroke="#E5A93C" stroke-width="3" stroke-dasharray="4,2"/>
        <!-- Brand Crest -->
        <circle cx="100" cy="58" r="16" fill="#1C0D05" stroke="#E5A93C" stroke-width="1.5"/>
        <text x="100" y="62" font-family="serif" font-size="11" font-weight="bold" fill="#FDE68A" text-anchor="middle">CP</text>
        <!-- Product Label Badge -->
        <rect x="45" y="82" width="110" height="42" rx="6" fill="url(#caramelGlaze)"/>
        <text x="100" y="98" font-family="sans-serif" font-size="10" font-weight="900" fill="#451A03" text-anchor="middle" letter-spacing="0.5">BABY PECAN</text>
        <text x="100" y="112" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#78350F" text-anchor="middle">CARAMEL</text>
        <!-- Nut illustration -->
        <ellipse cx="100" cy="144" rx="18" ry="12" fill="#9A3412" transform="rotate(-15 100 144)"/>
        <ellipse cx="100" cy="144" rx="12" ry="7" fill="#C2410C" transform="rotate(-15 100 144)"/>
        <circle cx="94" cy="142" r="2.5" fill="#FDBA74"/>
        <circle cx="105" cy="145" r="2" fill="#FDBA74"/>
        <!-- Premium Tag -->
        <text x="100" y="166" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FDE68A" text-anchor="middle" letter-spacing="1">CASA PONS ARTISAN</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-choco-chips-milk-140g',
    name: 'Choco Chips Milk Chocolate 140g',
    weightCategory: 'Sharing Pouch 140g',
    flavorProfile: 'Smooth Alpine Milk Chocolate Chips',
    barcode: '6291100234029',
    description: 'Crispy golden bite-sized biscuits loaded with velvety milk chocolate chips.',
    suggestedRetailPrice: 'AED 18.00',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgMilk" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E3A8A" />
            <stop offset="60%" stop-color="#2563EB" />
            <stop offset="100%" stop-color="#3B82F6" />
          </linearGradient>
          <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#D97706" />
            <stop offset="50%" stop-color="#FBBF24" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgMilk)"/>
        <!-- Pouch Shape -->
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#0F172A" stroke="#FBBF24" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FBBF24" stroke-width="2.5" stroke-dasharray="4,2"/>
        <!-- Brand Crest -->
        <circle cx="100" cy="56" r="15" fill="#1E3A8A" stroke="#FBBF24" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">CP</text>
        <!-- Product Label Banner -->
        <rect x="42" y="78" width="116" height="42" rx="6" fill="#FFFFFF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#1E3A8A" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="105" font-family="sans-serif" font-size="8" font-weight="700" fill="#B45309" text-anchor="middle">MILK CHOCOLATE</text>
        <rect x="74" y="109" width="52" height="8" rx="4" fill="url(#goldRibbon)"/>
        <text x="100" y="115.5" font-family="sans-serif" font-size="6" font-weight="bold" fill="#451A03" text-anchor="middle">140g SHARING</text>
        <!-- Cookie Graphic -->
        <circle cx="100" cy="142" r="18" fill="#D97706"/>
        <circle cx="93" cy="138" r="3" fill="#451A03"/>
        <circle cx="106" cy="136" r="3" fill="#451A03"/>
        <circle cx="101" cy="147" r="3" fill="#451A03"/>
        <circle cx="89" cy="146" r="2" fill="#451A03"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#93C5FD" text-anchor="middle">PREMIUM BAKED</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-choco-chips-milk-40g',
    name: 'Choco Chips Milk Chocolate 40g',
    weightCategory: 'Grab & Go 40g',
    flavorProfile: 'Pocket Size Milk Chocolate Chips',
    barcode: '6291100234036',
    description: 'Single-serve impulse bag of crunchy chocolate chip cookies with milk chocolate morsels.',
    suggestedRetailPrice: 'AED 6.50',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgMilk40" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284C7" />
            <stop offset="60%" stop-color="#0EA5E9" />
            <stop offset="100%" stop-color="#38BDF8" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgMilk40)"/>
        <!-- Compact Pocket Pouch -->
        <rect x="42" y="28" width="116" height="144" rx="12" fill="#0C4A6E" stroke="#BAE6FD" stroke-width="2"/>
        <path d="M 42 40 L 158 40" stroke="#BAE6FD" stroke-width="2" stroke-dasharray="3,2"/>
        <!-- Mini Badge -->
        <circle cx="100" cy="58" r="14" fill="#0369A1" stroke="#BAE6FD" stroke-width="1.2"/>
        <text x="100" y="62" font-family="serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CP</text>
        <!-- Label Card -->
        <rect x="50" y="80" width="100" height="38" rx="6" fill="#F0F9FF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8" font-weight="900" fill="#0369A1" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7" font-weight="700" fill="#0284C7" text-anchor="middle">MILK CHOCO • 40g</text>
        <!-- Cookie Graphic -->
        <circle cx="100" cy="136" r="15" fill="#D97706"/>
        <circle cx="95" cy="132" r="2.5" fill="#451A03"/>
        <circle cx="105" cy="133" r="2" fill="#451A03"/>
        <circle cx="100" cy="141" r="2.5" fill="#451A03"/>
        <rect x="76" y="156" width="48" height="10" rx="5" fill="#F59E0B"/>
        <text x="100" y="163.5" font-family="sans-serif" font-size="6" font-weight="bold" fill="#78350F" text-anchor="middle">SNACK 40g</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-choco-chips-peanut-140g',
    name: 'Choco Chips with Peanut Butter 140g',
    weightCategory: 'Sharing Pouch 140g',
    flavorProfile: 'Roasted Peanut Butter & Cocoa Chips',
    barcode: '6291100234043',
    description: 'Savory sweet blend of creamy peanut butter cookies embedded with dark cocoa chips.',
    suggestedRetailPrice: 'AED 19.50',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgPB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="50%" stop-color="#B45309" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
          <linearGradient id="pbAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FEF3C7" />
            <stop offset="100%" stop-color="#FDE68A" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgPB)"/>
        <!-- Pouch Shape -->
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#3E1A04" stroke="#FDE68A" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FDE68A" stroke-width="2.5" stroke-dasharray="4,2"/>
        <!-- Brand Crest -->
        <circle cx="100" cy="56" r="15" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CP</text>
        <!-- Product Label -->
        <rect x="40" y="78" width="120" height="44" rx="6" fill="url(#pbAccent)"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8" font-weight="900" fill="#78350F" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="103" font-family="sans-serif" font-size="7.5" font-weight="800" fill="#92400E" text-anchor="middle">PEANUT BUTTER</text>
        <rect x="74" y="108" width="52" height="9" rx="4.5" fill="#92400E"/>
        <text x="100" y="115" font-family="sans-serif" font-size="6" font-weight="bold" fill="#FEF3C7" text-anchor="middle">140g SHARING</text>
        <!-- Peanut and Chips graphic -->
        <ellipse cx="94" cy="142" rx="10" ry="15" fill="#D97706" transform="rotate(30 94 142)"/>
        <ellipse cx="106" cy="142" rx="10" ry="15" fill="#D97706" transform="rotate(-30 106 142)"/>
        <circle cx="100" cy="142" r="4.5" fill="#451A03"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FDE68A" text-anchor="middle">RICH &amp; CRUNCHY</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-choco-chips-peanut-40g',
    name: 'Choco Chips with Peanut Butter 40g',
    weightCategory: 'Grab & Go 40g',
    flavorProfile: 'Pocket Size Peanut Butter & Choco Chips',
    barcode: '6291100234050',
    description: 'On-the-move pocket pack of savory peanut butter cookies loaded with rich chocolate drops.',
    suggestedRetailPrice: 'AED 7.00',
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgPB40" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#92400E" />
            <stop offset="50%" stop-color="#D97706" />
            <stop offset="100%" stop-color="#F59E0B" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgPB40)"/>
        <!-- Compact Pocket Pouch -->
        <rect x="42" y="28" width="116" height="144" rx="12" fill="#451A03" stroke="#FDE68A" stroke-width="2"/>
        <path d="M 42 40 L 158 40" stroke="#FDE68A" stroke-width="2" stroke-dasharray="3,2"/>
        <!-- Mini Badge -->
        <circle cx="100" cy="58" r="14" fill="#92400E" stroke="#FDE68A" stroke-width="1.2"/>
        <text x="100" y="62" font-family="serif" font-size="9" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CP</text>
        <!-- Label Card -->
        <rect x="48" y="80" width="104" height="40" rx="6" fill="#FEF3C7"/>
        <text x="100" y="93" font-family="sans-serif" font-size="7.5" font-weight="900" fill="#78350F" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="103" font-family="sans-serif" font-size="7" font-weight="800" fill="#B45309" text-anchor="middle">PEANUT BUTTER</text>
        <rect x="76" y="107" width="48" height="9" rx="4.5" fill="#78350F"/>
        <text x="100" y="113.8" font-family="sans-serif" font-size="6" font-weight="bold" fill="#FEF3C7" text-anchor="middle">SNACK 40g</text>
        <!-- Mini Peanut -->
        <ellipse cx="100" cy="140" rx="8" ry="12" fill="#D97706"/>
        <circle cx="100" cy="140" r="3.5" fill="#451A03"/>
        <text x="100" y="164" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">SINGLE SERVE</text>
      </svg>
    `)}`,
  },
];
