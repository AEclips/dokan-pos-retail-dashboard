import React, { useState } from 'react';
import { Search, Printer, RotateCcw } from 'lucide-react';
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
    const matchesSearch =
      !q ||
      s.id.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      (s.customerPhone && s.customerPhone.includes(q)) ||
      (s.items && s.items.some((i) => i.serialNumber && i.serialNumber.toLowerCase().includes(q)));

    const matchesMethod = selectedMethod === 'all' || s.paymentMethod === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const getMethodPillStyle = (method) => {
    switch (method) {
      case 'bkash':
        return { backgroundColor: 'rgba(226, 19, 110, 0.14)', color: '#F472B6', borderColor: 'rgba(226, 19, 110, 0.28)' };
      case 'nagad':
        return { backgroundColor: 'rgba(242, 101, 34, 0.14)', color: '#FB923C', borderColor: 'rgba(242, 101, 34, 0.28)' };
      case 'due':
        return { backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'rgba(16, 185, 129, 0.28)' };
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search invoice ID, customer, phone, or IMEI/SN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pos-input w-full pl-9 pr-3 py-2 text-xs font-medium"
            />
          </div>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="pos-input px-3 py-2 text-xs font-medium cursor-pointer"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash Only</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="due">Due / Baki</option>
            <option value="card">Card</option>
          </select>
        </div>

        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {filteredSales.length} transaction(s)
        </span>
      </div>

      {/* Transactions Table */}
      <div className="pos-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[10px] font-bold uppercase tracking-wider"
                style={{
                  borderColor: 'var(--border-hairline)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-muted)'
                }}
              >
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

            <tbody className="[&>*+*]:border-t [&>*+*]:border-[var(--border-hairline)]">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const serialList = (s.items || [])
                    .map((i) => i.serialNumber)
                    .filter(Boolean);
                  return (
                    <tr
                      key={s.id}
                      className="transition-colors hover:bg-[var(--bg-elevated)]"
                    >
                      <td className="py-3 px-4 font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                        <div>{s.id}</div>
                        {serialList.length > 0 && (
                          <div className="text-[10px] font-normal mt-0.5" style={{ color: 'var(--accent)' }}>
                            SN: {serialList[0]}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {formatDateTime(s.timestamp)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {s.customerName || 'Walk-in'}
                        </div>
                        {s.customerPhone && s.customerPhone !== '—' && (
                          <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {s.customerPhone}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {s.items?.reduce((acc, itm) => acc + (parseInt(itm.quantity) || 1), 0)} pcs
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className="px-2 py-0.5 rounded-md border font-semibold uppercase text-[10px]"
                          style={getMethodPillStyle(s.paymentMethod)}
                        >
                          {s.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(s.grandTotal)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold" style={{ color: 'var(--accent)' }}>
                        +{formatCurrency(s.netProfit)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(s)}
                            className="tactile-press px-2.5 py-1 rounded-lg border font-semibold text-xs flex items-center gap-1 transition-colors hover:bg-[var(--bg-hover)]"
                            style={{
                              backgroundColor: 'var(--bg-subtle)',
                              borderColor: 'var(--border-hairline)',
                              color: 'var(--text-primary)'
                            }}
                            title="Print Receipt"
                          >
                            <Printer className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                            <span>Receipt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRefundSale(s.id)}
                            className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                            style={{ color: 'var(--text-muted)' }}
                            title="Void / Refund Sale"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
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
