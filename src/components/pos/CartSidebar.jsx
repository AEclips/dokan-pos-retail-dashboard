import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight,
  Receipt
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function CartSidebar({
  cartItems,
  cartTotals,
  flatDiscount,
  onSetFlatDiscount,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout
}) {
  const isCartEmpty = cartItems.length === 0;

  return (
    <div className="saas-card p-5 flex flex-col justify-between h-full min-h-[520px]">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Active Cart
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {cartTotals.totalItemCount} item(s) queued
              </span>
            </div>
          </div>

          {!isCartEmpty && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
              title="Clear all"
            >
              Clear
            </button>
          )}
        </div>

        {/* Item List */}
        <div className="my-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {isCartEmpty ? (
            <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cart is empty</p>
              <p className="text-[11px] text-slate-400">Tap items or scan barcode to add</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.productId}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs transition hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {formatCurrency(item.sellingPrice)} × {item.quantity} = {formatCurrency(item.sellingPrice * item.quantity)}
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bill Totals & Checkout Button */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        
        {/* Discount */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>Discount (৳):</span>
          </span>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={flatDiscount || ''}
            onChange={(e) => onSetFlatDiscount(parseFloat(e.target.value) || 0)}
            className="w-20 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-rose-500 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Subtotal */}
        <div className="flex justify-between text-xs text-slate-500">
          <span>Subtotal:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {formatCurrency(cartTotals.subtotal)}
          </span>
        </div>

        {/* Total Box */}
        <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">Payable Total</span>
            <div className="text-2xl font-black font-mono">
              {formatCurrency(cartTotals.grandTotal)}
            </div>
          </div>
          <div className="text-[10px] opacity-75 mt-0.5 flex justify-between font-mono">
            <span>Net Profit:</span>
            <span>+{formatCurrency(cartTotals.netProfit)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onOpenCheckout}
          disabled={isCartEmpty}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Complete Payment & Print</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>

    </div>
  );
}
