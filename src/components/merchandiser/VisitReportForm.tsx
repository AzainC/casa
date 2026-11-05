import React, { useState, useEffect } from 'react';
import { useReports } from '../../context/ReportContext';
import type {
  StoreLocation,
  ProductInventoryState,
  OrderNeededStatus,
  OrderItemRequest,
  DisplayCondition,
  StorePhoto,
  VisitReport
} from '../../types';
import { CASA_PONS_PRODUCTS } from '../../data/products';
import { StoreSelector } from './StoreSelector';
import { StoreManagerInput } from './StoreManagerInput';
import { InventorySection } from './InventorySection';
import { OrderSection } from './OrderSection';
import { DisplaySection } from './DisplaySection';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  Store,
  Clock,
  Eye,
  UserCheck,
  FileSpreadsheet,
  Mail,
  ExternalLink
} from 'lucide-react';
import { generateMailtoUrl, generateGmailWebUrl } from '../../services/emailService';

export const VisitReportForm: React.FC = () => {
  const {
    addReport,
    activeMerchandiser,
    setActiveView,
    setSelectedReport,
    pendingStoreToLog,
    setPendingStoreToLog,
    getStoreManager,
    sheetsWebhookUrl,
    products,
  } = useReports();

  // Initial inventory with sensible defaults
  const createDefaultInventory = (): ProductInventoryState[] => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 6);
    const dateStr = futureDate.toISOString().split('T')[0];

    return products.map((prod) => ({
      productId: prod.id,
      productName: prod.name,
      isAvailable: true,
      availabilityStatus: 'Available',
      stockOnHand: 12,
      expiryDate: dateStr,
    }));
  };

  // State
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [isManagerAutoFilled, setIsManagerAutoFilled] = useState(false);

  const [inventory, setInventory] = useState<ProductInventoryState[]>(createDefaultInventory);
  const [orderNeeded, setOrderNeeded] = useState<OrderNeededStatus>('No');
  const [orderItems, setOrderItems] = useState<OrderItemRequest[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [displayCondition, setDisplayCondition] = useState<DisplayCondition>(
    'Excellent - Pristine & Front Faced'
  );
  const [isClean, setIsClean] = useState(true);
  const [photos, setPhotos] = useState<StorePhoto[]>([]);
  const [displayNotes, setDisplayNotes] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<VisitReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If navigated from Manager uncompleted list to log this branch:
  useEffect(() => {
    if (pendingStoreToLog) {
      setSelectedStore(pendingStoreToLog);
      setPendingStoreToLog(null);
    }
  }, [pendingStoreToLog, setPendingStoreToLog]);

  // Auto-fill manager name & phone if ever recorded before for this station
  useEffect(() => {
    if (selectedStore) {
      const existing = getStoreManager(selectedStore.id);
      if (existing && (existing.name || existing.phone)) {
        setManagerName(existing.name);
        setManagerPhone(existing.phone);
        setIsManagerAutoFilled(true);
      } else {
        setManagerName('');
        setManagerPhone('');
        setIsManagerAutoFilled(false);
      }
    } else {
      setManagerName('');
      setManagerPhone('');
      setIsManagerAutoFilled(false);
    }
  }, [selectedStore, getStoreManager]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!selectedStore) {
      setValidationError('Please select a store/station before submitting the visit report.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Photos (strictly real photos uploaded by merchandiser, optional)
    const finalPhotos = [...photos];

    setIsSubmitting(true);

    try {
      const newRep = addReport({
        merchandiserName: activeMerchandiser.name,
        merchandiserId: activeMerchandiser.id,
        store: selectedStore,
        managerName: managerName.trim(),
        managerPhone: managerPhone.trim(),
        inventory,
        orderNeeded,
        orderItems: orderNeeded === 'No' ? [] : orderItems,
        orderNotes,
        displayCondition,
        isClean,
        displayNotes,
        photos: finalPhotos,
      });

      // Confetti celebration
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0071E3', '#1D1D1F', '#10B981'],
      });

      setSubmittedReport(newRep);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setValidationError('An error occurred while saving the report. Please retry.');
      setIsSubmitting(false);
    }
  };

  const handleStartNextReport = () => {
    setSelectedStore(null);
    setManagerName('');
    setManagerPhone('');
    setIsManagerAutoFilled(false);
    setInventory(createDefaultInventory());
    setOrderNeeded('No');
    setOrderItems([]);
    setOrderNotes('');
    setDisplayCondition('Excellent - Pristine & Front Faced');
    setIsClean(true);
    setPhotos([]);
    setDisplayNotes('');
    setSubmittedReport(null);
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToManagerDashboard = (report: VisitReport) => {
    setSelectedReport(report);
    setActiveView('manager');
  };

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 pb-28 sm:pb-8">
      {/* Apple-style Minimal Merchandiser Welcome Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Field Operations
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/50">
                Live Audit
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 mt-1">
              Store Visit &amp; Inventory Audit
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Merchandiser: <strong className="text-stone-800">{activeMerchandiser.name}</strong> ({activeMerchandiser.id})
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs bg-stone-50 px-3 py-2 rounded-xl border border-stone-200/60 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <div>
              <p className="text-[10px] text-stone-400 leading-tight">Today</p>
              <p className="font-mono font-medium text-stone-800">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Dialog */}
      {submittedReport && (
        <div className="bg-white border border-black/[0.06] rounded-3xl p-6 sm:p-7 shadow-xs text-center space-y-4 animate-in zoom-in-95">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[11px] uppercase font-semibold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200/60">
              Audit Recorded Successfully
            </span>
            <h3 className="text-lg sm:text-xl font-semibold text-stone-900 mt-2">
              {submittedReport.store.name}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Ref: <span className="font-mono text-stone-800 font-medium">{submittedReport.id}</span> • {submittedReport.store.chain} • {submittedReport.formattedTime}
            </p>
            {submittedReport.managerName && (
              <p className="text-xs text-stone-600 mt-1 flex items-center justify-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Store Manager: <strong>{submittedReport.managerName}</strong></span>
                {submittedReport.managerPhone && <span>({submittedReport.managerPhone})</span>}
              </p>
            )}

            {sheetsWebhookUrl ? (
              <div className="pt-1 flex items-center justify-center">
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 inline-flex items-center space-x-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-time Google Sheet Sync Sent</span>
                </span>
              </div>
            ) : null}
          </div>

          {/* Quick Metrics of Submitted Report */}
          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto text-xs py-1">
            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
              <span className="text-[10px] text-stone-400 uppercase font-medium">Stock On Hand</span>
              <p className="font-semibold text-stone-900 text-sm mt-0.5">{submittedReport.totalStockOnHand} PCS</p>
            </div>
            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
              <span className="text-[10px] text-stone-400 uppercase font-medium">Order Status</span>
              <p className="font-semibold text-stone-900 text-sm mt-0.5">{submittedReport.orderNeeded}</p>
            </div>
            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
              <span className="text-[10px] text-stone-400 uppercase font-medium">Display</span>
              <p className="font-semibold text-emerald-700 text-sm mt-0.5">{submittedReport.isClean ? 'Clean' : 'Needs Clean'}</p>
            </div>
          </div>

          {/* Replenishment Order Action Card */}
          {(submittedReport.orderNeeded === 'Yes' || submittedReport.hasOrderRequest) && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 text-left max-w-sm mx-auto space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-900 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-stone-700" />
                  <span>Replenishment Order Requested</span>
                </span>
                <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                  Restock Alert
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                Replenishment request recorded. Send order summary to the replenishment desk:
              </p>
              <div className="pt-0.5 flex items-center space-x-1.5">
                <a
                  href={generateGmailWebUrl(submittedReport)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium shadow-2xs transition active:scale-95"
                >
                  <Mail className="w-3 h-3 text-red-400" />
                  <span>Send via Gmail</span>
                </a>
                <a
                  href={generateMailtoUrl(submittedReport)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200 transition active:scale-95"
                >
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                  <span>Apple Mail</span>
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleGoToManagerDashboard(submittedReport)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition active:scale-[0.98]"
            >
              <Eye className="w-3.5 h-3.5 text-stone-200" />
              <span>Inspect in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStartNextReport}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 font-medium text-xs flex items-center justify-center space-x-1.5 transition active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Log Next Station</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      {!submittedReport && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Banner */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="font-medium">{validationError}</p>
            </div>
          )}

          {/* Step 1: Location & Store Selector */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
            <StoreSelector
              selectedStore={selectedStore}
              onSelectStore={(store) => {
                setSelectedStore(store);
                setValidationError(null);
              }}
            />
          </section>

          {/* Step 1.5: Store Manager Contact Details (with Auto-fill Memory) */}
          {selectedStore && (
            <StoreManagerInput
              selectedStore={selectedStore}
              managerName={managerName}
              managerPhone={managerPhone}
              isAutoFilled={isManagerAutoFilled}
              onNameChange={(val) => {
                setManagerName(val);
                setIsManagerAutoFilled(false);
              }}
              onPhoneChange={(val) => {
                setManagerPhone(val);
                setIsManagerAutoFilled(false);
              }}
            />
          )}

          {/* Step 2: Product Lineup & Inventory */}
          <section className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs">
            <InventorySection
              products={products}
              inventory={inventory}
              onChange={setInventory}
            />
          </section>

          {/* Step 3: Order Requests */}
          <section>
            <OrderSection
              products={products}
              orderNeeded={orderNeeded}
              orderItems={orderItems}
              orderNotes={orderNotes}
              onOrderNeededChange={setOrderNeeded}
              onOrderItemsChange={setOrderItems}
              onOrderNotesChange={setOrderNotes}
            />
          </section>

          {/* Step 4: Display & Photos */}
          <section>
            <DisplaySection
              displayCondition={displayCondition}
              isClean={isClean}
              photos={photos}
              displayNotes={displayNotes}
              onConditionChange={setDisplayCondition}
              onCleanlinessChange={setIsClean}
              onPhotosChange={setPhotos}
              onNotesChange={setDisplayNotes}
            />
          </section>

          {/* Apple-style Frosted Floating Action Bar */}
          <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] sm:bottom-4 z-30 p-3 sm:p-3.5 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 text-stone-600">
                <Store className="w-4 h-4 text-stone-700" />
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="text-xs font-semibold text-stone-900 truncate">
                  {selectedStore ? selectedStore.name : 'Select station to begin audit'}
                </p>
                <p className="text-[11px] text-stone-400">
                  {selectedStore ? `${selectedStore.chain} • Ready to submit` : 'Step 1 required'}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-2xs active:scale-[0.98] transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-stone-200" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Visit Report'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
