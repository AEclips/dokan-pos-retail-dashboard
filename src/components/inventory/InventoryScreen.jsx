import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  PackagePlus, 
  AlertTriangle, 
  ShieldAlert,
  Percent,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import { formatCurrency } from '../../utils/formatters';
import { calculateProfitMargin } from '../../utils/posCalculations';
import { canDeleteProducts, isOwner } from '../../utils/cryptoAuth';

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
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'low' | 'out' | 'high_margin'

  const isUserOwner = isOwner(currentUser);
  const allowDelete = canDeleteProducts(currentUser);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All Items' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
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

  // Quick export catalog to CSV
  const handleExportCatalogCsv = () => {
    const headers = ['Name', 'Category', 'SKU', 'Brand', 'CostPrice', 'SellingPrice', 'Stock'];
    const rows = products.map(p => [
      `"${p.name}"`,
      `"${p.category}"`,
      p.sku,
      `"${p.brand}"`,
      p.buyingPrice,
      p.sellingPrice,
      p.stockQuantity
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DokanPOS_Product_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Inventory KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="saas-card p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Total Catalog
          </span>
          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {inventoryStats.totalProductsCount}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {inventoryStats.totalStockUnits} total items in store
            </span>
          </div>
        </div>

        {/* Cost Value (Owner only vs Total Units for Staff) */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {isUserOwner ? 'Cost Capital Tied' : 'Available Stock Units'}
          </span>
          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {isUserOwner ? formatCurrency(inventoryStats.totalCostValue) : `${inventoryStats.totalStockUnits} pcs`}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {isUserOwner ? 'Purchasing investment value' : 'Ready for billing'}
            </span>
          </div>
        </div>

        {/* Expected Yield (Owner only vs Categories for Staff) */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {isUserOwner ? 'Expected Retail Yield' : 'Product Categories'}
          </span>
          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {isUserOwner ? formatCurrency(inventoryStats.totalRetailValue) : `${PRODUCT_CATEGORIES.length - 1} Categories`}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {isUserOwner ? `Profit potential: +${formatCurrency(inventoryStats.potentialGrossProfit)}` : 'Across product lines'}
            </span>
          </div>
        </div>

        <div className="saas-card p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Low Stock Attention
          </span>
          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              {inventoryStats.lowStockCount}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {inventoryStats.outOfStockCount} out-of-stock items
            </span>
          </div>
        </div>

      </div>

      {/* Filter & Action Bar */}
      <div className="saas-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, SKU barcode, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-medium dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white cursor-pointer"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Filter Status Chips */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({products.length})
            </button>

            <button
              onClick={() => setActiveFilter('low')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                activeFilter === 'low'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Low ({inventoryStats.lowStockCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('high_margin')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                activeFilter === 'high_margin'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>High Margin (&gt;30%)</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCatalogCsv}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition"
            title="Download Product Catalog as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV Export</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        </div>

      </div>

      {/* Clean Inventory Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category & SKU</th>
                {isUserOwner && <th className="py-3 px-4 text-right">Cost Price</th>}
                <th className="py-3 px-4 text-right">Retail Price</th>
                {isUserOwner && <th className="py-3 px-4 text-center">Margin</th>}
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Quick Restock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isUserOwner ? 8 : 6} className="py-12 text-center text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const margin = calculateProfitMargin(p.buyingPrice, p.sellingPrice);
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= (p.minStockAlert || 5);

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg select-none">{p.imageEmoji || '📦'}</span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.brand} • Warranty: {p.warranty || 'None'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block">
                          {p.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.sku}
                        </span>
                      </td>

                      {isUserOwner && (
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-500">
                          {formatCurrency(p.buyingPrice)}
                        </td>
                      )}

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      {isUserOwner && (
                        <td className="py-3 px-4 text-center font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {margin}%
                        </td>
                      )}

                      {/* Stock Level with health indicator */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono font-black text-sm ${
                            isOutOfStock ? 'text-rose-600' : isLow ? 'text-amber-500' : 'text-slate-900 dark:text-white'
                          }`}>
                            {p.stockQuantity}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isOutOfStock ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {isOutOfStock ? 'Out' : isLow ? 'Low' : 'OK'}
                          </span>
                        </div>
                      </td>

                      {/* 1-Click Quick Restock Buttons (+5, +10) */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => onQuickAddStock ? onQuickAddStock(p.id, 5) : onOpenRestockModal(p)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-mono font-bold transition"
                            title="Add +5 units immediately"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => onQuickAddStock ? onQuickAddStock(p.id, 10) : onOpenRestockModal(p)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[10px] font-mono font-bold transition"
                            title="Add +10 units immediately"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onOpenRestockModal(p)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                            title="Restock units"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => onOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Permission check: Only Owner can delete products */}
                          {allowDelete ? (
                            <button
                              onClick={() => onDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Delete Product (Owner Only)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span 
                              className="p-1.5 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40"
                              title="Delete disabled: Staff role cannot delete products"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
