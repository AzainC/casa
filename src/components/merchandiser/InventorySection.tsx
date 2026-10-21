import React from 'react';
import type { ProductItem, ProductInventoryState } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Boxes, 
  AlertCircle, 
  CheckCircle, 
  Layers, 
  Wand2 
} from 'lucide-react';

interface InventorySectionProps {
  products: ProductItem[];
  inventory: ProductInventoryState[];
  onChange: (updatedInventory: ProductInventoryState[]) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  products,
  inventory,
  onChange,
}) => {
  const handleItemChange = (index: number, updatedItem: ProductInventoryState) => {
    const next = [...inventory];
    next[index] = updatedItem;
    onChange(next);
  };

  // Quick statistics
  const totalStock = inventory.reduce((sum, item) => sum + (Number(item.stockOnHand) || 0), 0);
  const outOfStockCount = inventory.filter(
    (item) => !item.isAvailable || Number(item.stockOnHand) === 0
  ).length;

  const handleQuickRestockAll = () => {
    const today = new Date();
    const plus6Mo = new Date();
    plus6Mo.setMonth(today.getMonth() + 6);
    const dateStr = plus6Mo.toISOString().split('T')[0];

    const filled: ProductInventoryState[] = products.map((prod, idx) => ({
      productId: prod.id,
      productName: prod.name,
      isAvailable: true,
      stockOnHand: [18, 14, 28, 12, 24][idx] || 15,
      expiryDate: dateStr,
    }));
    onChange(filled);
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#78350F] flex items-center">
            <Boxes className="w-4 h-4 mr-1.5 text-[#C87D32]" />
            Step 2: Product Lineup &amp; Inventory Logging
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit all 5 official Casa Pons confectionery SKUs for shelf status, count, and expiry.
          </p>
        </div>

        {/* Quick action button */}
        <button
          type="button"
          onClick={handleQuickRestockAll}
          className="self-start sm:self-auto text-xs px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#78350F] border border-[#C87D32]/30 font-semibold flex items-center space-x-1 transition active:scale-95"
        >
          <Wand2 className="w-3.5 h-3.5 text-[#C87D32]" />
          <span>Auto-fill Standard Stock</span>
        </button>
      </div>

      {/* Live Metric Ribbon */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-100 rounded-xl text-center text-xs">
        <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-center">
            <Layers className="w-3 h-3 mr-1 text-[#C87D32]" /> Total Units
          </p>
          <p className="text-base font-bold font-mono text-stone-900 mt-0.5">{totalStock} PCS</p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-center">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Active SKUs
          </p>
          <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">
            {5 - outOfStockCount} / 5
          </p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-stone-200/80 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-center">
            <AlertCircle className="w-3 h-3 mr-1 text-rose-500" /> Out of Stock
          </p>
          <p
            className={`text-base font-bold font-mono mt-0.5 ${
              outOfStockCount > 0 ? 'text-rose-600' : 'text-stone-700'
            }`}
          >
            {outOfStockCount} {outOfStockCount === 1 ? 'SKU' : 'SKUs'}
          </p>
        </div>
      </div>

      {/* 5 Product Cards */}
      <div className="space-y-3">
        {products.map((product, index) => {
          const itemState = inventory[index] || {
            productId: product.id,
            productName: product.name,
            isAvailable: true,
            stockOnHand: 12,
            expiryDate: '',
          };

          return (
            <ProductCard
              key={product.id}
              product={product}
              state={itemState}
              onChange={(updated) => handleItemChange(index, updated)}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
};
