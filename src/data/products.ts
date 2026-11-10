import type { ProductItem } from '../types';

export const CASA_PONS_PRODUCTS: ProductItem[] = [
  // =========================================================================
  // CHOITHRAMS & EMARAT CORE LINEUP (5 SKUs)
  // =========================================================================
  {
    id: 'prod-baby-pecan-caramel',
    name: 'Baby Pecan Caramel',
    weightCategory: 'Gourmet Bag 120g',
    flavorProfile: 'Caramel Glazed Roasted Pecans',
    barcode: '6291100234012',
    description: 'Crisp California baby pecans glazed in slow-cooked artisan butter caramel.',
    suggestedRetailPrice: 'AED 24.50',
    chains: ['Choithrams', 'Emarat'],
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
        <rect x="35" y="25" width="130" height="150" rx="14" fill="#2E180C" stroke="#E5A93C" stroke-width="2.5"/>
        <path d="M 35 38 L 165 38" stroke="#E5A93C" stroke-width="3" stroke-dasharray="4,2"/>
        <circle cx="100" cy="58" r="16" fill="#1C0D05" stroke="#E5A93C" stroke-width="1.5"/>
        <text x="100" y="62" font-family="serif" font-size="11" font-weight="bold" fill="#FDE68A" text-anchor="middle">CP</text>
        <rect x="45" y="82" width="110" height="42" rx="6" fill="url(#caramelGlaze)"/>
        <text x="100" y="98" font-family="sans-serif" font-size="10" font-weight="900" fill="#451A03" text-anchor="middle" letter-spacing="0.5">BABY PECAN</text>
        <text x="100" y="112" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#78350F" text-anchor="middle">CARAMEL</text>
        <ellipse cx="100" cy="144" rx="18" ry="12" fill="#9A3412" transform="rotate(-15 100 144)"/>
        <ellipse cx="100" cy="144" rx="12" ry="7" fill="#C2410C" transform="rotate(-15 100 144)"/>
        <circle cx="94" cy="142" r="2.5" fill="#FDBA74"/>
        <circle cx="105" cy="145" r="2" fill="#FDBA74"/>
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
    chains: ['Choithrams', 'Emarat'],
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
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#0F172A" stroke="#FBBF24" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FBBF24" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#1E3A8A" stroke="#FBBF24" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">CP</text>
        <rect x="42" y="78" width="116" height="42" rx="6" fill="#FFFFFF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#1E3A8A" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="105" font-family="sans-serif" font-size="8" font-weight="700" fill="#B45309" text-anchor="middle">MILK CHOCOLATE</text>
        <rect x="74" y="109" width="52" height="8" rx="4" fill="url(#goldRibbon)"/>
        <text x="100" y="115.5" font-family="sans-serif" font-size="6" font-weight="bold" fill="#451A03" text-anchor="middle">140g SHARING</text>
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
    chains: ['Choithrams', 'Emarat'],
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
        <rect x="42" y="28" width="116" height="144" rx="12" fill="#0C4A6E" stroke="#BAE6FD" stroke-width="2"/>
        <path d="M 42 40 L 158 40" stroke="#BAE6FD" stroke-width="2" stroke-dasharray="3,2"/>
        <circle cx="100" cy="58" r="14" fill="#0369A1" stroke="#BAE6FD" stroke-width="1.2"/>
        <text x="100" y="62" font-family="serif" font-size="9" font-weight="bold" fill="#FFFFFF" text-anchor="middle">CP</text>
        <rect x="50" y="80" width="100" height="38" rx="6" fill="#F0F9FF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8" font-weight="900" fill="#0369A1" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7" font-weight="700" fill="#0284C7" text-anchor="middle">MILK CHOCO • 40g</text>
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
    chains: ['Choithrams', 'Emarat'],
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
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#3E1A04" stroke="#FDE68A" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FDE68A" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#78350F" stroke="#FDE68A" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CP</text>
        <rect x="40" y="78" width="120" height="44" rx="6" fill="url(#pbAccent)"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8" font-weight="900" fill="#78350F" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="103" font-family="sans-serif" font-size="7.5" font-weight="800" fill="#92400E" text-anchor="middle">PEANUT BUTTER</text>
        <rect x="74" y="108" width="52" height="9" rx="4.5" fill="#92400E"/>
        <text x="100" y="115" font-family="sans-serif" font-size="6" font-weight="bold" fill="#FEF3C7" text-anchor="middle">140g SHARING</text>
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
    chains: ['Choithrams', 'Emarat'],
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
        <rect x="42" y="28" width="116" height="144" rx="12" fill="#451A03" stroke="#FDE68A" stroke-width="2"/>
        <path d="M 42 40 L 158 40" stroke="#FDE68A" stroke-width="2" stroke-dasharray="3,2"/>
        <circle cx="100" cy="58" r="14" fill="#92400E" stroke="#FDE68A" stroke-width="1.2"/>
        <text x="100" y="62" font-family="serif" font-size="9" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CP</text>
        <rect x="48" y="80" width="104" height="40" rx="6" fill="#FEF3C7"/>
        <text x="100" y="93" font-family="sans-serif" font-size="7.5" font-weight="900" fill="#78350F" text-anchor="middle">CHOCO CHIPS</text>
        <text x="100" y="103" font-family="sans-serif" font-size="7" font-weight="800" fill="#B45309" text-anchor="middle">PEANUT BUTTER</text>
        <rect x="76" y="107" width="48" height="9" rx="4.5" fill="#78350F"/>
        <text x="100" y="113.8" font-family="sans-serif" font-size="6" font-weight="bold" fill="#FEF3C7" text-anchor="middle">SNACK 40g</text>
        <ellipse cx="100" cy="140" rx="8" ry="12" fill="#D97706"/>
        <circle cx="100" cy="140" r="3.5" fill="#451A03"/>
        <text x="100" y="164" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">SINGLE SERVE</text>
      </svg>
    `)}`,
  },

  // =========================================================================
  // GRANDIOSE EXCLUSIVE GOURMET LINEUP (Shown only for Grandiose)
  // =========================================================================
  {
    id: 'prod-grandiose-almonds-seasalt',
    name: 'Artisan Roasted Almonds Sea Salt 150g',
    weightCategory: 'Gourmet Pouch 150g',
    flavorProfile: 'Slow-Roasted California Almonds with Mediterranean Sea Salt',
    barcode: '6291100234104',
    description: 'Slow-roasted whole California nonpareil almonds tossed in mineral-rich crystal sea salt.',
    suggestedRetailPrice: 'AED 26.00',
    chains: ['Grandiose'],
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgGrAlmond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#581C87" />
            <stop offset="50%" stop-color="#7E22CE" />
            <stop offset="100%" stop-color="#9333EA" />
          </linearGradient>
          <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FBBF24" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgGrAlmond)"/>
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#2E1065" stroke="#FBBF24" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FBBF24" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#3B0764" stroke="#FBBF24" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">CP</text>
        <rect x="38" y="78" width="124" height="42" rx="6" fill="#FFFFFF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#581C87" text-anchor="middle">ROASTED ALMONDS</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#B45309" text-anchor="middle">SEA SALT • 150g</text>
        <rect x="70" y="109" width="60" height="7.5" rx="3.75" fill="url(#goldPlate)"/>
        <text x="100" y="115" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#451A03" text-anchor="middle">GRANDIOSE SELECT</text>
        <!-- Almond illustration -->
        <ellipse cx="100" cy="142" rx="16" ry="10" fill="#B45309" transform="rotate(-20 100 142)"/>
        <ellipse cx="100" cy="142" rx="12" ry="7" fill="#D97706" transform="rotate(-20 100 142)"/>
        <circle cx="94" cy="140" r="1.5" fill="#FEF3C7"/>
        <circle cx="104" cy="144" r="1.5" fill="#FEF3C7"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#E9D5FF" text-anchor="middle">GOURMET ARTISAN</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-grandiose-cashews-smoked',
    name: 'Wood-Fired Smoked Cashews 150g',
    weightCategory: 'Gourmet Pouch 150g',
    flavorProfile: 'Hickory Wood-Fired Smoked Jumbo Cashews',
    barcode: '6291100234111',
    description: 'Jumbo cashew kernels infused with natural hickory smoke and Mediterranean coarse spices.',
    suggestedRetailPrice: 'AED 28.50',
    chains: ['Grandiose'],
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgSmokeCashew" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4C1D95" />
            <stop offset="60%" stop-color="#6B21A8" />
            <stop offset="100%" stop-color="#9333EA" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgSmokeCashew)"/>
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#3B0764" stroke="#FDE68A" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FDE68A" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#2E1065" stroke="#FDE68A" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CP</text>
        <rect x="38" y="78" width="124" height="42" rx="6" fill="#FDF4FF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#4C1D95" text-anchor="middle">SMOKED CASHEWS</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#92400E" text-anchor="middle">WOOD-FIRED • 150g</text>
        <rect x="72" y="109" width="56" height="7.5" rx="3.75" fill="#F59E0B"/>
        <text x="100" y="115" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#451A03" text-anchor="middle">HICKORY SMOKED</text>
        <!-- Cashew Crescent shape -->
        <path d="M 90 144 C 88 132, 108 130, 114 138 C 118 144, 112 152, 102 148 C 96 145, 94 148, 90 144 Z" fill="#D97706"/>
        <path d="M 94 142 C 92 135, 105 134, 110 139 C 112 142, 108 147, 102 144 Z" fill="#F59E0B"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#F5D0FE" text-anchor="middle">PREMIUM SELECTION</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-grandiose-pistachio-crunch',
    name: 'Pistachio Praline Crunch 120g',
    weightCategory: 'Artisan Bag 120g',
    flavorProfile: 'Handcrafted Roasted Pistachio Caramel Brittle',
    barcode: '6291100234128',
    description: 'Vibrant green pistachio halves suspended in golden butter toffee brittle shards.',
    suggestedRetailPrice: 'AED 32.00',
    chains: ['Grandiose'],
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgPistachio" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064E3B" />
            <stop offset="50%" stop-color="#047857" />
            <stop offset="100%" stop-color="#10B981" />
          </linearGradient>
          <linearGradient id="pistachioPill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FEF08A" />
            <stop offset="100%" stop-color="#FBBF24" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgPistachio)"/>
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#022C22" stroke="#FEF08A" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FEF08A" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#064E3B" stroke="#FEF08A" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">CP</text>
        <rect x="38" y="78" width="124" height="42" rx="6" fill="#F0FDF4"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#064E3B" text-anchor="middle">PISTACHIO CRUNCH</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#047857" text-anchor="middle">PRALINE BRITTLE • 120g</text>
        <rect x="70" y="109" width="60" height="7.5" rx="3.75" fill="url(#pistachioPill)"/>
        <text x="100" y="115" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#451A03" text-anchor="middle">SICILIAN RECIPE</text>
        <!-- Pistachio Graphic -->
        <ellipse cx="94" cy="142" rx="9" ry="14" fill="#059669" transform="rotate(-15 94 142)"/>
        <ellipse cx="106" cy="142" rx="9" ry="14" fill="#10B981" transform="rotate(15 106 142)"/>
        <ellipse cx="100" cy="142" rx="6" ry="10" fill="#84CC16"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#A7F3D0" text-anchor="middle">GRANDIOSE GOURMET</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-grandiose-dark-hazelnut',
    name: 'Dark Chocolate Hazelnuts 140g',
    weightCategory: 'Sharing Pouch 140g',
    flavorProfile: 'Single-Origin 70% Dark Chocolate & Turkish Hazelnuts',
    barcode: '6291100234135',
    description: 'Crunchy roasted Black Sea hazelnuts enrobed in intense 70% bittersweet Belgian chocolate.',
    suggestedRetailPrice: 'AED 24.00',
    chains: ['Grandiose'],
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgDarkCocoa" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181B" />
            <stop offset="50%" stop-color="#27272A" />
            <stop offset="100%" stop-color="#3F3F46" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgDarkCocoa)"/>
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#09090B" stroke="#E4E4E7" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#E4E4E7" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#18181B" stroke="#E4E4E7" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FAFAFA" text-anchor="middle">CP</text>
        <rect x="38" y="78" width="124" height="42" rx="6" fill="#FFFFFF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#18181B" text-anchor="middle">DARK HAZELNUTS</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#71717A" text-anchor="middle">70% COCOA • 140g</text>
        <rect x="70" y="109" width="60" height="7.5" rx="3.75" fill="#D97706"/>
        <text x="100" y="115" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">SINGLE ORIGIN</text>
        <!-- Dark Chocolate Nut Graphic -->
        <circle cx="100" cy="142" r="16" fill="#18181B"/>
        <circle cx="100" cy="142" r="11" fill="#27272A"/>
        <circle cx="96" cy="138" r="3" fill="#D97706"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#D4D4D8" text-anchor="middle">70% BITTERSWEET</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-grandiose-trail-royal',
    name: 'Royal Artisan Trail Mix 160g',
    weightCategory: 'Superfood Mix 160g',
    flavorProfile: 'Raw Pecans, Macadamias, Cranberries & Golden Raisins',
    barcode: '6291100234142',
    description: 'Nutritious luxury mix of premium orchard nuts and dried sun-ripened organic berries.',
    suggestedRetailPrice: 'AED 29.50',
    chains: ['Grandiose'],
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgTrail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#701A75" />
            <stop offset="50%" stop-color="#86198F" />
            <stop offset="100%" stop-color="#A21CAF" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgTrail)"/>
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#4A044E" stroke="#FDE047" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FDE047" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#701A75" stroke="#FDE047" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF08A" text-anchor="middle">CP</text>
        <rect x="38" y="78" width="124" height="42" rx="6" fill="#FDF4FF"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#701A75" text-anchor="middle">ROYAL TRAIL MIX</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#A21CAF" text-anchor="middle">SUPERFOOD • 160g</text>
        <rect x="70" y="109" width="60" height="7.5" rx="3.75" fill="#FBBF24"/>
        <text x="100" y="115" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#451A03" text-anchor="middle">WHOLE BERRY MIX</text>
        <!-- Trail mix items -->
        <circle cx="92" cy="142" r="8" fill="#FBBF24"/>
        <circle cx="108" cy="142" r="7" fill="#E11D48"/>
        <ellipse cx="100" cy="146" rx="8" ry="5" fill="#78350F"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#F5D0FE" text-anchor="middle">GRANDIOSE EXCLUSIVE</text>
      </svg>
    `)}`,
  },
  {
    id: 'prod-grandiose-macadamia-toffee',
    name: 'Salted Toffee Macadamias 120g',
    weightCategory: 'Artisan Bag 120g',
    flavorProfile: 'Australian Macadamias Glazed in Salted Butter Toffee',
    barcode: '6291100234159',
    description: 'Rich buttery macadamia nuts caramelized in French sea salt toffee glaze.',
    suggestedRetailPrice: 'AED 34.00',
    chains: ['Grandiose'],
    imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <linearGradient id="bgMacadamia" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B45309" />
            <stop offset="50%" stop-color="#D97706" />
            <stop offset="100%" stop-color="#F59E0B" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bgMacadamia)"/>
        <rect x="34" y="24" width="132" height="152" rx="14" fill="#451A03" stroke="#FEF3C7" stroke-width="2"/>
        <path d="M 34 38 L 166 38" stroke="#FEF3C7" stroke-width="2.5" stroke-dasharray="4,2"/>
        <circle cx="100" cy="56" r="15" fill="#78350F" stroke="#FEF3C7" stroke-width="1.5"/>
        <text x="100" y="60" font-family="serif" font-size="10" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CP</text>
        <rect x="38" y="78" width="124" height="42" rx="6" fill="#FFFBEB"/>
        <text x="100" y="93" font-family="sans-serif" font-size="8" font-weight="900" fill="#78350F" text-anchor="middle">TOFFEE MACADAMIAS</text>
        <text x="100" y="104" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#B45309" text-anchor="middle">SALTED BUTTER • 120g</text>
        <rect x="68" y="109" width="64" height="7.5" rx="3.75" fill="#78350F"/>
        <text x="100" y="115" font-family="sans-serif" font-size="5.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">FRENCH SEA SALT</text>
        <!-- Macadamia round balls -->
        <circle cx="94" cy="142" r="11" fill="#FEF3C7"/>
        <circle cx="106" cy="142" r="10" fill="#FDE68A"/>
        <circle cx="94" cy="142" r="6" fill="#F59E0B"/>
        <text x="100" y="168" font-family="sans-serif" font-size="6.5" font-weight="bold" fill="#FEF3C7" text-anchor="middle">CRUNCHY ARTISAN</text>
      </svg>
    `)}`,
  },
];

/**
 * Checks if a product is authorized/assigned to a specific retail supermarket chain.
 * If no chain is passed, returns true.
 * Defaults legacy products without explicit `chains` to Choithrams and Emarat.
 */
export function isProductAvailableForChain(product: ProductItem, chainName?: string): boolean {
  if (!chainName) return true;
  const target = chainName.trim().toLowerCase();
  const chains = product.chains;
  if (!chains || chains.length === 0) {
    // Default legacy products without explicit chains to Choithrams and Emarat
    return target === 'choithrams' || target === 'emarat';
  }
  if (chains.some((c) => c.toLowerCase() === 'all')) {
    return true;
  }
  return chains.some((c) => c.toLowerCase() === target);
}

/**
 * Filter product lineup by supermarket chain.
 */
export function getProductsForChain(chainName: string | undefined, allProducts: ProductItem[]): ProductItem[] {
  if (!chainName) return allProducts;
  return allProducts.filter((p) => isProductAvailableForChain(p, chainName));
}
