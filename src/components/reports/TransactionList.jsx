import React, { useState } from 'react';
import { 
  Search, 
  Printer, 
  RotateCcw
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function TransactionList({
  sales,
  onViewReceipt,
  onRefundSale
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('all');

  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      s.id.toLowerCase().includes(q) || 
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q));

    const matchesMethod = selectedMethod === 'all' || s.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-3">
      
      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice ID, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium dark:text-white cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash Only</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="due">Due / Baki</option>
            <option value="card">Card</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {filteredSales.length} transaction(s) recorded
        </span>
      </div>

      {/* Transactions Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-center">Method</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.id}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {formatDateTime(s.timestamp)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {s.customerName || 'Walk-in'}
                      </div>
                      {s.customerPhone && s.customerPhone !== '—' && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.customerPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                      {s.items?.reduce((acc, itm) => acc + (parseInt(itm.quantity) || 1), 0)} pcs
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] ${
                        s.paymentMethod === 'bkash' ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800' :
                        s.paymentMethod === 'due' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        s.paymentMethod === 'nagad' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {s.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(s.grandTotal)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(s.netProfit)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onViewReceipt(s)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1 transition"
                          title="Print 58mm Thermal Receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>

                        <button
                          onClick={() => onRefundSale(s.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Void / Refund Sale"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
