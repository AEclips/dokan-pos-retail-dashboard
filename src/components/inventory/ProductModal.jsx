import React, { useState, useEffect } from 'react';
import { X, Package, Check, Tag, DollarSign, Layers } from 'lucide-react';
import { PRODUCT_CATEGORIES, POPULAR_BRANDS } from '../../constants/categories';
import { calculateProfitMargin } from '../../utils/posCalculations';
import { formatCurrency } from '../../utils/formatters';

export default function ProductModal({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[1] || 'Chargers & Adapters');
  const [brand, setBrand] = useState('Anker');
  const [sku, setSku] = useState('');
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(10);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [warranty, setWarranty] = useState('6 Months Replacement');
  const [imageEmoji, setImageEmoji] = useState('📦');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategory(productToEdit.category || PRODUCT_CATEGORIES[1]);
      setBrand(productToEdit.brand || 'Anker');
      setSku(productToEdit.sku || '');
      setBuyingPrice(productToEdit.buyingPrice || 0);
      setSellingPrice(productToEdit.sellingPrice || 0);
      setStockQuantity(productToEdit.stockQuantity || 0);
      setMinStockAlert(productToEdit.minStockAlert || 5);
      setWarranty(productToEdit.warranty || '6 Months Replacement');
      setImageEmoji(productToEdit.imageEmoji || '📦');
    } else {
      setName('');
      setCategory(PRODUCT_CATEGORIES[1] || 'Chargers & Adapters');
      setBrand('Anker');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setBuyingPrice(500);
      setSellingPrice(800);
      setStockQuantity(10);
      setMinStockAlert(3);
      setWarranty('6 Months Replacement');
      setImageEmoji('🔌');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const profitMargin = calculateProfitMargin(buyingPrice, sellingPrice);
  const profitPerUnit = Math.max(0, sellingPrice - buyingPrice);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }

    const savedProduct = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      name: name.trim(),
      category,
      brand: brand.trim(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      buyingPrice: parseFloat(buyingPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stockQuantity: parseInt(stockQuantity) || 0,
      minStockAlert: parseInt(minStockAlert) || 5,
      warranty: warranty.trim(),
      imageEmoji: imageEmoji.trim() || '📦'
    };

    onSaveProduct(savedProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-6 animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {productToEdit ? 'Edit Product Item' : 'Add New Inventory Product'}
              </h3>
              <p className="text-xs text-slate-400">Manage stock quantities, buying & selling prices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Product Name & Emoji Icon */}
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Icon</label>
              <input
                type="text"
                value={imageEmoji}
                onChange={(e) => setImageEmoji(e.target.value)}
                className="w-full text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-lg dark:text-white"
              />
            </div>
            <div className="col-span-5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Title (পণ্যের নাম) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anker 20W Fast Charger"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
              >
                {PRODUCT_CATEGORIES.filter(c => c !== 'All Items').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="Anker, Baseus, Remax..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
              />
            </div>
          </div>

          {/* SKU / Barcode & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Barcode Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Warranty Term</label>
              <input
                type="text"
                placeholder="e.g. 6 Months Replacement"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
              />
            </div>
          </div>

          {/* Pricing: Buying vs Selling */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Pricing & Profit Margin Engine
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Buying / Cost Price (ক্রয় মূল্য ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Selling / Retail Price (বিক্রয় মূল্য ৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            {/* Profit margin live badge */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Unit Profit: <strong className="font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(profitPerUnit)}</strong></span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                Margin: {profitMargin}%
              </span>
            </div>
          </div>

          {/* Stock Quantities & Alert */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Stock Qty (মজুদ সংখ্যা)
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-sm dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Low-Stock Alert Trigger (ন্যূনতম স্টক)
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 3)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-sm text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/30 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Product</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
