import React from 'react';
import type { ProductItem, ProductInventoryState } from '../../types';
import { 
  Check, 
  X, 
  Minus, 
  Plus, 
  Barcode
} from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  state: ProductInventoryState;
  onChange: (updated: ProductInventoryState) => void;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, state, onChange, index }) => {
  const handleAvailabilityToggle = (isAvailable: boolean) => {
    onChange({
      ...state,
      isAvailable,
      stockOnHand: !isAvailable ? 0 : state.stockOnHand === 0 ? 12 : state.stockOnHand,
    });
  };

  const handleStockChange = (newStock: number) => {
    const val = Math.max(0, newStock);
    onChange({
      ...state,
      stockOnHand: val,
      isAvailable: val > 0 ? true : state.isAvailable,
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
      className={`rounded-2xl transition-all duration-150 bg-white p-4 border ${
        !state.isAvailable
          ? 'border-rose-200 bg-rose-50/15'
          : 'border-black/[0.06] shadow-2xs'
      }`}
    >
      {/* Product Header */}
      <div className="flex items-start space-x-3.5 pb-3 border-b border-black/[0.04]">
        {/* Product Image Thumbnail */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border border-stone-200/60 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-stone-900 text-stone-200 text-[9px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
        </div>

        {/* Product Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-medium tracking-wide text-stone-400 uppercase">
              {product.weightCategory}
            </span>
            <span className="text-[10px] font-mono text-stone-400 flex items-center">
              <Barcode className="w-3 h-3 mr-0.5" />
              {product.barcode.slice(-4)}
            </span>
          </div>

          <h4 className="font-semibold text-stone-900 text-sm leading-tight mt-0.5">
            {product.name}
          </h4>
          <p className="text-xs text-stone-500 truncate mt-0.5">{product.flavorProfile}</p>

          <div className="mt-1 flex items-center space-x-2">
            <span className="text-xs font-medium text-stone-800">
              {product.suggestedRetailPrice}
            </span>
            <span className="text-stone-300">•</span>
            {state.isAvailable ? (
              <span className="text-[11px] font-medium text-emerald-700">
                On Shelf
              </span>
            ) : (
              <span className="text-[11px] font-medium text-rose-600">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Inputs: Shelf Availability, Stock on Hand, Expiry Date */}
      <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Input 1: Shelf Availability (Yes/No) */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
            Shelf Status
          </label>
          <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleAvailabilityToggle(true)}
              className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                state.isAvailable
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available</span>
            </button>
            <button
              type="button"
              onClick={() => handleAvailabilityToggle(false)}
              className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-medium transition ${
                !state.isAvailable
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>OOS</span>
            </button>
          </div>
        </div>

        {/* Input 2: Stock on Hand (PCS) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Stock on Hand
            </label>
            <span
              className={`text-[10px] font-mono font-medium ${
                state.stockOnHand === 0 ? 'text-rose-600' : 'text-stone-600'
              }`}
            >
              {state.stockOnHand} pcs
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => handleStockChange(state.stockOnHand - 1)}
              disabled={state.stockOnHand <= 0}
              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-stone-700 active:scale-95 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <input
              type="number"
              min={0}
              value={state.stockOnHand}
              onChange={(e) => handleStockChange(parseInt(e.target.value) || 0)}
              className="flex-1 h-8 px-2 text-center font-mono font-semibold text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 text-stone-900"
            />

            <button
              type="button"
              onClick={() => handleStockChange(state.stockOnHand + 1)}
              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleStockChange(state.stockOnHand + 12)}
              title="Add 12 pcs"
              className="h-8 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px] active:scale-95 transition"
            >
              +12
            </button>
          </div>
        </div>

        {/* Input 3: Expiry Date */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Batch Expiry
            </label>
            {expiryBadge && (
              <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-full ${expiryBadge.color}`}>
                {expiryBadge.label}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <input
              type="date"
              value={state.expiryDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-8 px-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 text-stone-900 font-medium"
            />
            <div className="flex items-center space-x-1 text-[10px] text-stone-400">
              <span>Quick:</span>
              <button
                type="button"
                onClick={() => handleDateChange(addMonthsToDate(3))}
                className="px-1.5 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
              >
                +3m
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(addMonthsToDate(6))}
                className="px-1.5 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
              >
                +6m
              </button>
              <button
                type="button"
                onClick={() => handleDateChange(addMonthsToDate(9))}
                className="px-1.5 py-0.2 rounded bg-stone-100 hover:bg-stone-200 text-stone-600"
              >
                +9m
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
