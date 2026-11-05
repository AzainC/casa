import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useReports } from '../../context/ReportContext';
import type { ProductItem, StoreLocation, ChainType } from '../../types';
import { REGIONS } from '../../data/stores';
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
  ChevronUp
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    products,
    updateProduct,
    addProduct,
    resetProducts,
    stores,
    addStore,
    updateStore,
    deleteStore,
    resetStores,
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
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isNewProductModal, setIsNewProductModal] = useState(false);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormWeight, setProdFormWeight] = useState('');
  const [prodFormFlavor, setProdFormFlavor] = useState('');
  const [prodFormBarcode, setProdFormBarcode] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState('');
  const [prodFormDescription, setProdFormDescription] = useState('');
  const [prodFormImageUrl, setProdFormImageUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.flavorProfile.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      (p.weightCategory && p.weightCategory.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

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
      };
      updateProduct(updated);
      showToast(`Updated "${updated.name}". All reports and Excel exports now follow this name.`);
    }

    setEditingProduct(null);
    setIsNewProductModal(false);
  };

  // =========================================================================
  // 2. PLACES / STORES MANAGEMENT STATE
  // =========================================================================
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeChainFilter, setPlaceChainFilter] = useState<'All' | string>('All');
  const [placeRegionFilter, setPlaceRegionFilter] = useState<string>('All');
  const [isAddPlaceModal, setIsAddPlaceModal] = useState(false);
  const [deleteTargetPlace, setDeleteTargetPlace] = useState<StoreLocation | null>(null);

  // New Place Form State
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceChainChoice, setNewPlaceChainChoice] = useState<'Choithrams' | 'Emarat' | 'Other'>('Choithrams');
  const [newPlaceCustomChain, setNewPlaceCustomChain] = useState('');
  const [newPlaceRegion, setNewPlaceRegion] = useState('Dubai');

  // Edit Place State
  const [editingPlace, setEditingPlace] = useState<StoreLocation | null>(null);
  const [editPlaceName, setEditPlaceName] = useState('');
  const [editPlaceChainChoice, setEditPlaceChainChoice] = useState<'Choithrams' | 'Emarat' | 'Other'>('Choithrams');
  const [editPlaceCustomChain, setEditPlaceCustomChain] = useState('');
  const [editPlaceRegion, setEditPlaceRegion] = useState('Dubai');

  // Extract all unique chains present in current stores
  const uniqueChains = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s) => {
      if (s.chain) set.add(s.chain);
    });
    return Array.from(set);
  }, [stores]);

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
    setNewPlaceChainChoice('Choithrams');
    setNewPlaceCustomChain('');
    setNewPlaceRegion('Dubai');
    setIsAddPlaceModal(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const finalChain =
      newPlaceChainChoice === 'Other'
        ? (newPlaceCustomChain.trim() || 'Retail Partner')
        : newPlaceChainChoice;

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
    if (store.chain === 'Choithrams' || store.chain === 'Emarat') {
      setEditPlaceChainChoice(store.chain);
      setEditPlaceCustomChain('');
    } else {
      setEditPlaceChainChoice('Other');
      setEditPlaceCustomChain(store.chain);
    }
    setEditPlaceRegion(store.region || 'Dubai');
  };

  const handleSaveEditPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace || !editPlaceName.trim()) return;

    const finalChain =
      editPlaceChainChoice === 'Other'
        ? (editPlaceCustomChain.trim() || 'Retail Partner')
        : editPlaceChainChoice;

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

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New SKU</span>
              </button>

              <button
                onClick={resetProducts}
                title="Reset catalog to official 5 Casa Pons items"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-600 text-xs font-medium border border-black/[0.04] transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
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
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs font-bold text-stone-900">
                          {prod.suggestedRetailPrice}
                        </span>
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
                  <button
                    onClick={() => handleOpenEditProduct(prod)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-medium transition active:scale-95 border border-black/[0.04]"
                  >
                    <Edit3 className="w-3 h-3 text-stone-500" />
                    <span>Edit SKU &amp; Photo</span>
                  </button>
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
          {/* Header Bar & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/[0.06] shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-stone-900" />
                <span>Store Locations Directory</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[10px] font-mono font-semibold">
                  Realtime Sync Active
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Add or delete stores. Changes reflect instantly on all merchandisers' devices and manager dashboards.
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
                title="Reset all store locations to the official 113 UAE stations"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-600 text-xs font-medium border border-black/[0.04] transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Reset 113 Stores</span>
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
                {uniqueChains.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setPlaceChainFilter(chain)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${placeChainFilter === chain
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900'
                      }`}
                  >
                    {chain} ({stores.filter((s) => s.chain === chain).length})
                  </button>
                ))}
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
            {filteredPlaces.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-2xl p-3.5 border border-black/[0.06] shadow-2xs flex flex-col justify-between hover:border-black/[0.12] transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${store.chain === 'Choithrams'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
                        : store.chain === 'Emarat'
                          ? 'bg-amber-50 text-amber-800 border-amber-200/70'
                          : 'bg-stone-100 text-stone-800 border-stone-200/70'
                        }`}
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
            ))}
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
                  Retail Chain *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPlaceChainChoice('Choithrams')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${newPlaceChainChoice === 'Choithrams'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Choithrams</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPlaceChainChoice('Emarat')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${newPlaceChainChoice === 'Emarat'
                      ? 'bg-amber-800 text-white border-amber-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Emarat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPlaceChainChoice('Other')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${newPlaceChainChoice === 'Other'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Other...</span>
                  </button>
                </div>

                {newPlaceChainChoice === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      value={newPlaceCustomChain}
                      onChange={(e) => setNewPlaceCustomChain(e.target.value)}
                      placeholder="Enter custom chain name (e.g. Carrefour, Spinneys, Lulu)..."
                      className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                    />
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
                  Retail Chain *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPlaceChainChoice('Choithrams')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${editPlaceChainChoice === 'Choithrams'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Choithrams</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPlaceChainChoice('Emarat')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${editPlaceChainChoice === 'Emarat'
                      ? 'bg-amber-800 text-white border-amber-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Emarat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditPlaceChainChoice('Other')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${editPlaceChainChoice === 'Other'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Other...</span>
                  </button>
                </div>

                {editPlaceChainChoice === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      value={editPlaceCustomChain}
                      onChange={(e) => setEditPlaceCustomChain(e.target.value)}
                      placeholder="Enter custom chain name..."
                      className="w-full px-3 py-2 bg-stone-50 border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 text-xs"
                    />
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

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-2xs transition active:scale-95"
                >
                  Save &amp; Sync Across Devices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
