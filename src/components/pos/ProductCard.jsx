import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function ProductCard({ product, onAddToCart, inCartQty = 0 }) {
  const threshold = product.minStockAlert || 5;
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= threshold;
  const remainingAvailable = Math.max(0, product.stockQuantity - inCartQty);

  return (
    <div 
      onClick={() => {
        if (!isOutOfStock && remainingAvailable > 0) {
          onAddToCart(product);
        }
      }}
      className={`saas-card p-4 flex flex-col justify-between cursor-pointer group relative transition-all duration-150 ${
        isOutOfStock 
          ? 'opacity-50 cursor-not-allowed border-dashed' 
          : isLowStock
            ? 'border-amber-300/80 dark:border-amber-800/80 hover:border-amber-400 hover:-translate-y-0.5'
            : 'hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-0.5 active:scale-[0.99]'
      }`}
    >
      {/* Top Meta: Category & Low-Stock Warning Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
          {product.category}
        </span>

        {isOutOfStock ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center space-x-1 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Low Stock ({product.stockQuantity} left)</span>
          </span>
        ) : (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
            Stock: {product.stockQuantity}
          </span>
        )}
      </div>

      {/* Product Title & Code */}
      <div className="my-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl select-none">{product.imageEmoji || '📦'}</span>
          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
            {product.name}
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400 font-mono">
          <span className="font-semibold text-slate-600 dark:text-slate-300">{product.brand}</span>
          <span>•</span>
          <span>{product.sku}</span>
        </div>
      </div>

      {/* Price & Add Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-1">
        <div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Price</div>
          <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white">
            {formatCurrency(product.sellingPrice)}
          </div>
        </div>

        <button
          disabled={isOutOfStock || remainingAvailable <= 0}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 ${
            inCartQty > 0
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          {inCartQty > 0 ? (
            <span className="font-mono">{inCartQty} in cart</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
