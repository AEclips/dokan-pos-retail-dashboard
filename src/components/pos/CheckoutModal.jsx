import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CreditCard,
  Banknote,
  BookOpen,
  User,
  Phone,
  Coins,
  Layers
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
  initialPaymentMethod = 'cash',
  initialCustomer = null,
  currentUser,
  config,
  dues = [],
  onCompleteSale
}) {
  const [paymentMethod, setPaymentMethod] = useState(initialPaymentMethod || 'cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [cashTendered, setCashTendered] = useState(cartTotals.grandTotal);

  const [splitCash, setSplitCash] = useState(0);
  const [splitBkash, setSplitBkash] = useState(0);
  const [splitDue, setSplitDue] = useState(0);

  const grandTotal = cartTotals.grandTotal;
  const changeDue = Math.max(0, (parseFloat(cashTendered) || 0) - grandTotal);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(initialPaymentMethod || 'cash');
      setCashTendered(cartTotals.grandTotal);
      setSplitCash(cartTotals.grandTotal);
      setSplitBkash(0);
      setSplitDue(0);
      if (initialCustomer) {
        setCustomerName(initialCustomer.customerName || '');
        setCustomerPhone(initialCustomer.customerPhone || '');
      } else {
        setCustomerName('');
        setCustomerPhone('');
      }
    }
  }, [cartTotals.grandTotal, isOpen, initialPaymentMethod, initialCustomer]);

  if (!isOpen) return null;

  const handleCashPreset = (amount) => {
    setCashTendered(amount);
  };

  const handleFinishTransaction = () => {
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
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        buyingPrice: item.buyingPrice,
        sellingPrice: item.sellingPrice,
        warranty: item.warranty || '',
        serialNumber: (item.serialNumber || '').trim(),
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
        cashAmount: paymentMethod === 'cash' ? grandTotal : paymentMethod === 'split' ? splitCash : 0,
        bkashAmount: paymentMethod === 'bkash' ? grandTotal : paymentMethod === 'split' ? splitBkash : 0,
        bkashTrxId: bkashTrxId.trim() || undefined,
        dueAmount: paymentMethod === 'due' ? grandTotal : paymentMethod === 'split' ? splitDue : 0,
        cashTendered: paymentMethod === 'cash' ? cashTendered : undefined,
        changeGiven: paymentMethod === 'cash' ? changeDue : undefined
      },
      cashierName: currentUser?.fullName || 'Cashier'
    };

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    onCompleteSale(saleRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl rounded-2xl border overflow-hidden my-6 animate-fade-in flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0 border-b"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                color: 'var(--accent)'
              }}
            >
              <CreditCard className="w-4 h-4" strokeWidth={1.9} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Checkout & Payment
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Select payment channel and customer record
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Bill Summary */}
          <div
            className="terminal-display p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <span
                className="block text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Payable Total
              </span>
              <span className="text-3xl font-extrabold font-mono" style={{ color: 'var(--accent)' }}>
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="text-right">
              <span
                className="block text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Items
              </span>
              <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {cartTotals.totalItemCount} pcs ({cartItems.length} SKUs)
              </span>
            </div>
          </div>

          {/* Payment Method Grid */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Payment Method (পরিশোধের মাধ্যম)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className="tactile-press p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border-hairline)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-secondary)'
                    }}
                  >
                    <div className="font-bold text-[11.5px]" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {pm.name}
                    </div>
                    <div className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {pm.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered Engine */}
          {paymentMethod === 'cash' && (
            <div
              className="p-4 rounded-xl border space-y-3"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'rgba(16, 185, 129, 0.25)'
              }}
            >
              <div className="flex justify-between items-center font-bold" style={{ color: 'var(--accent)' }}>
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" />
                  <span>Cash Payment Calculator</span>
                </span>
                <span className="text-[10px] font-mono">ভাঙতি ও ফেরত হিসাব</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-secondary)' }}>
                  Quick Tender:
                </span>
                <button
                  type="button"
                  onClick={() => handleCashPreset(grandTotal)}
                  className="tactile-press px-2.5 py-1 rounded-lg border font-mono font-bold text-xs"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)'
                  }}
                >
                  Exact (৳{grandTotal})
                </button>
                {[500, 1000, 1500, 2000, 3000, 5000]
                  .filter((a) => a >= grandTotal || a >= 500)
                  .slice(0, 4)
                  .map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleCashPreset(preset)}
                      className="tactile-press px-2.5 py-1 rounded-lg border font-mono font-semibold text-xs hover:bg-[var(--bg-hover)]"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      ৳{preset}
                    </button>
                  ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Cash Received (নগদ গ্রহণ)
                  </label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                    className="pos-input w-full px-3 py-2 font-mono font-bold text-base"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Change Return (ভাঙতি ফেরত)
                  </label>
                  <div
                    className="px-3 py-2 rounded-xl border font-mono font-extrabold text-base flex items-center justify-between"
                    style={{
                      backgroundColor: changeDue > 0 ? 'var(--accent)' : 'var(--bg-surface)',
                      borderColor: changeDue > 0 ? 'var(--accent)' : 'var(--border-hairline)',
                      color: changeDue > 0 ? '#FFFFFF' : 'var(--text-muted)'
                    }}
                  >
                    <span>{formatCurrency(changeDue)}</span>
                    {changeDue > 0 && <Coins className="w-4 h-4 opacity-80" />}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MFS (bKash / Nagad / Rocket) */}
          {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
            <div
              className="p-4 rounded-xl border space-y-2.5"
              style={{
                backgroundColor: 'rgba(226, 19, 110, 0.08)',
                borderColor: 'rgba(226, 19, 110, 0.25)'
              }}
            >
              <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-primary)' }}>
                <span>
                  Shop Wallet:{' '}
                  <strong className="font-mono text-sm">
                    {config?.bkashNumber || '+880 1712-345678'}
                  </strong>
                </span>
                <span
                  className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: 'rgba(226, 19, 110, 0.16)', color: '#F472B6' }}
                >
                  Mobile MFS
                </span>
              </div>
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  MFS Transaction ID / TrxID (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BL984X7K2M"
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  className="pos-input w-full px-3 py-2 font-mono text-xs uppercase"
                />
              </div>
            </div>
          )}

          {/* Due / Baki Khata */}
          {paymentMethod === 'due' && (
            <div
              className="p-4 rounded-xl border space-y-1.5"
              style={{
                backgroundColor: 'var(--warning-soft)',
                borderColor: 'rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--warning)' }}>
                <BookOpen className="w-4 h-4" />
                <span>Customer Due / Baki Khata Entry</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Full bill of <strong className="font-mono">{formatCurrency(grandTotal)}</strong> will be logged to customer credit. Phone number is required.
              </p>
            </div>
          )}

          {/* Split Payment */}
          {paymentMethod === 'split' && (
            <div
              className="p-4 rounded-xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="flex items-center justify-between font-bold" style={{ color: 'var(--text-primary)' }}>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span>Split Payment Breakdown</span>
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Total: {formatCurrency(splitCash + splitBkash + splitDue)} / {formatCurrency(grandTotal)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    Cash (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={splitCash}
                    onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                    className="pos-input w-full px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    bKash (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={splitBkash}
                    onChange={(e) => setSplitBkash(parseFloat(e.target.value) || 0)}
                    className="pos-input w-full px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    Baki/Due (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={splitDue}
                    onChange={(e) => setSplitDue(parseFloat(e.target.value) || 0)}
                    className="pos-input w-full px-2.5 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Metadata */}
          <div
            className="space-y-3 pt-2 border-t"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {dues && dues.length > 0 && (
              <div>
                <span className="text-[10.5px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Quick Select Customer:
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
                      className="tactile-press px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors hover:bg-[var(--bg-hover)]"
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {d.customerName} ({d.customerPhone.slice(-4)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <span>Customer Name (নাম)</span>
                </label>
                <input
                  type="text"
                  placeholder="Walk-in Customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <span>Phone Number (মোবাইল)</span>
                </label>
                <input
                  type="tel"
                  placeholder="017xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3.5 border-t flex items-center justify-between shrink-0"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="tactile-press px-4 py-2 rounded-xl font-semibold text-xs border transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
          >
            Cancel · Esc
          </button>

          <button
            type="button"
            onClick={handleFinishTransaction}
            className="tactile-press px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/25"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            <Check className="w-4 h-4" strokeWidth={2.2} />
            <span>Confirm & Print ({formatCurrency(grandTotal)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
