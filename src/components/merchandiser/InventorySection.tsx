import React, { useState, useMemo } from 'react';
import type { ProductItem, ProductInventoryState } from '../../types';
import { ProductCard } from './ProductCard';
import {
  Package,
  AlertCircle,
  CheckCircle,
  Layers,
  RotateCcw,
  PlusCircle,
  Slash,
  Search
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.flavorProfile && p.flavorProfile.toLowerCase().includes(q)) ||
        (p.weightCategory && p.weightCategory.toLowerCase().includes(q))
    );
  }, [products, searchTerm]);

  const handleItemChange = (productId: string, updatedItem: ProductInventoryState) => {
    const next = inventory.map((item) => (item.productId === productId ? updatedItem : item));
    onChange(next);
  };

  // Quick statistics (N/A items are not treated as out of stock alerts)
  const totalStock = inventory.reduce((sum, item) => sum + (Number(item.stockOnHand) || 0), 0);
  const outOfStockCount = inventory.filter(
    (item) => item.availabilityStatus !== 'N/A' && (!item.isAvailable || Number(item.stockOnHand) === 0)
  ).length;

  // Batch action: Zero All products (0 pcs, OOS)
  const handleZeroAll = () => {
    const updated: ProductInventoryState[] = inventory.map((item) => ({
      ...item,
      stockOnHand: 0,
      isAvailable: false,
    }));
    onChange(updated);
  };

  // Batch action: Add +12 to all products
  const handleAdd12ToAll = () => {
    const updated: ProductInventoryState[] = inventory.map((item) => ({
      ...item,
      stockOnHand: (item.stockOnHand || 0) + 12,
      isAvailable: true,
    }));
    onChange(updated);
  };

  // Batch action: Reset all to standard 12 pcs
  const handleSetAllTo12 = () => {
    const today = new Date();
    const plus6Mo = new Date();
    plus6Mo.setMonth(today.getMonth() + 6);
    const dateStr = plus6Mo.toISOString().split('T')[0];

    const updated: ProductInventoryState[] = products.map((prod, idx) => {
      const existing = inventory[idx];
      return {
        productId: prod.id,
        productName: prod.name,
        isAvailable: true,
        stockOnHand: 12,
        expiryDate: existing?.expiryDate || dateStr,
      };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Apple-style Section Header & Batch Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            <Package className="w-3.5 h-3.5 text-stone-700" />
            <span className='text-black text-bold'>Step 2 • Official Casa Pons Lineup</span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit shelf presence, on-hand count, and batch expiry for all {products.length} confectionery items.
          </p>
        </div>

        {/* Apple Segmented Batch Action Controls (3-Col Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 w-full sm:w-auto bg-stone-200/60 p-1 rounded-xl border border-black/[0.04]">
          <button
            type="button"
            onClick={handleZeroAll}
            className="px-2 py-1.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-white/70 active:scale-95 transition flex items-center justify-center space-x-1"
            title="Set all product quantities to 0"
          >
            <Slash className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">Zero All (0)</span>
          </button>

          <button
            type="button"
            onClick={handleAdd12ToAll}
            className="px-2 py-1.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium text-stone-900 bg-white shadow-2xs hover:bg-stone-50 active:scale-95 transition flex items-center justify-center space-x-1"
            title="Add +12 units (1 carton) to all products"
          >
            <PlusCircle className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">+12 to All</span>
          </button>

          <button
            type="button"
            onClick={handleSetAllTo12}
            className="px-2 py-1.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium text-stone-600 hover:text-stone-900 hover:bg-white/70 active:scale-95 transition flex items-center justify-center space-x-1"
            title="Reset all products to 12 units"
          >
            <RotateCcw className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">12 All</span>
          </button>
        </div>
      </div>

      {/* Live Metric Ribbon (Apple Widget Aesthetic) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Total Stock */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-center">
          <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-stone-400 flex items-center justify-center tracking-wider truncate">
            <Layers className="w-3 h-3 mr-1 text-stone-500 shrink-0" /> Total Units
          </p>
          <p className="text-base sm:text-2xl font-semibold font-mono tracking-tight text-stone-900 mt-0.5">
            {totalStock} <span className="text-[10px] sm:text-xs font-normal text-stone-400">PCS</span>
          </p>
        </div>

        {/* Active SKUs */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-center">
          <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-stone-400 flex items-center justify-center tracking-wider truncate">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600 shrink-0" /> On Shelf
          </p>
          <p className="text-base sm:text-2xl font-semibold font-mono tracking-tight text-emerald-700 mt-0.5">
            {Math.max(0, products.length - outOfStockCount)} <span className="text-[10px] sm:text-xs font-normal text-stone-400">/ {products.length}</span>
          </p>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-center">
          <p className="text-[9px] sm:text-[10px] uppercase font-semibold text-stone-400 flex items-center justify-center tracking-wider truncate">
            <AlertCircle className="w-3 h-3 mr-1 text-rose-500 shrink-0" /> Out of Stock
          </p>
          <p
            className={`text-base sm:text-2xl font-semibold font-mono tracking-tight mt-0.5 ${outOfStockCount > 0 ? 'text-rose-600' : 'text-stone-400'
              }`}
          >
            {outOfStockCount} <span className="text-[10px] sm:text-xs font-normal text-stone-400">SKUs</span>
          </p>
        </div>
      </div>

      {/* Live Product Search / Filter when multiple products exist */}
      {products.length > 4 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${products.length} products by name or flavor...`}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:border-stone-900/40 text-stone-900 placeholder:text-stone-400 shadow-2xs transition"
          />
        </div>
      )}

      {/* Product Cards */}
      <div className="space-y-3">
        {filteredProducts.map((product, index) => {
          const itemState = inventory.find((i) => i.productId === product.id) || {
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
              onChange={(updated) => handleItemChange(product.id, updated)}
              index={index}
            />
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-black/[0.06] text-stone-400 text-xs">
            No products matching &quot;{searchTerm}&quot; found.
          </div>
        )}
      </div>
    </div>
  );
};
