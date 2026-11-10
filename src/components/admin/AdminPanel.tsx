import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useReports } from '../../context/ReportContext';
import type { ProductItem, StoreLocation, ChainType } from '../../types';
import { REGIONS } from '../../data/stores';
import { isProductAvailableForChain } from '../../data/products';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  ORDER_NOTIFICATION_EMAIL,
  generateOrderEmailHtml,
  generateMailtoUrl,
  generateGmailWebUrl,
  sendOrderNotificationEmail,
  getOrderNotificationEmail,
  saveOrderNotificationEmail
} from '../../services/emailService';
import {
  Plus,
  Search,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Barcode,
  Package,
  CheckCircle2,
  X,
  Edit3,
  MapPin,
  Building2,
  Fuel,
  Trash2,
  Mail,
  Send,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Store,
  ShoppingCart,
  Tag,
  Palette,
  Layers
} from 'lucide-react';
import {
  AVAILABLE_CHAIN_COLORS,
  getChainStyle,
  renderChainIcon,
  DEFAULT_CHAINS,
  type ChainColorOption
} from '../../utils/chainStyles';

export const AdminPanel: React.FC = () => {
  const {
    products,
    updateProduct,
    addProduct,
    addProducts,
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
    setActiveView,
    sheetsWebhookUrl,
    updateSheetsWebhookUrl,
    reports
  } = useReports();

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'products' | 'places' | 'email'>('products');

  // Notification Toast
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // =========================================================================
  // 1. PRODUCTS MANAGEMENT STATE
  // =========================================================================
  const [productSearch, setProductSearch] = useState('');
  const [prodChainFilter, setProdChainFilter] = useState<'All' | string>('All');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNewProductModal, setIsNewProductModal] = useState(false);
  const [isBulkProductModal, setIsBulkProductModal] = useState(false);
  const [bulkTargetChain, setBulkTargetChain] = useState<string>('Grandiose');
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkDefaultWeight, setBulkDefaultWeight] = useState('Pouch 120g');
  const [bulkDefaultPrice, setBulkDefaultPrice] = useState('AED 24.00');
  const [bulkDefaultFlavor, setBulkDefaultFlavor] = useState('Artisan Confectionery');
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<ProductItem | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormWeight, setProdFormWeight] = useState('');
  const [prodFormFlavor, setProdFormFlavor] = useState('');
  const [prodFormBarcode, setProdFormBarcode] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState('');
  const [prodFormDescription, setProdFormDescription] = useState('');
  const [prodFormImageUrl, setProdFormImageUrl] = useState('');
  const [prodFormChains, setProdFormChains] = useState<string[]>(['Choithrams', 'Emarat']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      if (prodChainFilter !== 'All') {
        if (!isProductAvailableForChain(p, prodChainFilter)) return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.flavorProfile.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        (p.weightCategory && p.weightCategory.toLowerCase().includes(q))
      );
    });
  }, [products, productSearch, prodChainFilter]);

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setIsNewProductModal(false);
    setProdFormName(prod.name);
    setProdFormWeight(prod.weightCategory || '');
    setProdFormFlavor(prod.flavorProfile || '');
    setProdFormBarcode(prod.barcode || '');
    setProdFormPrice(prod.suggestedRetailPrice || '');
    setProdFormDescription(prod.description || '');
    setProdFormImageUrl(prod.imageUrl || '');
    setProdFormChains(prod.chains && prod.chains.length > 0 ? prod.chains : ['Choithrams', 'Emarat']);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsNewProductModal(true);
    setProdFormName('');
    setProdFormWeight('Pouch 120g');
    setProdFormFlavor('Artisan Confectionery');
    setProdFormBarcode('62911' + Math.floor(10000000 + Math.random() * 90000000));
    setProdFormPrice('AED 18.00');
    setProdFormDescription('Premium Casa Pons artisan confectionery.');
    setProdFormImageUrl('');
    setProdFormChains(prodChainFilter !== 'All' ? [prodChainFilter] : ['Choithrams', 'Emarat']);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, {
        maxDimension: 600,
        quality: 0.75,
      });
      setProdFormImageUrl(compressed);
    } catch (err) {
      console.error('Failed to compress product image:', err);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) return;

    const assignedChains = prodFormChains.length > 0 ? prodFormChains : ['Choithrams', 'Emarat'];

    if (isNewProductModal) {
      const newSku: ProductItem = {
        id: `prod-${Date.now().toString().slice(-6)}`,
        name: prodFormName.trim(),
        weightCategory: prodFormWeight.trim(),
        flavorProfile: prodFormFlavor.trim(),
        barcode: prodFormBarcode.trim(),
        suggestedRetailPrice: prodFormPrice.trim(),
        description: prodFormDescription.trim(),
        imageUrl: prodFormImageUrl || 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=300&q=80',
        chains: assignedChains,
      };
      addProduct(newSku);
      showToast(`Added new product: ${newSku.name}`);
    } else if (editingProduct) {
      const updated: ProductItem = {
        ...editingProduct,
        name: prodFormName.trim(),
        weightCategory: prodFormWeight.trim(),
        flavorProfile: prodFormFlavor.trim(),
        barcode: prodFormBarcode.trim(),
        suggestedRetailPrice: prodFormPrice.trim(),
        description: prodFormDescription.trim(),
        imageUrl: prodFormImageUrl || editingProduct.imageUrl,
        chains: assignedChains,
      };
      updateProduct(updated);
      showToast(`Updated "${updated.name}". Assortment settings saved.`);
    }

    setEditingProduct(null);
    setIsNewProductModal(false);
  };

  const handleSaveAndAddAnother = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) return;

    const assignedChains = prodFormChains.length > 0 ? prodFormChains : (prodChainFilter !== 'All' ? [prodChainFilter] : ['Grandiose']);
    const newSku: ProductItem = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      name: prodFormName.trim(),
      weightCategory: prodFormWeight.trim() || 'Pouch 120g',
      flavorProfile: prodFormFlavor.trim() || 'Artisan Confectionery',
      barcode: prodFormBarcode.trim() || ('62911' + Math.floor(10000000 + Math.random() * 90000000)),
      suggestedRetailPrice: prodFormPrice.trim() || 'AED 24.00',
      description: prodFormDescription.trim() || 'Premium Casa Pons artisan confectionery.',
      imageUrl: prodFormImageUrl || 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=300&q=80',
      chains: assignedChains,
    };
    addProduct(newSku);
    showToast(`Added "${newSku.name}". Ready for next SKU!`);

    // Reset input fields for the next SKU while preserving selected chains
    setProdFormName('');
    setProdFormBarcode('62911' + Math.floor(10000000 + Math.random() * 90000000));
    setProdFormImageUrl('');
  };

  // Bulk Product Parser & Template Helpers
  const parsedBulkProducts = useMemo(() => {
    if (!bulkInputText.trim()) return [];
    const lines = bulkInputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));

    const imagePlaceholders = [
      'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=300&q=80',
      'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=300&q=80',
      'https://images.unsplash.com/photo-1575372587186-500b3e6c0c29?w=300&q=80',
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&q=80',
      'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=300&q=80',
    ];

    return lines.map((line, idx) => {
      const parts = line.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
      const name = parts[0] || `Artisan SKU ${idx + 1}`;
      let weight = bulkDefaultWeight.trim() || 'Pouch 120g';
      let price = bulkDefaultPrice.trim() || 'AED 24.00';
      let flavor = bulkDefaultFlavor.trim() || 'Artisan Confectionery';

      if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (/\d+\s*(g|kg|oz|ml|pcs|pack|box|pouch)/i.test(part)) {
            weight = part;
          } else if (/aed|\$|€|£/i.test(part) || /^\d+(\.\d+)?$/.test(part)) {
            price = part.toUpperCase().includes('AED') ? part : `AED ${part}`;
          } else {
            flavor = part;
          }
        }
      }

      const assignedChains = bulkTargetChain === 'All'
        ? chains.map((c) => c.name)
        : [bulkTargetChain];

      const barcode = '62911' + String(Date.now() + idx).slice(-8);

      return {
        id: `prod-${Date.now().toString().slice(-6)}-${idx + 1}`,
        name,
        weightCategory: weight,
        flavorProfile: flavor,
        barcode,
        suggestedRetailPrice: price,
        description: `Premium Casa Pons ${name} exclusive for ${bulkTargetChain === 'All' ? 'all supermarket chains' : bulkTargetChain}.`,
        imageUrl: imagePlaceholders[idx % imagePlaceholders.length],
        chains: assignedChains,
      } as ProductItem;
    });
  }, [bulkInputText, bulkTargetChain, bulkDefaultWeight, bulkDefaultPrice, bulkDefaultFlavor, chains]);

  const loadGrandioseSampleTemplate = () => {
    setBulkTargetChain('Grandiose');
    setBulkInputText([
      'Pistachio Truffle Balls, 140g, AED 28.00',
      'Dark Chocolate Hazelnut Crunch, 160g, AED 32.00',
      'Salted Caramel Almonds, 120g, AED 22.00',
      'Ruby Berry Artisan Pralines, 110g, AED 29.50',
      'Cashew Caramel Clusters, 150g, AED 24.00',
      'White Chocolate Matcha Crisps, 130g, AED 26.00',
      'Espresso Dark Truffle Bites, 100g, AED 21.00',
      'Golden Toffee Pecan Crunch, 140g, AED 27.50'
    ].join('\n'));
  };

  const handleImportBulkProducts = () => {
    if (parsedBulkProducts.length === 0) return;
    addProducts(parsedBulkProducts);
    showToast(`Successfully added ${parsedBulkProducts.length} new SKUs for ${bulkTargetChain === 'All' ? 'all chains' : bulkTargetChain}!`);
    setIsBulkProductModal(false);
    setBulkInputText('');
  };

  // =========================================================================
  // 2. PLACES / STORES MANAGEMENT STATE
  // =========================================================================
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeChainFilter, setPlaceChainFilter] = useState<'All' | string>('All');
  const [placeRegionFilter, setPlaceRegionFilter] = useState<string>('All');
  const [isAddPlaceModal, setIsAddPlaceModal] = useState(false);
  const [deleteTargetPlace, setDeleteTargetPlace] = useState<StoreLocation | null>(null);

  // Supermarket Category & Color Management State
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);
  const [isAddCategoryModal, setIsAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('purple');
  const [newCategoryIcon, setNewCategoryIcon] = useState<'store' | 'building' | 'fuel' | 'cart' | 'tag'>('store');

  // New Place Form State
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceChainChoice, setNewPlaceChainChoice] = useState<string>('Choithrams');
  const [newPlaceCustomChain, setNewPlaceCustomChain] = useState('');
  const [newPlaceCustomColor, setNewPlaceCustomColor] = useState('purple');
  const [newPlaceRegion, setNewPlaceRegion] = useState('Dubai');

  // Edit Place State
  const [editingPlace, setEditingPlace] = useState<StoreLocation | null>(null);
  const [editPlaceName, setEditPlaceName] = useState('');
  const [editPlaceChainChoice, setEditPlaceChainChoice] = useState<string>('Choithrams');
  const [editPlaceCustomChain, setEditPlaceCustomChain] = useState('');
  const [editPlaceCustomColor, setEditPlaceCustomColor] = useState('purple');
  const [editPlaceRegion, setEditPlaceRegion] = useState('Dubai');

  // Extract all unique chains present in current stores and configured chains
  const uniqueChains = useMemo(() => {
    const set = new Set<string>();
    chains.forEach((c) => set.add(c.name));
    stores.forEach((s) => {
      if (s.chain) set.add(s.chain);
    });
    return Array.from(set);
  }, [stores, chains]);

  const filteredPlaces = useMemo(() => {
    const q = placeSearch.toLowerCase().trim();
    return stores.filter((s) => {
      if (placeChainFilter !== 'All' && s.chain !== placeChainFilter) return false;
      if (placeRegionFilter !== 'All' && s.region !== placeRegionFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.chain.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.fullLabel.toLowerCase().includes(q)
      );
    });
  }, [stores, placeSearch, placeChainFilter, placeRegionFilter]);

  const handleOpenAddPlace = () => {
    setNewPlaceName('');
    setNewPlaceChainChoice(chains[0]?.name || 'Choithrams');
    setNewPlaceCustomChain('');
    setNewPlaceCustomColor('purple');
    setNewPlaceRegion('Dubai');
    setIsAddPlaceModal(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    let finalChain = newPlaceChainChoice;
    if (newPlaceChainChoice === 'Other') {
      finalChain = newPlaceCustomChain.trim() || 'Retail Partner';
      // Auto-register new chain if not yet in chains list
      if (!chains.some((c) => c.name.toLowerCase() === finalChain.toLowerCase())) {
        addChain({
          name: finalChain,
          color: newPlaceCustomColor,
          icon: 'store',
        });
      }
    }

    const created = addStore({
      name: newPlaceName.trim(),
      chain: finalChain as any,
      region: newPlaceRegion,
    });

    showToast(`Added branch: ${created.fullLabel} (Synced live)`);
    setIsAddPlaceModal(false);
  };

  const handleOpenEditPlace = (store: StoreLocation) => {
    setEditingPlace(store);
    setEditPlaceName(store.name);
    const matched = chains.find((c) => c.name.toLowerCase() === (store.chain || '').toLowerCase());
    if (matched) {
      setEditPlaceChainChoice(matched.name);
      setEditPlaceCustomChain('');
    } else {
      setEditPlaceChainChoice('Other');
      setEditPlaceCustomChain(store.chain || '');
    }
    setEditPlaceCustomColor('purple');
    setEditPlaceRegion(store.region || 'Dubai');
  };

  const handleSaveEditPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace || !editPlaceName.trim()) return;

    let finalChain = editPlaceChainChoice;
    if (editPlaceChainChoice === 'Other') {
      finalChain = editPlaceCustomChain.trim() || 'Retail Partner';
      if (!chains.some((c) => c.name.toLowerCase() === finalChain.toLowerCase())) {
        addChain({
          name: finalChain,
          color: editPlaceCustomColor,
          icon: 'store',
        });
      }
    }

    updateStore({
      ...editingPlace,
      name: editPlaceName.trim(),
      chain: finalChain as any,
      region: editPlaceRegion,
    });

    showToast(`Updated "${finalChain} - ${editPlaceName.trim()}". Synced in real time.`);
    setEditingPlace(null);
  };

  const handleConfirmDeletePlace = () => {
    if (!deleteTargetPlace) return;
    deleteStore(deleteTargetPlace.id);
    showToast(`Deleted branch: ${deleteTargetPlace.fullLabel} (Synced live)`);
    setDeleteTargetPlace(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const created = addChain({
      name: trimmed,
      color: newCategoryColor,
      icon: newCategoryIcon,
    });

    showToast(`Created category "${created.name}" with ${newCategoryColor} badge!`);
    setNewCategoryName('');
    setNewCategoryColor('purple');
    setIsAddCategoryModal(false);
  };

  // =========================================================================
  // 3. EMAIL & ORDER NOTIFICATIONS STATE & ACTIONS
  // =========================================================================
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [emailPreviewMode, setEmailPreviewMode] = useState<'rendered' | 'source'>('rendered');

  // Sample report for testing & previewing email
  const sampleOrderReport = useMemo(() => {
    const store = stores[0] || {
      id: 'choithrams-1',
      name: 'The Greens',
      chain: 'Choithrams',
      region: 'Dubai',
      fullLabel: 'Choithrams - The Greens',
    };

    return {
      id: 'CP-REP-TEST',
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toISOString().split('T')[0],
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      merchandiserName: 'Casapons Merchandiser',
      merchandiserId: 'CP-M12',
      store,
      managerName: 'Store In-Charge',
      managerPhone: '+971 50 123 4567',
      inventory: products.map((p, idx) => ({
        productId: p.id,
        productName: p.name,
        isAvailable: idx !== 0,
        stockOnHand: idx === 0 ? 0 : 12,
        expiryDate: '2027-04-15',
      })),
      orderNeeded: 'Yes' as const,
      orderItems: [
        {
          productId: products[0]?.id || 'p1',
          productName: products[0]?.name || 'Baby Pecan Caramel',
          requested: true,
          quantity: 24,
        },
        {
          productId: products[1]?.id || 'p2',
          productName: products[1]?.name || 'Choco Chips Milk Chocolate 140g',
          requested: true,
          quantity: 12,
        },
      ],
      orderNotes: 'Urgent restocking needed ahead of busy weekend promotions. Quotation invoice requested.',
      displayCondition: 'Excellent - Pristine & Front Faced' as const,
      isClean: true,
      displayNotes: 'Primary endcap fully faced and cleaned.',
      photos: [],
      totalStockOnHand: 24,
      outOfStockCount: 1,
      expiringSoonCount: 0,
      hasOrderRequest: true,
      status: 'Urgent Restock' as const,
    };
  }, [stores, products]);

  const sampleEmailHtml = useMemo(() => {
    return generateOrderEmailHtml(sampleOrderReport);
  }, [sampleOrderReport]);

  const [targetEmailInput, setTargetEmailInput] = useState(getOrderNotificationEmail());
  const [webhookInputVal, setWebhookInputVal] = useState(sheetsWebhookUrl || '');
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  useEffect(() => {
    setWebhookInputVal(sheetsWebhookUrl || '');
  }, [sheetsWebhookUrl]);

  const handleSaveTargetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmailInput.trim()) return;
    saveOrderNotificationEmail(targetEmailInput.trim());
    showToast(`Updated destination email to ${targetEmailInput.trim()}`);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    updateSheetsWebhookUrl(webhookInputVal.trim());
    showToast(
      webhookInputVal.trim()
        ? 'Google Apps Script Webhook saved successfully!'
        : 'Webhook cleared. Using direct 1-tap dispatch.'
    );
  };

  const handleCopyAppsScript = () => {
    const activeTarget = targetEmailInput.trim() || getOrderNotificationEmail();
    const scriptCode = `function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
    }
    // Automated background email dispatch
    var to = payload.orderEmailTo || "${activeTarget}";
    var subject = payload.orderEmailSubject || ("Order Request: " + (payload.storeName || "Store"));
    var htmlBody = payload.orderEmailHtml || "";
    var plainBody = payload.orderEmailText || "";
    if (payload.sendOrderEmail || payload.action === 'order_email_dispatch') {
      MailApp.sendEmail({ to: to, subject: subject, htmlBody: htmlBody, body: plainBody });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(scriptCode);
    setIsCopiedScript(true);
    showToast('Copied Google Apps Script to clipboard!');
    setTimeout(() => setIsCopiedScript(false), 3000);
  };

  const handleSendTestOrderEmail = async () => {
    setIsSendingTestEmail(true);
    const activeTarget = targetEmailInput.trim() || getOrderNotificationEmail();
    try {
      if (sheetsWebhookUrl && sheetsWebhookUrl.trim()) {
        const res = await sendOrderNotificationEmail(sampleOrderReport, sheetsWebhookUrl, activeTarget);
        showToast(`Dispatched background order email to ${activeTarget}!`);
      } else {
        // Open Gmail Web compose with sample report prefilled
        window.open(generateGmailWebUrl(sampleOrderReport, activeTarget), '_blank');
        showToast(`Opened Gmail compose for ${activeTarget}`);
      }
    } catch (e) {
      console.error(e);
      window.open(generateGmailWebUrl(sampleOrderReport, activeTarget), '_blank');
      showToast(`Opened Gmail compose for ${activeTarget}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header & Navigation Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => setActiveView('merchandiser')}
              className="inline-flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Log Visit</span>
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => setActiveView('manager')}
              className="inline-flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-900 transition"
            >
              <span>Manager Hub</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-stone-900" />
              Operations Admin Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-white font-medium">
              /admin
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage product specifications, store locations, and real-time replenishment notifications.
          </p>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-2xl border border-black/[0.04] self-start sm:self-auto">
          <button
            onClick={() => setAdminTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${adminTab === 'products'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
              }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200/80 text-stone-700">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('places')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${adminTab === 'places'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
              }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Places / Stores</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200/80 text-stone-700">
              {stores.length}
            </span>
          </button>

          <button
            onClick={() => setAdminTab('email')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${adminTab === 'email'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-500 hover:text-stone-900'
              }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Orders</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRODUCTS CATALOG                                                   */}
      {/* ========================================================================= */}
      {adminTab === 'products' && (
        <div className="space-y-4">
          {/* Action Ribbon & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search product name, flavor, barcode..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto flex-wrap gap-y-2">
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SKU</span>
              </button>

              <button
                onClick={() => {
                  setIsBulkProductModal(true);
                  setBulkTargetChain(prodChainFilter !== 'All' ? prodChainFilter : 'Grandiose');
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 text-xs font-semibold shadow-2xs transition active:scale-95"
                title="Bulk add multiple products at once"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Bulk Add SKUs</span>
              </button>

              <button
                onClick={resetProducts}
                title="Reset catalog to default assortments"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-600 text-xs font-medium border border-black/[0.04] transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Supermarket Chain Assortment Filter Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setProdChainFilter('All')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                prodChainFilter === 'All'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-black/[0.06] hover:bg-stone-50'
              }`}
            >
              <span>All Assortments</span>
              <span className="ml-1 text-[10px] opacity-75">({products.length})</span>
            </button>

            {chains.map((chain) => {
              const chainStyle = getChainStyle(chain.name, chains);
              const isSelected = prodChainFilter === chain.name;
              const count = products.filter((p) => isProductAvailableForChain(p, chain.name)).length;

              return (
                <button
                  key={chain.id}
                  type="button"
                  onClick={() => setProdChainFilter(chain.name)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                    isSelected
                      ? `${chainStyle.solidClass} shadow-2xs`
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-black/[0.06]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${chainStyle.previewBg}`} />
                  <span>{chain.name}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-4 border border-black/[0.06] shadow-2xs flex flex-col justify-between hover:border-black/[0.12] transition"
              >
                <div>
                  <div className="flex items-start space-x-3.5 pb-3 border-b border-black/[0.04]">
                    {/* Artwork Preview */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-black/[0.06] shrink-0 shadow-2xs relative flex items-center justify-center">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-full bg-stone-900/80 text-white text-[9px] font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                          {prod.weightCategory || 'Confectionery'}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 flex items-center">
                          <Barcode className="w-3 h-3 mr-0.5" />
                          {prod.barcode}
                        </span>
                      </div>
                      <h3 className="font-semibold text-stone-900 text-sm leading-snug mt-0.5 truncate">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{prod.flavorProfile}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span className="text-xs font-bold text-stone-900 mr-1.5">
                          {prod.suggestedRetailPrice}
                        </span>
                        {(!prod.chains || prod.chains.length === 0 || prod.chains.includes('All')) ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded border bg-stone-100 text-stone-700 border-stone-200">
                            All Chains
                          </span>
                        ) : (
                          prod.chains.map((cName) => {
                            const cStyle = getChainStyle(cName, chains);
                            return (
                              <span
                                key={cName}
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${cStyle.pillClass}`}
                              >
                                {cName}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 mt-3 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-black/[0.04] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-400">
                    ID: {prod.id}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setDeleteTargetProduct(prod)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition"
                      title="Delete SKU"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition active:scale-95 border border-black/[0.04]"
                    >
                      <Edit3 className="w-3 h-3 text-stone-500" />
                      <span>Edit SKU &amp; Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-black/[0.06] text-stone-400 text-xs">
              No products matched your search.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PLACES / STORES MANAGEMENT (ADD & DELETE IN REALTIME)               */}
      {/* ========================================================================= */}
      {adminTab === 'places' && (
        <div className="space-y-4">
          {/* Supermarket Categories & Custom Badge Colors */}
          <div className="bg-white p-4 rounded-2xl border border-black/[0.06] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-black/[0.04]">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-stone-900" />
                  <span>Supermarket Categories &amp; Badge Colors</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Customize badge colors and icons for each chain. Changes sync instantly to Store Selector, Audit Feed, and Inspection Modals.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setNewCategoryName('');
                    setNewCategoryColor('purple');
                    setNewCategoryIcon('store');
                    setIsAddCategoryModal(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {chains.map((chain) => {
                const chainStyle = getChainStyle(chain.name, chains);
                const branchCount = stores.filter(
                  (s) => s.chain?.toLowerCase() === chain.name.toLowerCase()
                ).length;
                const isColorPickerOpen = activeColorPickerId === chain.id;

                return (
                  <div
                    key={chain.id}
                    className="p-3 rounded-xl border border-black/[0.06] bg-stone-50/70 hover:bg-white hover:border-black/15 transition relative space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-2xs ${chainStyle.solidClass}`}
                        >
                          {renderChainIcon(chainStyle.iconType, 'w-3.5 h-3.5')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${chainStyle.pillClass}`}
                            >
                              {chain.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {branchCount} {branchCount === 1 ? 'branch' : 'branches'}
                          </p>
                        </div>
                      </div>

                      {/* Delete category button for non-default chains */}
                      {chain.id !== 'choithrams' && chain.id !== 'emarat' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete supermarket category "${chain.name}"?`)) {
                              deleteChain(chain.id);
                              showToast(`Deleted category "${chain.name}"`);
                            }
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Color Palette Selector Trigger */}
                    <div className="relative">
                      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-black/[0.06] text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${chainStyle.previewBg} ring-1 ring-black/10 shrink-0`} />
                          <span className="text-[11px] font-medium text-stone-700">
                            {AVAILABLE_CHAIN_COLORS.find((c) => c.id === chain.color)?.name || chain.color}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveColorPickerId(isColorPickerOpen ? null : chain.id)
                          }
                          className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center space-x-1"
                        >
                          <span>Change Color</span>
                          <ChevronDown className={`w-3 h-3 transition ${isColorPickerOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Color Palette Dropdown Popover */}
                      {isColorPickerOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white rounded-xl shadow-lg border border-black/[0.1] z-30 grid grid-cols-2 gap-1.5 animate-in fade-in zoom-in-95">
                          {AVAILABLE_CHAIN_COLORS.map((colorOpt) => {
                            const isCurrent = chain.color === colorOpt.id;
                            return (
                              <button
                                key={colorOpt.id}
                                type="button"
                                onClick={() => {
                                  updateChain({ ...chain, color: colorOpt.id });
                                  setActiveColorPickerId(null);
                                  showToast(`Set ${chain.name} badge color to ${colorOpt.name}`);
                                }}
                                className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-lg text-[11px] text-left transition ${
                                  isCurrent
                                    ? 'bg-stone-100 font-bold text-stone-900 border border-stone-300'
                                    : 'hover:bg-stone-50 text-stone-600'
                                }`}
                              >
                                <span className={`w-3 h-3 rounded-full ${colorOpt.previewBg} shrink-0`} />
                                <span className="truncate flex-1">{colorOpt.name}</span>
                                {isCurrent && <Check className="w-3 h-3 text-stone-900 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Header Bar & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/[0.06] shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-stone-900" />
                <span>Store Locations Directory ({stores.length} Outlets)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-mono font-semibold">
                  Realtime Sync Active
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Add or delete stores across all supermarket chains. Changes reflect instantly on all merchandisers' devices.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleOpenAddPlace}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Place / Branch</span>
              </button>

              <button
                onClick={resetStores}
                title="Reset store locations to default UAE network"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-600 text-xs font-medium border border-black/[0.04] transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Reset Stores Directory</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder="Search branch name, chain, emirate..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-black/[0.04] text-xs">
                <button
                  onClick={() => setPlaceChainFilter('All')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${placeChainFilter === 'All'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                    }`}
                >
                  All ({stores.length})
                </button>
                {uniqueChains.map((chain) => {
                  const cStyle = getChainStyle(chain, chains);
                  const isCurrent = placeChainFilter === chain;
                  return (
                    <button
                      key={chain}
                      onClick={() => setPlaceChainFilter(chain)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${isCurrent
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cStyle.previewBg}`} />
                      <span>{chain}</span>
                      <span className="text-[10px] text-stone-400">({stores.filter((s) => s.chain === chain).length})</span>
                    </button>
                  );
                })}
              </div>

              {/* Region Filter */}
              <select
                value={placeRegionFilter}
                onChange={(e) => setPlaceRegionFilter(e.target.value)}
                className="text-xs bg-white border border-black/[0.08] rounded-xl px-2.5 py-1.5 text-stone-700 focus:outline-none focus:border-stone-900/40 shadow-2xs"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === 'All' ? 'All Emirates / Regions' : r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Places Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlaces.map((store) => {
              const storeStyle = getChainStyle(store.chain, chains);
              return (
              <div
                key={store.id}
                className="bg-white rounded-2xl p-3.5 border border-black/[0.06] shadow-2xs flex flex-col justify-between hover:border-black/[0.12] transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${storeStyle.pillClass}`}
                    >
                      {store.chain}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {store.region}
                    </span>
                  </div>

                  <h3 className="font-semibold text-stone-900 text-sm truncate">
                    {store.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {store.fullLabel}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-black/[0.04] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-400 truncate max-w-[100px]">
                    {store.id}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditPlace(store)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-stone-700 hover:bg-stone-100 text-xs font-medium transition"
                      title="Edit this store branch name and details"
                    >
                      <Edit3 className="w-3 h-3 text-stone-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeleteTargetPlace(store)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium transition"
                      title="Delete this store branch"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-black/[0.06] text-stone-400 text-xs">
              No store branches match your filter criteria.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMAIL & ORDER NOTIFICATIONS                                        */}
      {/* ========================================================================= */}
      {adminTab === 'email' && (
        <div className="space-y-4">
          {/* Email Recipient & Dispatch Banner */}
          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base font-bold text-stone-900">
                    Order Notification Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                    Configured Target
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Whenever store replenishment is requested, an Apple-styled order summary is sent to your inbox.
                </p>
              </div>

              {/* Direct 1-Click Dispatch Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={generateGmailWebUrl(sampleOrderReport, targetEmailInput.trim() || getOrderNotificationEmail())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>Send via Gmail</span>
                </a>

                <a
                  href={generateMailtoUrl(sampleOrderReport, targetEmailInput.trim() || getOrderNotificationEmail())}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 transition active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                  <span>Apple Mail</span>
                </a>

                <button
                  onClick={handleSendTestOrderEmail}
                  disabled={isSendingTestEmail}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200 transition active:scale-95 disabled:opacity-50"
                  title="Test background webhook or trigger compose"
                >
                  <Send className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isSendingTestEmail ? 'Sending...' : 'Test Dispatch'}</span>
                </button>
              </div>
            </div>

            {/* Configured Destination Email Address Display & Edit */}
            <form onSubmit={handleSaveTargetEmail} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/60 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-stone-700 font-semibold">Destination Email Address:</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  Delivery: Instant 1-Tap &amp; Background Webhook
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={targetEmailInput}
                  onChange={(e) => setTargetEmailInput(e.target.value)}
                  placeholder="e.g. orders@company.com"
                  className="flex-1 px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900/40"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-2xs transition active:scale-95 shrink-0"
                >
                  Save Email
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                You can change this email anytime. All replenishment dispatch links and webhooks will automatically route to this address.
              </p>
            </form>
          </div>

          {/* Automated Zero-Touch Background Delivery (Google Webhook) */}
          <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Automated Background Delivery (Optional)
                </h3>
              </div>
              {sheetsWebhookUrl ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Webhook Connected
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  Direct 1-Tap Active
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {sheetsWebhookUrl
                ? `Active Webhook: When merchandisers submit an order, it automatically streams to your Google Sheet and sends this Apple-styled email in the background.`
                : `By default, merchandisers send replenishment emails with 1 tap via Gmail or Apple Mail after submission. To enable silent background delivery without clicking, paste a free Google Apps Script Webhook URL below.`}
            </p>

            {/* Webhook URL Input Form */}
            <form onSubmit={handleSaveWebhook} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="url"
                value={webhookInputVal}
                onChange={(e) => setWebhookInputVal(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2 bg-stone-50 border border-black/[0.08] rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-stone-900/40"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition active:scale-95 shrink-0"
              >
                Save Webhook
              </button>
              {sheetsWebhookUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setWebhookInputVal('');
                    updateSheetsWebhookUrl('');
                    showToast('Cleared Webhook URL');
                  }}
                  className="px-3 py-2 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 rounded-xl text-xs font-medium transition shrink-0"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Expandable 1-Minute Setup Guide */}
            <div className="pt-1 border-t border-black/[0.04]">
              <button
                type="button"
                onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center space-x-1 transition"
              >
                <span>{showWebhookGuide ? 'Hide 60-Second Setup Guide' : 'How to get a free Webhook in 60 seconds'}</span>
                {showWebhookGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showWebhookGuide && (
                <div className="mt-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 text-xs space-y-2.5 animate-in fade-in">
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-600 text-[11px] leading-relaxed">
                    <li>Create a new spreadsheet at <strong className="text-stone-800">sheets.new</strong>.</li>
                    <li>Click <strong className="text-stone-800">Extensions &gt; Apps Script</strong>.</li>
                    <li>Replace the code with the snippet below and click <strong className="text-stone-800">Deploy &gt; New deployment</strong>.</li>
                    <li>Select <strong className="text-stone-800">Web app</strong>, set <em>Who has access</em> to <strong className="text-stone-800">Anyone</strong>, and click Deploy.</li>
                    <li>Copy the resulting Web App URL and paste it into the input above.</li>
                  </ol>

                  <div className="relative mt-2">
                    <pre className="p-3 bg-stone-900 text-stone-200 font-mono text-[10px] rounded-lg overflow-x-auto max-h-40">
                      {`function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  if (payload.action === 'ping') return ContentService.createTextOutput('ok');
  // Dispatches email directly to destination address
  MailApp.sendEmail({
    to: payload.orderEmailTo || "${targetEmailInput.trim() || getOrderNotificationEmail()}",
    subject: payload.orderEmailSubject || ("Order Request: " + (payload.storeName || "Store")),
    htmlBody: payload.orderEmailHtml,
    body: payload.orderEmailText || ""
  });
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
}`}
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopyAppsScript}
                      className="absolute top-2 right-2 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-white text-[10px] font-medium flex items-center space-x-1 transition shadow-xs"
                    >
                      {isCopiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopiedScript ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aesthetic Email Live Preview */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] bg-stone-50">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-900">
                  Email Preview
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {sampleOrderReport.store.name}
                </span>
              </div>

              <div className="flex items-center space-x-1 bg-stone-200/60 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setEmailPreviewMode('rendered')}
                  className={`px-2.5 py-1 rounded-md transition ${emailPreviewMode === 'rendered'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                    }`}
                >
                  Preview
                </button>

              </div>
            </div>

            {emailPreviewMode === 'rendered' ? (
              <div className="p-4 sm:p-6 bg-[#F5F5F7] flex justify-center overflow-x-auto">
                <div
                  className="w-full max-w-[540px] shadow-sm rounded-2xl overflow-hidden bg-white border border-[#E5E5EA]"
                  dangerouslySetInnerHTML={{ __html: sampleEmailHtml }}
                />
              </div>
            ) : (
              <div className="p-4 bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto max-h-96">
                <pre>{sampleEmailHtml}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW PLACE / STORE                                              */}
      {/* ========================================================================= */}
      {isAddPlaceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] space-y-4 my-auto animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Store Network Directory
                </span>
                <h3 className="text-base font-bold text-stone-900 leading-tight">
                  Add New Store Location
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPlaceModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Store / Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="e.g. Al Wasl Road, Marina Gate, Silicon Central..."
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Retail Chain / Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {chains.map((c) => {
                    const cStyle = getChainStyle(c.name, chains);
                    const isSelected = newPlaceChainChoice === c.name;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewPlaceChainChoice(c.name)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                          isSelected
                            ? `${cStyle.solidClass} shadow-2xs ring-2 ring-stone-900 ring-offset-1`
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {renderChainIcon(cStyle.iconType, 'w-3.5 h-3.5')}
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setNewPlaceChainChoice('Other')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      newPlaceChainChoice === 'Other'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Chain</span>
                  </button>
                </div>

                {newPlaceChainChoice === 'Other' && (
                  <div className="mt-2.5 p-3 bg-stone-50 rounded-xl border border-black/[0.06] space-y-2">
                    <input
                      type="text"
                      required
                      value={newPlaceCustomChain}
                      onChange={(e) => setNewPlaceCustomChain(e.target.value)}
                      placeholder="Enter custom chain name (e.g. Carrefour, Spinneys, Lulu)..."
                      className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                    />
                    <div>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">Badge Color for this new chain:</span>
                      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {AVAILABLE_CHAIN_COLORS.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setNewPlaceCustomColor(col.id)}
                            className={`w-6 h-6 rounded-full ${col.previewBg} shrink-0 transition ${newPlaceCustomColor === col.id ? 'ring-2 ring-offset-1 ring-stone-900 scale-110' : 'opacity-80 hover:opacity-100'}`}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Region / Emirate *
                </label>
                <select
                  value={newPlaceRegion}
                  onChange={(e) => setNewPlaceRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>

              {/* Preview Card */}
              {newPlaceName.trim() && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">
                    Display Preview
                  </span>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {newPlaceChainChoice === 'Other'
                      ? (newPlaceCustomChain.trim() || 'Retail Partner')
                      : newPlaceChainChoice}{' '}
                    - {newPlaceName.trim()}
                  </p>
                  <p className="text-[11px] text-stone-500">Region: {newPlaceRegion}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlaceModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs transition active:scale-95"
                >
                  Save &amp; Sync Realtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PLACE / STORE                                                 */}
      {/* ========================================================================= */}
      {editingPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] space-y-4 my-auto animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  Store Network Directory
                </span>
                <h3 className="text-base font-bold text-stone-900 leading-tight">
                  Edit Store Location
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlace(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlace} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Store / Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={editPlaceName}
                  onChange={(e) => setEditPlaceName(e.target.value)}
                  placeholder="e.g. Al Wasl Road, The Greens..."
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Retail Chain / Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {chains.map((c) => {
                    const cStyle = getChainStyle(c.name, chains);
                    const isSelected = editPlaceChainChoice === c.name;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setEditPlaceChainChoice(c.name)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                          isSelected
                            ? `${cStyle.solidClass} shadow-2xs ring-2 ring-stone-900 ring-offset-1`
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {renderChainIcon(cStyle.iconType, 'w-3.5 h-3.5')}
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setEditPlaceChainChoice('Other')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      editPlaceChainChoice === 'Other'
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Chain</span>
                  </button>
                </div>

                {editPlaceChainChoice === 'Other' && (
                  <div className="mt-2.5 p-3 bg-stone-50 rounded-xl border border-black/[0.06] space-y-2">
                    <input
                      type="text"
                      required
                      value={editPlaceCustomChain}
                      onChange={(e) => setEditPlaceCustomChain(e.target.value)}
                      placeholder="Enter custom chain name..."
                      className="w-full px-3 py-2 bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                    />
                    <div>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">Badge Color:</span>
                      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {AVAILABLE_CHAIN_COLORS.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setEditPlaceCustomColor(col.id)}
                            className={`w-6 h-6 rounded-full ${col.previewBg} shrink-0 transition ${editPlaceCustomColor === col.id ? 'ring-2 ring-offset-1 ring-stone-900 scale-110' : 'opacity-80 hover:opacity-100'}`}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Region / Emirate *
                </label>
                <select
                  value={editPlaceRegion}
                  onChange={(e) => setEditPlaceRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>

              {/* Display Preview */}
              {editPlaceName.trim() && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold">
                    Updated Label Preview
                  </span>
                  <p className="font-semibold text-stone-900 mt-0.5">
                    {editPlaceChainChoice === 'Other'
                      ? (editPlaceCustomChain.trim() || 'Retail Partner')
                      : editPlaceChainChoice}{' '}
                    - {editPlaceName.trim()}
                  </p>
                  <p className="text-[11px] text-stone-500">Region: {editPlaceRegion} • ID: {editingPlace.id}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingPlace(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs transition active:scale-95"
                >
                  Save Changes &amp; Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE PLACE CONFIRMATION                                          */}
      {/* ========================================================================= */}
      {deleteTargetPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] space-y-4 my-auto animate-in zoom-in-95 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-stone-900">
                Delete Store Location?
              </h3>
              <p className="text-xs text-stone-600 mt-1.5">
                Are you sure you want to delete <strong>{deleteTargetPlace.fullLabel}</strong>?
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                This station will be removed from all store selectors and manager coverage statistics in real time.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => setDeleteTargetPlace(null)}
                className="w-1/2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePlace}
                className="w-1/2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SUPERMARKET CATEGORY                                           */}
      {/* ========================================================================= */}
      {isAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-black/[0.08] relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Add Supermarket Category</h3>
                  <p className="text-[11px] text-stone-500">Create a brand category with custom badge styling</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCategoryModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Grandiose, Carrefour, Lulu, Spinneys, Viva..."
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Badge Pill Color *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-black/[0.06]">
                  {AVAILABLE_CHAIN_COLORS.map((c) => {
                    const isSelected = newCategoryColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewCategoryColor(c.id)}
                        className={`flex items-center space-x-1.5 p-1.5 rounded-lg border text-[11px] transition ${
                          isSelected
                            ? 'bg-white border-stone-800 shadow-2xs font-bold text-stone-900'
                            : 'border-transparent hover:bg-white/60 text-stone-600'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${c.previewBg} shrink-0`} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Brand Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'store', label: 'Store', icon: Store },
                    { id: 'cart', label: 'Cart', icon: ShoppingCart },
                    { id: 'building', label: 'Building', icon: Building2 },
                    { id: 'fuel', label: 'Station', icon: Fuel },
                    { id: 'tag', label: 'Tag', icon: Tag },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = newCategoryIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewCategoryIcon(item.id as any)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                            : 'bg-stone-50 text-stone-600 border-black/[0.06] hover:bg-stone-100'
                        }`}
                      >
                        <IconComp className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview */}
              {newCategoryName.trim() && (
                <div className="p-3 bg-stone-50 rounded-xl border border-black/[0.06] text-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-1">
                    Live Badge Preview
                  </span>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const previewStyle = getChainStyle(newCategoryName, [
                        { id: 'preview', name: newCategoryName, color: newCategoryColor, icon: newCategoryIcon }
                      ]);
                      return (
                        <>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${previewStyle.solidClass}`}>
                            {renderChainIcon(newCategoryIcon, 'w-3.5 h-3.5')}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${previewStyle.pillClass}`}>
                            {newCategoryName.trim()}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs transition active:scale-95"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCT INFO & PHOTO MANAGEMENT                               */}
      {/* ========================================================================= */}
      {(editingProduct || isNewProductModal) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-black/[0.08] space-y-4 my-auto animate-in zoom-in-95 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {isNewProductModal ? 'Catalog Master' : 'Edit SKU'}
                </span>
                <h3 className="text-base font-bold text-stone-900 leading-tight">
                  {isNewProductModal ? 'Add New Product SKU' : editingProduct?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsNewProductModal(false);
                }}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Product / SKU Name *
                </label>
                <input
                  type="text"
                  required
                  value={prodFormName}
                  onChange={(e) => setProdFormName(e.target.value)}
                  placeholder="e.g. Baby Pecan Caramel, Choco Chips..."
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Weight / Packaging Spec
                  </label>
                  <input
                    type="text"
                    value={prodFormWeight}
                    onChange={(e) => setProdFormWeight(e.target.value)}
                    placeholder="e.g. 140g, 40g, Pouch..."
                    className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Suggested Price
                  </label>
                  <input
                    type="text"
                    value={prodFormPrice}
                    onChange={(e) => setProdFormPrice(e.target.value)}
                    placeholder="e.g. AED 24.50"
                    className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Flavor Profile
                  </label>
                  <input
                    type="text"
                    value={prodFormFlavor}
                    onChange={(e) => setProdFormFlavor(e.target.value)}
                    placeholder="e.g. Pecan, Peanut Butter..."
                    className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Barcode (EAN-13)
                  </label>
                  <input
                    type="text"
                    value={prodFormBarcode}
                    onChange={(e) => setProdFormBarcode(e.target.value)}
                    placeholder="e.g. 6291100234012"
                    className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Packaging Photo Section */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Packaging Artwork Photo
                </label>
                <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-2xl border border-black/[0.06]">
                  <div className="w-16 h-16 rounded-xl bg-white border border-black/[0.08] overflow-hidden shrink-0 flex items-center justify-center">
                    {prodFormImageUrl ? (
                      <img
                        src={prodFormImageUrl}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-300" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 transition shadow-2xs text-xs"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Photo</span>
                      </button>

                      {prodFormImageUrl && (
                        <button
                          type="button"
                          onClick={() => setProdFormImageUrl('')}
                          className="px-2 py-1.5 rounded-xl text-stone-500 hover:text-rose-600 transition text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Supports JPG, PNG, WEBP. Optimized automatically for real-time cloud sync.
                    </p>
                  </div>
                </div>
              </div>

              {/* Authorized Supermarket Chains */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Supermarket Chain Assortment *
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Select which supermarket chains carry this SKU. When a merchandiser selects a branch, only its assigned products will appear.
                </p>
                <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-stone-50 rounded-xl border border-black/[0.06]">
                  {chains.map((c) => {
                    const cStyle = getChainStyle(c.name, chains);
                    const isChecked = prodFormChains.includes(c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setProdFormChains(prodFormChains.filter((name) => name !== c.name));
                          } else {
                            setProdFormChains([...prodFormChains, c.name]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition ${
                          isChecked
                            ? `${cStyle.solidClass} shadow-2xs ring-2 ring-stone-900 ring-offset-1`
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cStyle.previewBg}`} />
                        <span>{c.name}</span>
                        {isChecked && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      if (prodFormChains.length === chains.length) {
                        setProdFormChains([]);
                      } else {
                        setProdFormChains(chains.map((c) => c.name));
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-900 bg-stone-200/60 hover:bg-stone-200 transition"
                  >
                    {prodFormChains.length === chains.length ? 'Deselect All' : 'Select All Chains'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description / Merchandiser Facing Notes
                </label>
                <textarea
                  rows={2}
                  value={prodFormDescription}
                  onChange={(e) => setProdFormDescription(e.target.value)}
                  placeholder="Key product attributes for merchandisers..."
                  className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 flex-wrap gap-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition text-xs"
                >
                  Cancel
                </button>
                {isNewProductModal && (
                  <button
                    type="button"
                    onClick={handleSaveAndAddAnother}
                    className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-semibold text-xs shadow-2xs transition active:scale-95 flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                    <span>Save &amp; Add Another</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs transition active:scale-95 text-xs"
                >
                  Save &amp; Sync Across Devices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BULK ADD SKUs MODAL                                                       */}
      {/* ========================================================================= */}
      {isBulkProductModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-black/[0.08] space-y-4 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Bulk Add Products &amp; SKUs</h3>
                  <p className="text-[11px] text-stone-500">
                    Add multiple products for Grandiose or any supermarket chain in seconds.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkProductModal(false)}
                className="w-7 h-7 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Chain Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-700">
                Target Supermarket Chain Assortment
              </label>
              <div className="flex flex-wrap gap-1.5">
                {chains.map((c) => {
                  const cStyle = getChainStyle(c.name, chains);
                  const isSelected = bulkTargetChain === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setBulkTargetChain(c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                        isSelected
                          ? `${cStyle.solidClass} shadow-2xs ring-2 ring-stone-900 ring-offset-1`
                          : 'bg-stone-50 text-stone-700 border border-black/[0.06] hover:bg-stone-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cStyle.previewBg}`} />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setBulkTargetChain('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    bulkTargetChain === 'All'
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border border-black/[0.06] hover:bg-stone-100'
                  }`}
                >
                  All Supermarket Chains
                </button>
              </div>
            </div>

            {/* Quick Prefill / Template action */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs text-purple-950 font-medium">
                  Need a fast gourmet confectionery lineup for Grandiose?
                </span>
              </div>
              <button
                type="button"
                onClick={loadGrandioseSampleTemplate}
                className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold transition shrink-0 active:scale-95 shadow-2xs"
              >
                Insert 8 Grandiose SKUs
              </button>
            </div>

            {/* Line-by-line input textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700">
                  Products List (One SKU per line)
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  Format: Name, Weight, Price
                </span>
              </div>
              <textarea
                rows={6}
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                placeholder="Pistachio Truffle Balls, 140g, AED 28.00&#10;Dark Chocolate Hazelnut Crunch, 160g, AED 32.00&#10;Salted Caramel Almonds, 120g, AED 22.00&#10;Ruby Berry Pralines&#10;Cashew Caramel Clusters, 150g"
                className="w-full px-3 py-2.5 bg-stone-50/80 border border-black/[0.08] rounded-2xl text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900/40 transition placeholder:text-stone-400 leading-relaxed"
              />
            </div>

            {/* Defaults for weight and price */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Default Weight / Pack
                </label>
                <input
                  type="text"
                  value={bulkDefaultWeight}
                  onChange={(e) => setBulkDefaultWeight(e.target.value)}
                  placeholder="Pouch 120g"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-black/[0.08] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-900/40"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Default Retail Price
                </label>
                <input
                  type="text"
                  value={bulkDefaultPrice}
                  onChange={(e) => setBulkDefaultPrice(e.target.value)}
                  placeholder="AED 24.00"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-black/[0.08] rounded-xl text-xs text-stone-900 focus:outline-none focus:border-stone-900/40"
                />
              </div>
            </div>

            {/* Parsed Live Preview */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-700">
                  Parsed SKUs ({parsedBulkProducts.length})
                </span>
                <span className="text-emerald-700 text-[11px] font-medium">
                  {parsedBulkProducts.length > 0
                    ? `Ready for ${bulkTargetChain === 'All' ? 'All Chains' : bulkTargetChain}`
                    : 'Awaiting items...'}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto border border-black/[0.06] rounded-xl p-2 bg-stone-50/50 space-y-1">
                {parsedBulkProducts.length === 0 ? (
                  <div className="text-center py-4 text-xs text-stone-400">
                    Type or paste product names above to preview.
                  </div>
                ) : (
                  parsedBulkProducts.map((p, i) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs bg-white p-1.5 px-2.5 rounded-lg border border-black/[0.04]"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 text-[10px] flex items-center justify-center font-bold font-mono shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-stone-900 truncate">{p.name}</span>
                        <span className="text-[11px] text-stone-500 font-mono">({p.weightCategory})</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-stone-800 shrink-0 ml-2">
                        {p.suggestedRetailPrice}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end space-x-2 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={() => setIsBulkProductModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportBulkProducts}
                disabled={parsedBulkProducts.length === 0}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-xs shadow-2xs transition active:scale-95 flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  Import {parsedBulkProducts.length} Products to {bulkTargetChain === 'All' ? 'All Chains' : bulkTargetChain}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete SKU Confirmation Modal */}
      {deleteTargetProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-black/[0.08] space-y-3">
            <h3 className="text-sm font-bold text-stone-900">Delete Product SKU?</h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to remove <strong>{deleteTargetProduct.name}</strong> from the catalog? This change will sync across all devices.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTargetProduct(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteTargetProduct.id);
                  showToast(`Deleted "${deleteTargetProduct.name}"`);
                  setDeleteTargetProduct(null);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition active:scale-95"
              >
                Delete SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
