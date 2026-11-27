import React, { useState, useMemo } from 'react';
import { Printer, X, Copy, Check, MessageSquare } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const PAPER_SIZES = [
  { id: '58mm', label: '58mm', widthClass: 'max-w-[260px]' },
  { id: '80mm', label: '80mm', widthClass: 'max-w-[340px]' },
  { id: 'a4', label: 'A4', widthClass: 'max-w-[520px]' }
];

function ReceiptBarcode({ value }) {
  const bars = useMemo(() => {
    const str = String(value || 'INV-0000');
    const widths = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      widths.push((code % 3) + 1, ((code >> 2) % 2) + 1, ((code >> 4) % 3) + 1);
    }
    return widths;
  }, [value]);

  let x = 4;
  return (
    <svg
      viewBox="0 0 180 28"
      className="w-40 h-7 mx-auto"
      aria-label={`Barcode ${value}`}
    >
      {bars.map((w, idx) => {
        const currentX = x;
        x += w + 1.5;
        if (currentX > 174) return null;
        return idx % 2 === 0 ? (
          <rect key={idx} x={currentX} y={2} width={w} height={24} fill="#000000" />
        ) : null;
      })}
    </svg>
  );
}

export default function ThermalReceipt({
  isOpen,
  onClose,
  sale,
  config
}) {
  const [paperSize, setPaperSize] = useState('80mm');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !sale) return null;

  const activePaper = PAPER_SIZES.find((p) => p.id === paperSize) || PAPER_SIZES[1];
  const dueAmount = sale.paymentDetails?.dueAmount || 0;
  const paidAmount = Math.max(0, (sale.grandTotal || 0) - dueAmount);

  const handlePrint = () => {
    window.print();
  };

  const buildPlainTextReceipt = () => {
    const shop = config?.shopName || 'DokanPOS';
    const lines = [
      `${shop}`,
      `${config?.address || ''}`,
      `Tel: ${config?.phone || ''}`,
      `----------------------------`,
      `Invoice: ${sale.id}`,
      `Date: ${formatDateTime(sale.timestamp)}`,
      `Customer: ${sale.customerName || 'Walk-in'}`,
      ...sale.items.map(
        (i) => `${i.name} x${i.quantity} = ${formatCurrency(i.sellingPrice * i.quantity)}`
      ),
      `----------------------------`,
      `Grand Total: ${formatCurrency(sale.grandTotal)}`,
      `Payment: ${String(sale.paymentMethod || '').toUpperCase()}`,
      dueAmount > 0 ? `Due (Baki): ${formatCurrency(dueAmount)}` : `Status: PAID`,
      `${config?.receiptFooter || 'Thank you for shopping with us!'}`
    ];
    return lines.filter(Boolean).join('\n');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(buildPlainTextReceipt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = (sale.customerPhone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(buildPlainTextReceipt());
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto print:static print:p-0 print:bg-white print:block">
      <div
        className="relative w-full max-w-xl rounded-2xl border overflow-hidden my-4 animate-fade-in flex flex-col max-h-[92vh] print:max-h-none print:border-0 print:shadow-none print:rounded-none print:my-0"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Modal Controls (Hidden on Print) */}
        <div
          className="px-4 sm:px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-2.5 no-print shrink-0"
          style={{
            backgroundColor: 'var(--bg-sidebar)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <div>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              POS Receipt & Print Preview
            </h3>
            <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {sale.id} · {activePaper.label} layout
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Paper Width Switcher */}
            <div
              className="inline-flex rounded-lg border p-0.5"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              {PAPER_SIZES.map((sz) => {
                const isActive = paperSize === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setPaperSize(sz.id)}
                    className="tactile-press px-2 py-1 rounded-md text-[10.5px] font-mono font-bold transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopyText}
              className="tactile-press p-2 rounded-lg border transition-colors hover:bg-[var(--bg-hover)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: copied ? 'var(--accent)' : 'var(--text-secondary)'
              }}
              title="Copy Receipt Text"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {sale.customerPhone && sale.customerPhone !== '—' && (
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="tactile-press p-2 rounded-lg border transition-colors hover:bg-[var(--bg-hover)]"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  borderColor: 'rgba(16, 185, 129, 0.28)',
                  color: 'var(--accent)'
                }}
                title="Send Digital Receipt on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="tactile-press px-3.5 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {activePaper.label}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close receipt preview"
              className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center print:p-0 print:overflow-visible print:bg-white"
          style={{ backgroundColor: 'var(--bg-canvas)' }}
        >
          <div
            id="printable-receipt"
            data-paper={paperSize}
            className={`printable-receipt-container bg-white text-black p-5 rounded-xl shadow-xl border border-slate-200 w-full ${activePaper.widthClass} font-mono text-[11px] leading-tight transition-all`}
          >
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h2 className="font-black text-sm uppercase tracking-tight">
                {config?.shopName || 'TechPoint Gadgets'}
              </h2>
              {config?.tagline && (
                <p className="text-[9px] text-slate-600 mt-0.5">{config.tagline}</p>
              )}
              <p className="text-[10px] mt-1">{config?.address || 'Dhaka, Bangladesh'}</p>
              <p className="text-[10px]">Tel: {config?.phone || '+880 1712-345678'}</p>
              {config?.bkashNumber && (
                <p className="text-[9px] text-slate-700">bKash/Nagad: {config.bkashNumber}</p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="border-b border-dashed border-black pb-2 mb-2 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Invoice:</span>
                <span className="font-bold">{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{formatDateTime(sale.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold">{sale.customerName || 'Walk-in'}</span>
              </div>
              {sale.customerPhone && sale.customerPhone !== '—' && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{sale.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{sale.cashierName || 'Cashier'}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-black pb-2 mb-2">
              <div className="grid grid-cols-12 font-bold text-[10px] pb-1 border-b border-black">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Amt</span>
              </div>

              <div className="divide-y divide-dotted divide-slate-300 py-1 space-y-1.5">
                {sale.items.map((item, idx) => {
                  const itemTot = item.sellingPrice * item.quantity;
                  return (
                    <div key={idx} className="pt-1">
                      <div className="grid grid-cols-12 text-[10px] items-start">
                        <span className="col-span-6 font-semibold pr-1 leading-snug">
                          {item.name}
                        </span>
                        <span className="col-span-2 text-center">{item.quantity}</span>
                        <span className="col-span-2 text-right">{item.sellingPrice}</span>
                        <span className="col-span-2 text-right font-bold">{itemTot}</span>
                      </div>
                      {item.warranty && (
                        <div className="text-[8.5px] text-slate-600 mt-0.5">
                          Warranty: {item.warranty}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals & Payment Breakdown */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-3 mb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>

              {sale.flatDiscount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.flatDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                <span>GRAND TOTAL:</span>
                <span>{formatCurrency(sale.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-[10px] pt-1 text-slate-700 uppercase">
                <span>Payment Mode:</span>
                <span className="font-bold">{sale.paymentMethod}</span>
              </div>

              {dueAmount > 0 && (
                <>
                  <div className="flex justify-between text-[10px]">
                    <span>Paid Now:</span>
                    <span>{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Due (Baki):</span>
                    <span>{formatCurrency(dueAmount)}</span>
                  </div>
                </>
              )}

              {sale.paymentDetails?.bkashTrxId && (
                <div className="flex justify-between text-[9px]">
                  <span>TrxID:</span>
                  <span className="font-bold">{sale.paymentDetails.bkashTrxId}</span>
                </div>
              )}

              {sale.paymentDetails?.cashTendered > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Cash Tendered:</span>
                  <span>{formatCurrency(sale.paymentDetails.cashTendered)}</span>
                </div>
              )}

              {sale.paymentDetails?.changeGiven > 0 && (
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Change Given:</span>
                  <span>{formatCurrency(sale.paymentDetails.changeGiven)}</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="text-center text-[9px] text-slate-700 space-y-1.5">
              <ReceiptBarcode value={sale.id} />
              <p className="font-semibold text-[9.5px] text-black">
                {config?.receiptFooter || 'Thank you for shopping with us!'}
              </p>
              <p className="text-[8.5px] text-slate-500">*** Powered by DokanPOS BD ***</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
