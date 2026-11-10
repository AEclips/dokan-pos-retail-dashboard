import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  BookOpen, 
  Layers, 
  User, 
  Phone,
  Printer,
  Sparkles,
  Calculator,
  ArrowRight,
  Coins
} from 'lucide-react';
import { PAYMENT_METHODS } from '../../constants/categories';
import { formatCurrency, generateInvoiceId } from '../../utils/formatters';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  cartTotals,
  flatDiscount,
  config,
  dues = [],
  onCompleteSale
}) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [cashTendered, setCashTendered] = useState(cartTotals.grandTotal);
  
  // Split payment amounts
  const [splitCash, setSplitCash] = useState(0);
  const [splitBkash, setSplitBkash] = useState(0);
  const [splitDue, setSplitDue] = useState(0);

  const grandTotal = cartTotals.grandTotal;
  const changeDue = Math.max(0, (parseFloat(cashTendered) || 0) - grandTotal);

  // Auto-focus and reset cash tendered when opening
  useEffect(() => {
    setCashTendered(cartTotals.grandTotal);
  }, [cartTotals.grandTotal, isOpen]);

  // Cash preset helper
  const handleCashPreset = (amount) => {
    setCashTendered(amount);
  };

  const handleFinishTransaction = () => {
    // Validate due customers
    if ((paymentMethod === 'due' || (paymentMethod === 'split' && splitDue > 0)) && !customerPhone.trim()) {
      alert('Please enter customer phone number to record Due / Baki in the ledger.');
      return;
    }

    const invoiceId = generateInvoiceId();
    const saleRecord = {
      id: invoiceId,
      timestamp: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || '—',
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        buyingPrice: item.buyingPrice,
        sellingPrice: item.sellingPrice,
        quantity: item.quantity,
        itemDiscount: item.itemDiscount || 0,
        total: item.sellingPrice * item.quantity - (item.itemDiscount || 0) * item.quantity
      })),
      subtotal: cartTotals.subtotal,
      flatDiscount: flatDiscount || 0,
      grandTotal: cartTotals.grandTotal,
      totalCost: cartTotals.totalBuyingCost,
      netProfit: cartTotals.netProfit,
      paymentMethod,
      paymentDetails: {
        cashAmount: paymentMethod === 'cash' ? grandTotal : (paymentMethod === 'split' ? splitCash : 0),
        bkashAmount: paymentMethod === 'bkash' ? grandTotal : (paymentMethod === 'split' ? splitBkash : 0),
        bkashTrxId: bkashTrxId.trim() || undefined,
        dueAmount: paymentMethod === 'due' ? grandTotal : (paymentMethod === 'split' ? splitDue : 0),
        cashTendered: paymentMethod === 'cash' ? cashTendered : undefined,
        changeGiven: paymentMethod === 'cash' ? changeDue : undefined
      },
      cashierName: 'Cashier'
    };

    // Trigger celebratory confetti
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    onCompleteSale(saleRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl saas-card bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white dark:bg-slate-950 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Checkout & Payment</h3>
              <p className="text-xs text-slate-400">Select payment channel and customer record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Bill Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Payable Total</span>
              <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Items Selected</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                {cartTotals.totalItemCount} pcs ({cartItems.length} distinct)
              </span>
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Payment Method (পরিশোধের মাধ্যম)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-sm ring-1 ring-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{pm.name}</div>
                    <div className="text-[10px] opacity-75 font-normal mt-0.5">{pm.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered & Change Return Engine */}
          {paymentMethod === 'cash' && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center space-x-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash Payment Calculator</span>
                </span>
                <span className="text-[10px] font-mono opacity-80">ভাঙতি ও ফেরত হিসাব</span>
              </div>

              {/* Quick Cash Presets (৳500, ৳1000, ৳2000, Exact) */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium mr-1">Quick Tender:</span>
                <button
                  type="button"
                  onClick={() => handleCashPreset(grandTotal)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs hover:bg-emerald-100 transition"
                >
                  Exact (৳{grandTotal})
                </button>
                {[500, 1000, 1500, 2000, 3000, 5000].filter(a => a >= grandTotal || a >= 500).slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleCashPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono font-semibold text-xs hover:bg-emerald-50 transition"
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cash Received (নগদ গ্রহণ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Change Return (ভাঙতি ফেরত)
                  </label>
                  <div className={`px-3 py-2 rounded-xl border font-mono font-black text-base flex items-center justify-between ${
                    changeDue > 0 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}>
                    <span>{formatCurrency(changeDue)}</span>
                    {changeDue > 0 && <Coins className="w-4 h-4 text-emerald-200" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* bKash / Nagad / Rocket */}
          {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
            <div className="p-4 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/50 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-pink-900 dark:text-pink-300">
                <span>Shop Wallet: <strong className="font-mono text-sm">{config.bkashNumber || '+880 1712-345678'}</strong></span>
                <span className="font-bold uppercase text-[10px] bg-pink-100 dark:bg-pink-900/60 px-2 py-0.5 rounded-md">Mobile MFS</span>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  MFS Transaction ID / TrxID (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BL984X7K2M"
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-mono text-xs dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          )}

          {/* Due / Baki Khata */}
          {paymentMethod === 'due' && (
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-300 font-bold">
                <BookOpen className="w-4 h-4" />
                <span>Customer Due / Baki Khata Ledger Entry</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-400">
                The full bill amount of <strong className="font-mono">{formatCurrency(grandTotal)}</strong> will be recorded to this customer's credit balance. Phone number is required for notification tracking.
              </p>
            </div>
          )}

          {/* Customer Metadata (Name & Phone with Recent Customers Autofill) */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            
            {/* Quick Autofill from existing customer ledger */}
            {dues && dues.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1">
                  Quick Select Recent Customer:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dues.slice(0, 4).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setCustomerName(d.customerName);
                        setCustomerPhone(d.customerPhone);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition"
                    >
                      {d.customerName} ({d.customerPhone.slice(-4)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer Name (গ্রাহকের নাম)</span>
                </label>
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone Number (মোবাইল নং)</span>
                </label>
                <input
                  type="tel"
                  placeholder="017xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel (Esc)
          </button>

          <button
            type="button"
            onClick={handleFinishTransaction}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Print Receipt (৳ {grandTotal})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
