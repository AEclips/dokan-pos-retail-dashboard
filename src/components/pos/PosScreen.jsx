import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  Keyboard,
  Wrench,
  RotateCcw,
  PauseCircle,
  X,
  Check
} from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import { PRODUCT_CATEGORIES } from '../../constants/categories';

export default function PosScreen({
  products,
  cartItems,
  cartTotals,
  flatDiscount,
  inventoryStats,
  dues = [],
  currentUser,
  preferredPaymentMethod,
  selectedCartCustomer,
  parkedOrders = [],
  onSelectPaymentMethod,
  onSelectCartCustomer,
  onSetFlatDiscount,
  onAddToCart,
  onAddCustomSale,
  onUpdateCartQty,
  onUpdateCartSerial,
  onUndoLastCartItem,
  onParkOrder,
  onRetrieveParkedOrder,
  onDeleteParkedOrder,
  onRemoveCartItem,
  onClearCart,
  onOpenCheckout,
  onOpenAddProduct,
  onOpenRestockModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isCustomSaleOpen, setIsCustomSaleOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customWarranty, setCustomWarranty] = useState('');
  const searchInputRef = useRef(null);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= (p.minStockAlert || 5)).length;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All Items' || p.category === selectedCategory;
      const matchesLow = !showLowStockOnly || p.stockQuantity <= (p.minStockAlert || 5);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      return matchesCat && matchesLow && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory, showLowStockOnly]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      const exactMatch = products.find(
        (p) => p.sku.toLowerCase() === q || p.name.toLowerCase() === q
      );

      if (exactMatch && exactMatch.stockQuantity > 0) {
        onAddToCart(exactMatch);
        setSearchQuery('');
        return;
      }

      if (filteredProducts.length === 1 && filteredProducts[0].stockQuantity > 0) {
        onAddToCart(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  const handleSubmitCustomSale = (e) => {
    e.preventDefault();
    if (!customName.trim() || !(parseFloat(customPrice) > 0)) return;
    onAddCustomSale &&
      onAddCustomSale({
        name: customName,
        sellingPrice: customPrice,
        buyingPrice: customCost || 0,
        warranty: customWarranty
      });
    setCustomName('');
    setCustomPrice('');
    setCustomCost('');
    setCustomWarranty('');
    setIsCustomSaleOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-full lg:min-h-0 animate-soft-enter relative">
      {/* Left/Center Catalog Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:h-full lg:overflow-hidden">
        {/* Compact Command & Smart Actions Toolbar */}
        <div
          className="px-4 sm:px-5 pt-3 pb-2.5 border-b space-y-2 shrink-0"
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          {/* Row 1: Search Omnibox + Smart Actions + New Item */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
                strokeWidth={1.85}
              />
              <input
                ref={searchInputRef}
                id="mainPosSearchInput"
                type="text"
                placeholder="Scan barcode SKU, brand, or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pos-input w-full pl-9 pr-16 h-9 text-xs font-medium"
                autoFocus
              />
              <span
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-muted)'
                }}
              >
                F1 / ↵
              </span>
            </div>

            {/* Smart Quick Action Tiles (Shopify + Toast Speed Actions) */}
            {onAddCustomSale && (
              <button
                type="button"
                onClick={() => setIsCustomSaleOpen(true)}
                className="tactile-press h-9 px-2.5 rounded-xl text-[11.5px] font-semibold flex items-center gap-1.5 border shrink-0 transition-colors hover:bg-[var(--bg-hover)]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)'
                }}
                title="Add Custom Service / Repair / Non-Catalog Sale"
              >
                <Wrench className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.9} />
                <span className="hidden md:inline">Custom Sale</span>
              </button>
            )}

            {onUndoLastCartItem && (
              <button
                type="button"
                onClick={onUndoLastCartItem}
                disabled={cartItems.length === 0}
                className="tactile-press h-9 px-2.5 rounded-xl text-[11.5px] font-semibold hidden sm:flex items-center gap-1.5 border shrink-0 transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-secondary)'
                }}
                title="Undo Last Added Item"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.9} />
                <span className="hidden xl:inline">Undo</span>
              </button>
            )}

            {onParkOrder && (
              <button
                type="button"
                onClick={onParkOrder}
                disabled={cartItems.length === 0}
                className="tactile-press h-9 px-2.5 rounded-xl text-[11.5px] font-semibold hidden sm:flex items-center gap-1.5 border shrink-0 transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--warning)'
                }}
                title="Hold / Park Current Order"
              >
                <PauseCircle className="w-3.5 h-3.5" strokeWidth={1.9} />
                <span className="hidden xl:inline">Hold</span>
              </button>
            )}

            {lowStockCount > 0 && (
              <button
                type="button"
                onClick={() => setShowLowStockOnly((prev) => !prev)}
                className="tactile-press h-9 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 border shrink-0 transition-colors"
                style={{
                  backgroundColor: showLowStockOnly ? 'var(--warning)' : 'var(--warning-soft)',
                  borderColor: showLowStockOnly ? 'var(--warning)' : 'rgba(245, 158, 11, 0.3)',
                  color: showLowStockOnly ? '#09090B' : 'var(--warning)'
                }}
                title="Toggle Low Stock items filter"
              >
                <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="font-mono font-bold">({lowStockCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAddProduct}
              className="tactile-press h-9 px-3 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              <Plus className="w-4 h-4" strokeWidth={2.2} />
              <span className="hidden sm:inline">New Item</span>
            </button>
          </div>

          {/* Row 2: Horizontal Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === 'All Items'
                  ? products.length
                  : products.filter((p) => p.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="tactile-press px-3 py-1 rounded-lg text-[11.5px] font-semibold whitespace-nowrap flex items-center gap-1.5 border transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-hairline)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  <span>{cat}</span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                    style={{
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-subtle)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Product Grid */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3.5">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center pos-surface flex flex-col items-center justify-center gap-2">
              <Search className="w-7 h-7" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
              <p className="font-semibold text-xs" style={{ color: 'var(--text-secondary)' }}>
                No matching products found
              </p>
              {showLowStockOnly && (
                <button
                  type="button"
                  onClick={() => setShowLowStockOnly(false)}
                  className="text-xs font-semibold underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Show all products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cartItems.find((c) => c.productId === product.id);
                const inCartQty = inCart ? inCart.quantity : 0;

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onUpdateQty={onUpdateCartQty}
                    inCartQty={inCartQty}
                    onOpenRestockModal={onOpenRestockModal}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Compact Counter Hotkey Footer */}
        <div
          className="px-4 sm:px-5 py-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10.5px] shrink-0"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            borderColor: 'var(--border-hairline)',
            color: 'var(--text-muted)'
          }}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Keyboard className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>
              Showing <strong className="font-mono">{filteredProducts.length}</strong> of{' '}
              <strong className="font-mono">{inventoryStats?.totalProductsCount || products.length}</strong> SKUs
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 font-mono text-[10px]">
            <span>
              <kbd className="px-1.5 py-0.5 rounded border font-semibold" style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}>
                F1
              </kbd>{' '}
              Search
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border font-semibold" style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}>
                F2
              </kbd>{' '}
              Charge
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border font-semibold" style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}>
                F4
              </kbd>{' '}
              Clear
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border font-semibold" style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}>
                F9
              </kbd>{' '}
              Theme
            </span>
          </div>
        </div>
      </div>

      {/* Right: Pinned Full-Height Cashier Checkout Rail */}
      <div className="w-full lg:w-[376px] xl:w-[404px] shrink-0 lg:h-full lg:min-h-0 px-4 pb-6 lg:p-0">
        <CartSidebar
          cartItems={cartItems}
          cartTotals={cartTotals}
          flatDiscount={flatDiscount}
          onSetFlatDiscount={onSetFlatDiscount}
          onUpdateQty={onUpdateCartQty}
          onUpdateSerial={onUpdateCartSerial}
          onRemoveItem={onRemoveCartItem}
          onClearCart={onClearCart}
          onOpenCheckout={onOpenCheckout}
          currentUser={currentUser}
          preferredPaymentMethod={preferredPaymentMethod}
          onSelectPaymentMethod={onSelectPaymentMethod}
          dues={dues}
          selectedCartCustomer={selectedCartCustomer}
          onSelectCartCustomer={onSelectCartCustomer}
          parkedOrders={parkedOrders}
          onParkOrder={onParkOrder}
          onRetrieveParkedOrder={onRetrieveParkedOrder}
          onDeleteParkedOrder={onDeleteParkedOrder}
        />
      </div>

      {/* Custom Sale / Service Repair Modal (Shopify Custom Sale pattern) */}
      {isCustomSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSubmitCustomSale}
            className="w-full max-w-md rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-strong)',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            <div
              className="px-5 py-3.5 border-b flex items-center justify-between"
              style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-hairline)' }}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Add Custom Sale / Service
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomSaleOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Item or Service Description *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Display Replacement Service / Tempered Glass"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Selling Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="500"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="pos-input w-full px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Cost (৳, optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="pos-input w-full px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Warranty Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7 Days Service Warranty"
                  value={customWarranty}
                  onChange={(e) => setCustomWarranty(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div
              className="px-5 py-3 border-t flex justify-end gap-2"
              style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-hairline)' }}
            >
              <button
                type="button"
                onClick={() => setIsCustomSaleOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold"
                style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tactile-press px-4 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add to Order</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
