import React from 'react';
import type { ProductItem, ProductInventoryState, ShelfAvailability } from '../../types';
import {
  Check,
  X,
  Minus,
  Plus,
  Barcode,
  MinusCircle
} from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  state: ProductInventoryState;
  onChange: (updated: ProductInventoryState) => void;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, state, onChange, index }) => {
  const currentStatus: ShelfAvailability =
    state.availabilityStatus || (state.isAvailable ? 'Available' : 'Out of Stock');

  const handleStatusChange = (newStatus: ShelfAvailability) => {
    if (newStatus === 'Available') {
      onChange({
        ...state,
        isAvailable: true,
        availabilityStatus: 'Available',
        stockOnHand: state.stockOnHand === 0 ? 12 : state.stockOnHand,
      });
    } else if (newStatus === 'Out of Stock') {
      onChange({
        ...state,
        isAvailable: false,
        availabilityStatus: 'Out of Stock',
        stockOnHand: 0,
      });
    } else {
      // 'N/A' (Not Applicable / not carried in this store)
      onChange({
        ...state,
        isAvailable: false,
        availabilityStatus: 'N/A',
        stockOnHand: 0,
      });
    }
  };

  const handleStockChange = (newStock: number) => {
    const val = Math.max(0, newStock);
    onChange({
      ...state,
      stockOnHand: val,
      isAvailable: val > 0,
      availabilityStatus: val > 0 ? 'Available' : state.availabilityStatus === 'N/A' ? 'N/A' : 'Out of Stock',
    });
  };

  const handleDateChange = (dateStr: string) => {
    onChange({
      ...state,
      expiryDate: dateStr,
    });
  };

  const addMonthsToDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const getExpiryAlert = () => {
    if (!state.expiryDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(state.expiryDate);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { type: 'expired', label: 'Expired', color: 'bg-rose-50 text-rose-700 border border-rose-200/60' };
    }
    if (diffDays <= 30) {
      return {
        type: 'warning',
        label: `Expiring Soon (${diffDays}d)`,
        color: 'bg-amber-50 text-amber-800 border border-amber-200/60'
      };
    }
    return {
      type: 'good',
      label: `Fresh (${diffDays}d)`,
      color: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
    };
  };

  const expiryBadge = getExpiryAlert();

  return (
    <div
      className={`rounded-2xl transition-all duration-200 bg-white p-3.5 sm:p-4 border ${currentStatus === 'N/A'
        ? 'border-stone-200/90 bg-stone-50/50 opacity-90'
        : currentStatus === 'Out of Stock' || state.stockOnHand === 0
          ? 'border-rose-200/80 bg-rose-50/[0.12]'
          : 'border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
        }`}
    >
      {/* Product Top Header */}
      <div className="flex items-start space-x-3 pb-3 border-b border-black/[0.04]">
        {/* Product Image Thumbnail */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-50 border border-black/[0.06] flex items-center justify-center shadow-2xs">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-stone-900 text-stone-100 text-[9px] font-bold flex items-center justify-center shadow-xs">
            {index + 1}
          </span>
        </div>

        {/* Product Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
              {product.weightCategory || 'Confectionery'}
            </span>
            <span className="text-[10px] font-mono text-stone-400 flex items-center">
              <Barcode className="w-3 h-3 mr-0.5" />
              {product.barcode.slice(-4)}
            </span>
          </div>

          <h4 className="font-semibold text-stone-900 text-xs sm:text-sm leading-tight mt-0.5 tracking-tight truncate">
            {product.name}
          </h4>
          <p className="text-[11px] sm:text-xs text-stone-500 truncate mt-0.5">{product.flavorProfile}</p>

          <div className="mt-1 flex items-center space-x-2">
            <span className="text-xs font-semibold text-stone-800">
              {product.suggestedRetailPrice}
            </span>
            <span className="text-stone-300">•</span>
            {currentStatus === 'N/A' ? (
              <span className="text-[11px] font-medium text-stone-500 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1 inline-block" />
                N/A (Not Listed)
              </span>
            ) : currentStatus === 'Available' && state.stockOnHand > 0 ? (
              <span className="text-[11px] font-medium text-emerald-700 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
                Available ({state.stockOnHand} pcs)
              </span>
            ) : (
              <span className="text-[11px] font-medium text-rose-600 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 inline-block" />
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Inputs: Shelf Status and Stock on Hand on Row 1, Expiry on Next Line in non-mobile view */}
      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Shelf Status 3-Way Toggle: Available / OOS / N/A */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Shelf Status
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100/80 rounded-xl border border-black/[0.04]">
            <button
              type="button"
              onClick={() => handleStatusChange('Available')}
              title="SKU is active and available on shelf"
              className={`flex items-center justify-center space-x-1 py-2 sm:py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-medium transition ${currentStatus === 'Available'
                ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
                }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Available</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('Out of Stock')}
              title="SKU is listed but out of stock"
              className={`flex items-center justify-center space-x-1 py-2 sm:py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-medium transition ${currentStatus === 'Out of Stock'
                ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
                }`}
            >
              <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>OOS</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('N/A')}
              title="Not Applicable (Store does not carry this product)"
              className={`flex items-center justify-center space-x-1 py-2 sm:py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-medium transition ${currentStatus === 'N/A'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
                }`}
            >
              <MinusCircle className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>N/A</span>
            </button>
          </div>
        </div>

        {/* 2. Stock on Hand with Quick '0', '12', and '+12' Controls */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Stock on Hand
            </label>
            <span
              className={`text-[10px] font-mono font-medium ${state.stockOnHand === 0 ? 'text-rose-600 font-bold' : 'text-stone-600'
                }`}
            >
              {state.stockOnHand} pcs
            </span>
          </div>

          {/* Stepper with Number Input */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => handleStockChange(state.stockOnHand - 1)}
              disabled={state.stockOnHand <= 0}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-700 active:scale-95 transition"
              title="Decrease by 1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min={0}
              value={state.stockOnHand}
              onChange={(e) => handleStockChange(parseInt(e.target.value) || 0)}
              className="flex-1 h-9 sm:h-8 px-2 text-center font-mono font-semibold text-xs sm:text-sm bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900"
            />

            <button
              type="button"
              onClick={() => handleStockChange(state.stockOnHand + 1)}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-700 active:scale-95 transition"
              title="Increase by 1"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Access Buttons: 0 (Zero out), 12 (1 Box), +12 (Add 12) */}
          <div className="grid grid-cols-3 gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => handleStockChange(0)}
              className={`h-8 px-1 rounded-lg text-[11px] font-mono font-semibold transition active:scale-95 border text-center flex items-center justify-center ${state.stockOnHand === 0
                ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-transparent'
                }`}
              title="Make zero (Out of Stock)"
            >
              0 (Zero)
            </button>
            <button
              type="button"
              onClick={() => handleStockChange(12)}
              className={`h-8 px-1 rounded-lg text-[11px] font-mono font-semibold transition active:scale-95 border text-center flex items-center justify-center ${state.stockOnHand === 12
                ? 'bg-stone-900 text-white border-stone-900 font-bold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-transparent'
                }`}
              title="Set to standard carton count (12)"
            >
              12 (Box)
            </button>
            <button
              type="button"
              onClick={() => handleStockChange(state.stockOnHand + 12)}
              className="h-8 px-1 rounded-lg text-[11px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition active:scale-95 border border-black/[0.04] text-center flex items-center justify-center"
              title="Add 12 units (+1 carton)"
            >
              +12
            </button>
          </div>
        </div>

        {/* 3. Batch Expiry Date (Responsive: Next Line on Desktop, Balanced Grid on Smaller Screens) */}
        <div className="sm:col-span-2 pt-2.5 sm:pt-2 border-t border-black/[0.04]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Batch Expiry Date
            </label>
            {expiryBadge && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${expiryBadge.color}`}>
                {expiryBadge.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
            {/* Native Date Input */}
            <div className="sm:col-span-5">
              <input
                type="date"
                value={state.expiryDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full h-9 sm:h-8 px-3 text-xs bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-stone-400 text-stone-900 font-medium"
              />
            </div>

            {/* Quick Presets: 3 Balanced Buttons Matching Stock Tab Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:col-span-7">
              <button
                type="button"
                onClick={() => handleDateChange(addMonthsToDate(3))}
                className={`h-9 sm:h-8 px-2 rounded-xl text-[11px] font-medium transition active:scale-95 border flex items-center justify-center ${state.expiryDate === addMonthsToDate(3)
                  ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-transparent'
                  }`}
                title="Expires in 3 months from today"
              >
                +3 Months
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(addMonthsToDate(6))}
                className={`h-9 sm:h-8 px-2 rounded-xl text-[11px] font-medium transition active:scale-95 border flex items-center justify-center ${state.expiryDate === addMonthsToDate(6)
                  ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-transparent'
                  }`}
                title="Expires in 6 months from today"
              >
                +6 Months
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(addMonthsToDate(9))}
                className={`h-9 sm:h-8 px-2 rounded-xl text-[11px] font-medium transition active:scale-95 border flex items-center justify-center ${state.expiryDate === addMonthsToDate(9)
                  ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-transparent'
                  }`}
                title="Expires in 9 months from today"
              >
                +9 Months
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
