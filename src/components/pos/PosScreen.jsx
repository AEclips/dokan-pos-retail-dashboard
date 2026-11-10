import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  PackagePlus, 
  Barcode, 
  Sparkles,
  Command,
  Keyboard
} from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

export default function PosScreen({
  products,
  cartItems,
  cartTotals,
  flatDiscount,
  onSetFlatDiscount,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onOpenCheckout,
  onOpenAddProduct,
  onOpenRestockModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const searchInputRef = useRef(null);

  // Low stock threshold products (<= 5 units or <= minStockAlert)
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= (p.minStockAlert || 5));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All Items' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Fast Barcode Scanner / Instant Enter Handler
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      // 1. Exact SKU or Barcode Match
      const exactMatch = products.find(
        (p) => p.sku.toLowerCase() === q || p.name.toLowerCase() === q
      );

      if (exactMatch && exactMatch.stockQuantity > 0) {
        onAddToCart(exactMatch);
        setSearchQuery('');
        return;
      }

      // 2. If filtered list has exactly 1 result, add it
      if (filteredProducts.length === 1 && filteredProducts[0].stockQuantity > 0) {
        onAddToCart(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* ==================== DEDICATED LOW STOCK ALERT SECTION ==================== */}
      {lowStockItems.length > 0 && (
        <div className="saas-card p-4 bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 transition-all">
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/70 dark:border-amber-900/40">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                  Low Stock Attention Required ({lowStockItems.length} Products)
                </h3>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Products with 5 units or fewer remaining in inventory.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
              Threshold: ≤ 5 pcs
            </span>
          </div>

          {/* Low Stock Items Carousel / List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-3">
            {lowStockItems.map((item) => {
              const isOut = item.stockQuantity <= 0;
              return (
                <div 
                  key={item.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-2 shadow-xs text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm">{item.imageEmoji || '📦'}</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                      <span className="text-slate-400 font-mono">{item.sku}</span>
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                        isOut ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {isOut ? 'Out of Stock' : `${item.stockQuantity} pcs left`}
                      </span>
                    </div>
                  </div>

                  {onOpenRestockModal && (
                    <button
                      onClick={() => onOpenRestockModal(item)}
                      className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 transition shrink-0 font-bold"
                      title="Quick Restock"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Catalog + Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Catalog Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick Scanner & Search Bar */}
          <div className="saas-card p-3 flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                id="mainPosSearchInput"
                type="text"
                placeholder="Scan barcode SKU or type product name (Press Enter to add)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-14 py-2 text-xs font-medium dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                F1 / ↵
              </span>
            </div>

            <button
              onClick={onOpenAddProduct}
              className="hidden sm:flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shrink-0 shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Category Horizontal Filter Pills with Item Counts */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'All Items' 
                ? products.length 
                : products.filter(p => p.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected 
                      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2 saas-card">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="font-bold text-xs text-slate-500">No matching products found</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const inCart = cartItems.find((c) => c.productId === product.id);
                const inCartQty = inCart ? inCart.quantity : 0;

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    inCartQty={inCartQty}
                  />
                );
              })
            )}
          </div>

          {/* Keyboard Shortcuts Hint Footer */}
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1.5 font-semibold">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Counter Hotkeys:</span>
            </div>
            <div className="flex items-center space-x-3 font-mono text-[10px]">
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border font-bold">F1</kbd> Search</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border font-bold">F2</kbd> Checkout</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border font-bold">F4</kbd> Clear Cart</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border font-bold">F9</kbd> Theme</span>
            </div>
          </div>

        </div>

        {/* Cart Column */}
        <div className="lg:col-span-1">
          <CartSidebar
            cartItems={cartItems}
            cartTotals={cartTotals}
            flatDiscount={flatDiscount}
            onSetFlatDiscount={onSetFlatDiscount}
            onUpdateQty={onUpdateCartQty}
            onRemoveItem={onRemoveCartItem}
            onClearCart={onClearCart}
            onOpenCheckout={onOpenCheckout}
          />
        </div>

      </div>

    </div>
  );
}
