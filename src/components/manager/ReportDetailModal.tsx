import React, { useState, useEffect } from 'react';
import type { VisitReport, StorePhoto } from '../../types';
import { useReports } from '../../context/ReportContext';
import { fetchReportPhotos } from '../../services/supabaseClient';
import { getChainStyle, renderChainIcon } from '../../utils/chainStyles';
import { 
  X, 
  MapPin, 
  Building2, 
  Fuel, 
  Clock, 
  User, 
  Package, 
  ShoppingCart, 
  Sparkles, 
  Camera, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ZoomIn,
  UserCheck,
  Phone,
  Mail
} from 'lucide-react';
import { generateMailtoUrl } from '../../services/emailService';

interface ReportDetailModalProps {
  report: VisitReport;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
  const { products, chains } = useReports();
  const [activePhoto, setActivePhoto] = useState<StorePhoto | null>(null);
  const [modalPhotos, setModalPhotos] = useState<StorePhoto[]>(() => report.photos || []);

  const chainStyle = getChainStyle(report.store.chain, chains);

  useEffect(() => {
    if (!report.photos || report.photos.length === 0 || !report.photos[0]?.dataUrl) {
      fetchReportPhotos(report.id).then((photos) => {
        if (photos && photos.length > 0) {
          setModalPhotos(photos);
        }
      });
    } else {
      setModalPhotos(report.photos);
    }
  }, [report.id, report.photos]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-black/[0.06] relative my-auto"
      >
        {/* Modal Header (Apple Minimalist) */}
        <div className="sticky top-0 z-20 bg-stone-900 text-white p-4 sm:p-5 rounded-t-3xl border-b border-white/10 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-2xs ${chainStyle.solidClass}`}
            >
              {renderChainIcon(chainStyle.iconType, 'w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${chainStyle.pillClass}`}>
                  {report.store.chain}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {report.id}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white mt-0.5">
                {report.store.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrint}
              title="Print Visit Audit Sheet"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Metadata Cards: Merchandiser, Manager, Timestamp */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                Audited By
              </span>
              <p className="font-semibold text-stone-900 mt-0.5 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {report.merchandiserName}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                Store Manager (PIC)
              </span>
              {report.managerName ? (
                <>
                  <p className="font-semibold text-stone-900 mt-0.5 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    {report.managerName}
                  </p>
                  {report.managerPhone && (
                    <a
                      href={`tel:${report.managerPhone}`}
                      className="text-[10px] font-mono text-emerald-700 hover:underline inline-flex items-center mt-0.5"
                    >
                      <Phone className="w-2.5 h-2.5 mr-0.5" />
                      {report.managerPhone}
                    </a>
                  )}
                </>
              ) : (
                <span className="text-[11px] text-stone-400 italic">Not recorded</span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                Date &amp; Time
              </span>
              <p className="font-semibold text-stone-900 mt-0.5 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {report.formattedTime}
              </p>
              <span className="text-[10px] text-stone-400">{report.formattedDate}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                Audit Status
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-semibold ${
                  report.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                    : report.status === 'Urgent Restock'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200/60'
                    : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                }`}
              >
                {report.status}
              </span>
            </div>
          </div>

          {/* Section 1: Product Inventory Health (5 SKUs) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center">
                <Package className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                Product Lineup &amp; Inventory Status ({report.inventory.length} SKUs)
              </h4>
              <span className="text-xs font-mono font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                Total: {report.totalStockOnHand} PCS
              </span>
            </div>

            <div className="border border-stone-200/70 rounded-2xl overflow-hidden divide-y divide-stone-100">
              {report.inventory.map((item, idx) => {
                const productMeta = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
                return (
                  <div key={item.productId || idx} className="p-3 bg-white hover:bg-stone-50 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70">
                        {productMeta && (
                          <img src={productMeta.imageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-medium text-stone-400 font-mono">#{idx + 1}</span>
                          <p className="text-xs sm:text-sm font-semibold text-stone-900">{item.productName}</p>
                        </div>
                        <p className="text-[11px] text-stone-400">{productMeta?.weightCategory || 'Confectionery'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      {/* Shelf Availability */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.2 rounded-full ${
                          item.availabilityStatus === 'N/A'
                            ? 'bg-stone-100 text-stone-600 border border-stone-200'
                            : item.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                        }`}
                      >
                        {item.availabilityStatus === 'N/A' ? 'N/A' : item.isAvailable ? 'On Shelf' : 'OOS'}
                      </span>

                      {/* Stock On Hand */}
                      <div className="min-w-[60px]">
                        <span className="text-[10px] text-stone-400 block">Stock</span>
                        <span className="font-mono font-semibold text-stone-900 text-sm">
                          {item.stockOnHand} pcs
                        </span>
                      </div>

                      {/* Expiry Date */}
                      <div className="min-w-[75px] hidden sm:block">
                        <span className="text-[10px] text-stone-400 block">Expiry</span>
                        <span className="font-mono text-xs text-stone-600">
                          {item.expiryDate || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Order Outcome & Requests */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center">
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              Order Outcome &amp; Replenishment
            </h4>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-700">New Order Needed:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    report.orderNeeded === 'Yes'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {report.orderNeeded}
                </span>
              </div>

              {/* Order Items Breakdown */}
              {report.orderItems && report.orderItems.length > 0 && (
                <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Requested Items:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.orderItems
                      .filter((oi) => oi.requested && oi.quantity > 0)
                      .map((oi) => (
                        <div
                          key={oi.productId}
                          className="bg-white p-2.5 rounded-xl border border-stone-200/70 flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-stone-800 truncate pr-2">
                            {oi.productName}
                          </span>
                          <span className="font-mono font-semibold text-stone-900 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                            {oi.quantity} pcs
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {report.orderNotes && (
                <div className="pt-2 border-t border-stone-200/60">
                  <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                    Order Remarks
                  </span>
                  <p className="text-xs text-stone-600 mt-0.5 italic">"{report.orderNotes}"</p>
                </div>
              )}

              {(report.orderNeeded === 'Yes' || report.hasOrderRequest) && (
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>Replenishment Order Desk</span>
                  </span>
                  <a
                    href={generateMailtoUrl(report)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium border border-amber-200 transition"
                  >
                    <Mail className="w-3 h-3 text-amber-700" />
                    <span>Send Order Email</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Display Condition & Cleanliness */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              Store Display &amp; Visual Audit
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                  Display Condition
                </span>
                <p className="font-semibold text-stone-900 text-xs sm:text-sm mt-1">{report.displayCondition}</p>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                  Cleanliness Standards
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-semibold ${
                    report.isClean
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                      : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                  }`}
                >
                  {report.isClean ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Clean
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Needs Cleaning
                    </>
                  )}
                </span>
              </div>
            </div>

            {report.displayNotes && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs">
                <span className="text-[10px] uppercase font-semibold text-stone-400 block">
                  Merchandiser Remarks
                </span>
                <p className="text-stone-600 mt-0.5">{report.displayNotes}</p>
              </div>
            )}
          </div>

          {/* Section 4: Display Photos Gallery */}
          {modalPhotos && modalPhotos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center">
                <Camera className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                Store Display Proof Photos ({modalPhotos.length})
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {modalPhotos.map((photo, pIdx) => (
                  <div
                    key={photo.id}
                    onClick={() => setActivePhoto(photo)}
                    className="group relative rounded-2xl overflow-hidden border border-stone-200 aspect-4/3 cursor-pointer shadow-2xs hover:shadow-xs transition"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption || 'Store Display'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1">
                      <ZoomIn className="w-4 h-4" />
                      <span className="text-xs font-medium">View</span>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] truncate">
                      {photo.caption || `Photo ${pIdx + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200/60 rounded-b-3xl flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Casa Pons Central Confectionery Database
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-2xs transition"
          >
            Close
          </button>
        </div>

        {/* Nested Full-screen Photo Lightbox */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-stone-950 rounded-2xl overflow-hidden"
            >
              <div className="p-3 bg-stone-900 flex items-center justify-between text-white border-b border-stone-800">
                <span className="text-xs font-medium">{activePhoto.caption || 'Store Photo'}</span>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center bg-black">
                <img
                  src={activePhoto.dataUrl}
                  alt=""
                  className="max-h-[75vh] w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
