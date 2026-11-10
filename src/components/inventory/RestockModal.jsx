import React, { useState } from 'react';
import { X, Plus, PackagePlus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function RestockModal({
  isOpen,
  onClose,
  product,
  onAddStock
}) {
  const [addQty, setAddQty] = useState(10);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(addQty) || 0;
    if (qty <= 0) return;
    onAddStock(product.id, qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PackagePlus className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Quick Restock Batch</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="font-bold text-sm text-slate-900 dark:text-white">{product.name}</div>
            <div className="text-slate-500 mt-1 flex justify-between">
              <span>SKU: <strong className="font-mono">{product.sku}</strong></span>
              <span>Current Stock: <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{product.stockQuantity} pcs</strong></span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity to Add to Stock (নতুন যুক্ত করার সংখ্যা):
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="500"
                value={addQty}
                onChange={(e) => setAddQty(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold dark:text-white text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex justify-between font-semibold">
            <span>New Projected Stock:</span>
            <span className="font-mono font-black">{product.stockQuantity + (parseInt(addQty) || 0)} pcs</span>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Confirm Restock</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
