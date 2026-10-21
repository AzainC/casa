import React from 'react';
import type { ProductItem, OrderNeededStatus, OrderItemRequest } from '../../types';
import { 
  ShoppingCart, 
  Check, 
  HelpCircle, 
  Ban, 
  Plus, 
  Minus, 
  FileText 
} from 'lucide-react';

interface OrderSectionProps {
  products: ProductItem[];
  orderNeeded: OrderNeededStatus;
  orderItems: OrderItemRequest[];
  orderNotes: string;
  onOrderNeededChange: (val: OrderNeededStatus) => void;
  onOrderItemsChange: (items: OrderItemRequest[]) => void;
  onOrderNotesChange: (notes: string) => void;
}

export const OrderSection: React.FC<OrderSectionProps> = ({
  products,
  orderNeeded,
  orderItems,
  orderNotes,
  onOrderNeededChange,
  onOrderItemsChange,
  onOrderNotesChange,
}) => {
  const handleItemToggle = (productId: string, productName: string, checked: boolean) => {
    const existingIndex = orderItems.findIndex((i) => i.productId === productId);
    let updated = [...orderItems];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        requested: checked,
        quantity: checked ? (updated[existingIndex].quantity || 24) : 0,
      };
    } else {
      updated.push({
        productId,
        productName,
        requested: checked,
        quantity: 24,
      });
    }
    onOrderItemsChange(updated);
  };

  const handleQuantityChange = (productId: string, qty: number) => {
    const val = Math.max(1, qty);
    const existingIndex = orderItems.findIndex((i) => i.productId === productId);
    let updated = [...orderItems];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: val,
        requested: true,
      };
    } else {
      const prod = products.find((p) => p.id === productId);
      updated.push({
        productId,
        productName: prod ? prod.name : 'Unknown Product',
        requested: true,
        quantity: val,
      });
    }
    onOrderItemsChange(updated);
  };

  const getItemState = (productId: string) => {
    return orderItems.find((i) => i.productId === productId) || {
      productId,
      productName: '',
      requested: false,
      quantity: 24,
    };
  };

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-4">
      {/* Step Header */}
      <div>
        <div className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#A88B77]">
          <ShoppingCart className="w-3.5 h-3.5 text-[#C87D32]" />
          <span>Step 3 • Replenishment & Order Requests</span>
          <span className="text-stone-400">• Required</span>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Specify if store management requested replenishment or purchase order follow-up.
        </p>
      </div>

      {/* New Order Needed Segmented Selector: Yes / No / Follow-up required */}
      <div>
        <label className="block text-[11px] font-medium text-stone-500 mb-2">
          New order required by branch?
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/80 rounded-xl border border-black/[0.04]">
          {/* YES */}
          <button
            type="button"
            onClick={() => onOrderNeededChange('Yes')}
            className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              orderNeeded === 'Yes'
                ? 'bg-white text-emerald-800 shadow-2xs border border-black/[0.06]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Check className={`w-3.5 h-3.5 ${orderNeeded === 'Yes' ? 'text-emerald-600' : 'text-stone-400'}`} />
            <span>Yes, Order</span>
          </button>

          {/* NO */}
          <button
            type="button"
            onClick={() => onOrderNeededChange('No')}
            className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              orderNeeded === 'No'
                ? 'bg-white text-stone-900 shadow-2xs border border-black/[0.06]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Ban className={`w-3.5 h-3.5 ${orderNeeded === 'No' ? 'text-stone-700' : 'text-stone-400'}`} />
            <span>Not Needed</span>
          </button>

          {/* FOLLOW-UP REQUIRED */}
          <button
            type="button"
            onClick={() => onOrderNeededChange('Follow-up required')}
            className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              orderNeeded === 'Follow-up required'
                ? 'bg-white text-amber-900 shadow-2xs border border-black/[0.06]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className={`w-3.5 h-3.5 ${orderNeeded === 'Follow-up required' ? 'text-amber-600' : 'text-stone-400'}`} />
            <span>Follow-up</span>
          </button>
        </div>
      </div>

      {/* Conditional Item Checklist & Quantities (if Yes or Follow-up) */}
      {orderNeeded !== 'No' && (
        <div className="space-y-3 pt-3 border-t border-black/[0.05] animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-700 tracking-tight">
              Select SKUs & Requested Quantities
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              Cartons (12 / 24 pcs)
            </span>
          </div>

          <div className="divide-y divide-black/[0.04] rounded-xl border border-black/[0.06] overflow-hidden bg-stone-50/40">
            {products.map((prod) => {
              const item = getItemState(prod.id);
              return (
                <div
                  key={prod.id}
                  className={`p-3 transition-colors ${
                    item.requested ? 'bg-amber-500/[0.04]' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Checkbox & Product Info */}
                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={item.requested}
                        onChange={(e) => handleItemToggle(prod.id, prod.name, e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-0 focus:ring-offset-0"
                      />
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-black/[0.06] bg-white">
                        <img src={prod.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-900 leading-tight">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-stone-400">{prod.weightCategory}</p>
                      </div>
                    </label>

                    {/* Quantity Controls (Active when checked) */}
                    {item.requested ? (
                      <div className="flex items-center space-x-1.5 self-end sm:self-auto pl-7 sm:pl-0">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, (item.quantity || 24) - 6)}
                          disabled={item.quantity <= 6}
                          className="w-7 h-7 rounded-lg bg-white border border-black/[0.08] hover:bg-stone-100 disabled:opacity-30 flex items-center justify-center text-xs text-stone-700 transition active:scale-95 shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="flex items-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity || 24}
                            onChange={(e) =>
                              handleQuantityChange(prod.id, parseInt(e.target.value) || 1)
                            }
                            className="w-14 h-7 text-center font-mono font-semibold text-xs bg-white border border-black/[0.08] rounded-lg focus:outline-none focus:border-stone-900/40 shadow-2xs"
                          />
                          <span className="text-[10px] font-mono text-stone-400 ml-1">PCS</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, (item.quantity || 24) + 6)}
                          className="w-7 h-7 rounded-lg bg-white border border-black/[0.08] hover:bg-stone-100 flex items-center justify-center text-xs text-stone-700 transition active:scale-95 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        {/* Quick Carton Buttons */}
                        <div className="flex space-x-1 ml-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, 24)}
                            className="px-2 py-1 text-[10px] font-mono font-medium bg-stone-100 text-stone-700 rounded-md border border-black/[0.04] hover:bg-stone-200/80 transition"
                          >
                            24
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, 48)}
                            className="px-2 py-1 text-[10px] font-mono font-medium bg-stone-100 text-stone-700 rounded-md border border-black/[0.04] hover:bg-stone-200/80 transition"
                          >
                            48
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400 pl-7 sm:pl-0">
                        Tap checkbox to add
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Notes / Comments */}
          <div>
            <label className="text-[11px] font-medium text-stone-600 flex items-center mb-1">
              <FileText className="w-3 h-3 mr-1 text-stone-400" />
              Order Notes / LPO Reference (Optional)
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => onOrderNotesChange(e.target.value)}
              placeholder="e.g. Store receiver requested morning delivery; PO# 8849"
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-black/[0.08] rounded-xl focus:outline-none focus:bg-white focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 transition"
            />
          </div>
        </div>
      )}
    </div>
  );
};
