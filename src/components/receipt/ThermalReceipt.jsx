import React from 'react';
import { Printer, X } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function ThermalReceipt({
  isOpen,
  onClose,
  sale,
  config
}) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden my-6 animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Modal Controls */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">Thermal POS Receipt</h3>
            <p className="text-xs text-slate-400 font-mono">{sale.id}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-emerald-600/25"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 58mm Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 dark:bg-slate-950/50 flex justify-center">
          
          <div 
            id="printable-receipt" 
            className="printable-receipt-container bg-white text-black p-5 rounded-2xl shadow-lg border border-slate-200 w-full max-w-[340px] font-mono text-[11px] leading-tight"
          >
            {/* Store Header */}
            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h2 className="font-black text-sm uppercase tracking-tight">
                {config.shopName || 'TechPoint Gadgets'}
              </h2>
              <p className="text-[10px] mt-0.5">{config.address || 'Dhaka, Bangladesh'}</p>
              <p className="text-[10px]">Tel: {config.phone || '+880 1712-345678'}</p>
              {config.bkashNumber && (
                <p className="text-[9px] text-slate-600">bKash: {config.bkashNumber}</p>
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
                <span>{sale.customerName || 'Walk-in'}</span>
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
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              <div className="divide-y divide-dotted divide-slate-300 py-1 space-y-1">
                {sale.items.map((item, idx) => {
                  const itemTot = item.sellingPrice * item.quantity;
                  return (
                    <div key={idx} className="grid grid-cols-12 text-[10px] pt-1">
                      <span className="col-span-6 truncate font-medium">{item.name}</span>
                      <span className="col-span-2 text-center">{item.quantity}</span>
                      <span className="col-span-2 text-right">{item.sellingPrice}</span>
                      <span className="col-span-2 text-right font-bold">{itemTot}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals & Discounts */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-3 mb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>

              {sale.flatDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
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

              {sale.paymentDetails?.bkashTrxId && (
                <div className="flex justify-between text-[9px]">
                  <span>TrxID:</span>
                  <span className="font-bold">{sale.paymentDetails.bkashTrxId}</span>
                </div>
              )}

              {sale.paymentDetails?.changeGiven > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Change Given:</span>
                  <span>{formatCurrency(sale.paymentDetails.changeGiven)}</span>
                </div>
              )}
            </div>

            {/* Receipt Footer Message */}
            <div className="text-center text-[9px] text-slate-600 space-y-1">
              <p>{config.receiptFooter || 'Thank you for shopping with us!'}</p>
              <p className="font-bold">*** DokanPOS BD ***</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
