import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, BookOpen, Coins } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function RepaymentModal({
  isOpen,
  onClose,
  customerDue,
  onRecordRepayment
}) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerDue) {
      setAmount(customerDue.totalDueBalance);
    }
  }, [customerDue, isOpen]);

  if (!isOpen || !customerDue) return null;

  const maxDue = customerDue.totalDueBalance;

  const handleSubmit = (e) => {
    e.preventDefault();
    const paid = parseFloat(amount) || 0;
    if (paid <= 0) return;

    onRecordRepayment(customerDue.id, {
      id: `rep-${Date.now()}`,
      date: new Date().toISOString(),
      amountPaid: Math.min(paid, maxDue),
      paymentMethod: method,
      notes: notes.trim() || 'Customer due repayment'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md saas-card bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 bg-amber-500 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Settle Customer Due (বাকি পরিশোধ)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 text-slate-950 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {customerDue.customerName}
            </div>
            <div className="text-slate-500 mt-1 flex justify-between">
              <span>Phone: <strong className="font-mono text-slate-700 dark:text-slate-300">{customerDue.customerPhone}</strong></span>
              <span>Total Due: <strong className="font-mono text-rose-600 dark:text-rose-400 font-bold">{formatCurrency(maxDue)}</strong></span>
            </div>
          </div>

          {/* Quick Repayment Amount Presets */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Quick Amount Preset:</span>
              <button
                type="button"
                onClick={() => setAmount(maxDue)}
                className="font-bold text-amber-600 hover:underline"
              >
                Full Settle (৳{maxDue})
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[500, 1000, 1500, 2000, 5000].filter(a => a < maxDue).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 font-mono font-bold text-slate-700 dark:text-slate-300 transition"
                >
                  ৳{p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Repayment Amount (পরিশোধের পরিমাণ ৳):
            </label>
            <input
              type="number"
              min="1"
              max={maxDue}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'bkash', 'nagad'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2 rounded-xl font-bold uppercase text-[11px] transition ${
                    method === m
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes (ঐচ্ছিক মন্তব্য)</label>
            <input
              type="text"
              placeholder="e.g. Partial cash payment at shop"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs dark:text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border flex justify-between font-semibold">
            <span>Remaining Due After Payment:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatCurrency(Math.max(0, maxDue - (parseFloat(amount) || 0)))}
            </span>
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Record Repayment</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
