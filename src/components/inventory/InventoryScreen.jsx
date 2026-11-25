import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  PackagePlus,
  AlertTriangle,
  Percent,
  Download,
  Package,
  Wallet,
  TrendingUp,
  Zap,
  Cable,
  Headphones,
  BatteryCharging,
  Shield,
  Watch,
  HardDrive,
  Car
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import { formatCurrency } from '../../utils/formatters';
import { calculateProfitMargin } from '../../utils/posCalculations';
import { canDeleteProducts, isOwner } from '../../utils/cryptoAuth';

const INV_CAT_THEME = {
  'Chargers & Adapters': { icon: Zap, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.14)' },
  'Cables & Converters': { icon: Cable, color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.14)' },
  'Audio & Earphones': { icon: Headphones, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.14)' },
  'Power Banks': { icon: BatteryCharging, color: '#10B981', bg: 'rgba(16, 185, 129, 0.14)' },
  'Cases & Protection': { icon: Shield, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.14)' },
  Smartwatches: { icon: Watch, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.14)' },
  'Memory & Storage': { icon: HardDrive, color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.14)' },
  'Car & Mounts': { icon: Car, color: '#F97316', bg: 'rgba(249, 115, 22, 0.14)' }
};

export default function InventoryScreen({
  products,
  inventoryStats,
  currentUser,
  onOpenAddModal,
  onOpenEditModal,
  onOpenRestockModal,
  onDeleteProduct,
  onQuickAddStock
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [activeFilter, setActiveFilter] = useState('all');

  const isUserOwner = isOwner(currentUser);
  const allowDelete = canDeleteProducts(currentUser);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All Items' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      let matchesFilter = true;
      const isLow = p.stockQuantity <= (p.minStockAlert || 5);
      const isOut = p.stockQuantity <= 0;
      const margin = calculateProfitMargin(p.buyingPrice, p.sellingPrice);

      if (activeFilter === 'low') matchesFilter = isLow && !isOut;
      if (activeFilter === 'out') matchesFilter = isOut;
      if (activeFilter === 'high_margin') matchesFilter = margin >= 30;

      return matchesCat && matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, selectedCategory, activeFilter]);

  const handleExportCatalogCsv = () => {
    const headers = ['Name', 'Category', 'SKU', 'Brand', 'CostPrice', 'SellingPrice', 'Stock'];
    const rows = products.map((p) => [
      `"${p.name}"`,
      `"${p.category}"`,
      p.sku,
      `"${p.brand}"`,
      p.buyingPrice,
      p.sellingPrice,
      p.stockQuantity
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DokanPOS_Product_Catalog_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-soft-enter">
      {/* Unified KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="pos-surface p-4 flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.14)', color: '#6366F1' }}
          >
            <Package className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Catalog
            </div>
            <div className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {inventoryStats.totalProductsCount}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {inventoryStats.totalStockUnits} total items
            </div>
          </div>
        </div>

        <div className="pos-surface p-4 flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(6, 182, 212, 0.14)', color: '#06B6D4' }}
          >
            <Wallet className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isUserOwner ? 'Cost Capital Tied' : 'Available Units'}
            </div>
            <div className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {isUserOwner
                ? formatCurrency(inventoryStats.totalCostValue)
                : `${inventoryStats.totalStockUnits} pcs`}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {isUserOwner ? 'Purchasing value' : 'Ready for billing'}
            </div>
          </div>
        </div>

        <div className="pos-surface p-4 flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.14)', color: '#10B981' }}
          >
            <TrendingUp className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              {isUserOwner ? 'Expected Retail Yield' : 'Categories'}
            </div>
            <div className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--accent)' }}>
              {isUserOwner
                ? formatCurrency(inventoryStats.totalRetailValue)
                : `${PRODUCT_CATEGORIES.length - 1}`}
            </div>
            <div className="text-[10px] font-medium" style={{ color: 'var(--accent)' }}>
              {isUserOwner
                ? `Profit: +${formatCurrency(inventoryStats.potentialGrossProfit)}`
                : 'Active product lines'}
            </div>
          </div>
        </div>

        <div className="pos-surface p-4 flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--warning-soft)', color: 'var(--warning)' }}
          >
            <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
              Low Stock Attention
            </div>
            <div className="text-xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--warning)' }}>
              {inventoryStats.lowStockCount}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {inventoryStats.outOfStockCount} out-of-stock
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="pos-surface p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search product, SKU barcode, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pos-input w-full pl-9 pr-3 py-2 text-xs font-medium"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pos-input px-3 py-2 text-xs font-medium cursor-pointer"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="tactile-press px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: activeFilter === 'all' ? 'var(--text-primary)' : 'var(--bg-subtle)',
                color: activeFilter === 'all' ? 'var(--bg-surface)' : 'var(--text-secondary)'
              }}
            >
              All ({products.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('low')}
              className="tactile-press px-2.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: activeFilter === 'low' ? 'var(--warning)' : 'var(--warning-soft)',
                color: activeFilter === 'low' ? '#FFFFFF' : 'var(--warning)'
              }}
            >
              <AlertTriangle className="w-3 h-3" strokeWidth={1.75} />
              <span>Low ({inventoryStats.lowStockCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('high_margin')}
              className="tactile-press px-2.5 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: activeFilter === 'high_margin' ? 'var(--accent)' : 'var(--accent-soft)',
                color: activeFilter === 'high_margin' ? '#FFFFFF' : 'var(--accent)'
              }}
            >
              <Percent className="w-3 h-3" strokeWidth={1.75} />
              <span>High Margin (&gt;30%)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCatalogCsv}
            className="tactile-press px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)'
            }}
            title="Download Product Catalog as CSV"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">CSV Export</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="tactile-press px-3.5 py-2 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="pos-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  borderColor: 'var(--border-hairline)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-muted)'
                }}
              >
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category & SKU</th>
                {isUserOwner && <th className="py-3 px-4 text-right">Cost</th>}
                <th className="py-3 px-4 text-right">Retail</th>
                {isUserOwner && <th className="py-3 px-4 text-center">Margin</th>}
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Quick Restock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="[&>*+*]:border-t [&>*+*]:border-[var(--border-hairline)]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={isUserOwner ? 8 : 6}
                    className="py-12 text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const margin = calculateProfitMargin(p.buyingPrice, p.sellingPrice);
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockAlert || 5);
                  const catTheme = INV_CAT_THEME[p.category] || {
                    icon: Package,
                    color: '#10B981',
                    bg: 'rgba(16, 185, 129, 0.14)'
                  };
                  const CatIcon = catTheme.icon;

                  return (
                    <tr key={p.id} className="transition-colors hover:bg-[var(--bg-subtle)]/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: catTheme.bg, color: catTheme.color }}
                          >
                            <CatIcon className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {p.name}
                            </div>
                            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {p.brand} · Warranty: {p.warranty || 'None'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium block" style={{ color: 'var(--text-secondary)' }}>
                          {p.category}
                        </span>
                        <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {p.sku}
                        </span>
                      </td>

                      {isUserOwner && (
                        <td className="py-3 px-4 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {formatCurrency(p.buyingPrice)}
                        </td>
                      )}

                      <td className="py-3 px-4 text-right font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      {isUserOwner && (
                        <td className="py-3 px-4 text-center font-mono text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
                          {margin}%
                        </td>
                      )}

                      <td className="py-3 px-4 text-center">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold"
                          style={{
                            backgroundColor: isOutOfStock
                              ? 'var(--danger-soft)'
                              : isLow
                              ? 'var(--warning-soft)'
                              : 'var(--accent-soft)',
                            color: isOutOfStock
                              ? 'var(--danger)'
                              : isLow
                              ? 'var(--warning)'
                              : 'var(--accent)'
                          }}
                        >
                          {p.stockQuantity} · {isOutOfStock ? 'Out' : isLow ? 'Low' : 'OK'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => (onQuickAddStock ? onQuickAddStock(p.id, 5) : onOpenRestockModal(p))}
                            className="tactile-press px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-colors hover:bg-[var(--bg-hover)]"
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              borderColor: 'var(--border-hairline)',
                              color: 'var(--text-primary)'
                            }}
                            title="Add +5 units immediately"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => (onQuickAddStock ? onQuickAddStock(p.id, 10) : onOpenRestockModal(p))}
                            className="tactile-press px-2 py-1 rounded-lg text-[10px] font-mono font-semibold transition-colors"
                            style={{
                              backgroundColor: 'var(--accent-soft)',
                              color: 'var(--accent)'
                            }}
                            title="Add +10 units immediately"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenRestockModal(p)}
                            className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--accent-soft)]"
                            style={{ color: 'var(--accent)' }}
                            title="Restock units"
                          >
                            <PackagePlus className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEditModal(p)}
                            className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                            style={{ color: 'var(--text-secondary)' }}
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>

                          {allowDelete ? (
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(p.id, p.name)}
                              className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                              style={{ color: 'var(--text-muted)' }}
                              title="Delete Product (Owner Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 opacity-30 cursor-not-allowed"
                              style={{ color: 'var(--text-muted)' }}
                              title="Delete disabled: Staff role cannot delete products"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
