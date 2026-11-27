import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Receipt,
  Banknote,
  Smartphone,
  BookOpen,
  UserPlus,
  PauseCircle,
  Play,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { isOwner } from '../../utils/cryptoAuth';

const QUICK_DISCOUNTS = [0, 50, 100, 200];

const QUICK_CHANNELS = [
  { id: 'cash', label: 'Cash', icon: Banknote, color: '#10B981', soft: 'rgba(16, 185, 129, 0.15)' },
  { id: 'bkash', label: 'bKash', icon: Smartphone, color: '#E2136E', soft: 'rgba(226, 19, 110, 0.16)' },
  { id: 'nagad', label: 'Nagad', icon: Smartphone, color: '#F26522', soft: 'rgba(242, 101, 34, 0.16)' },
  { id: 'due', label: 'Baki', icon: BookOpen, color: '#F59E0B', soft: 'rgba(245, 158, 11, 0.16)' }
];

export default function CartSidebar({
  cartItems,
  cartTotals,
  flatDiscount,
  onSetFlatDiscount,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  currentUser,
  preferredPaymentMethod = 'cash',
  onSelectPaymentMethod,
  dues = [],
  selectedCartCustomer,
  onSelectCartCustomer,
  parkedOrders = [],
  onParkOrder,
  onRetrieveParkedOrder,
  onDeleteParkedOrder
}) {
  const [showHeldList, setShowHeldList] = useState(false);

  const isCartEmpty = cartItems.length === 0;
  const isUserOwner = isOwner(currentUser);

  const handleCustomerChange = (e) => {
    const val = e.target.value;
    if (!val) {
      onSelectCartCustomer && onSelectCartCustomer(null);
      return;
    }
    const found = dues.find((d) => d.id === val);
    if (found && onSelectCartCustomer) {
      onSelectCartCustomer(found);
    }
  };

  return (
    <div
      className="h-full min-h-0 flex flex-col justify-between rounded-2xl border lg:rounded-none lg:border-0 lg:border-l"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-hairline)'
      }}
    >
      {/* Top: Active Order Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between gap-2 shrink-0"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'rgba(16, 185, 129, 0.25)',
              color: 'var(--accent)'
            }}
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={1.85} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                Current Order
              </h3>
              <span
                className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {cartTotals.totalItemCount}
              </span>
            </div>
            <span className="text-[10.5px] block truncate" style={{ color: 'var(--text-muted)' }}>
              {cartItems.length} {cartItems.length === 1 ? 'SKU' : 'SKUs'} · Cashier Rail
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {parkedOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHeldList((prev) => !prev)}
              className="tactile-press text-[10.5px] font-semibold px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors"
              style={{
                backgroundColor: showHeldList ? 'var(--warning)' : 'var(--warning-soft)',
                borderColor: 'rgba(245, 158, 11, 0.35)',
                color: showHeldList ? '#09090B' : 'var(--warning)'
              }}
              title="View Held / Parked Orders"
            >
              <PauseCircle className="w-3 h-3" strokeWidth={2} />
              <span>Held ({parkedOrders.length})</span>
            </button>
          )}

          {!isCartEmpty && onParkOrder && (
            <button
              type="button"
              onClick={onParkOrder}
              className="tactile-press text-[10.5px] font-semibold px-2 py-1 rounded-lg border transition-colors hover:bg-[var(--bg-hover)]"
              style={{
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)'
              }}
              title="Park / Hold Current Order"
            >
              Hold
            </button>
          )}

          {!isCartEmpty && (
            <button
              type="button"
              onClick={onClearCart}
              className="tactile-press text-[10.5px] font-semibold px-2 py-1 rounded-lg border transition-colors hover:bg-[var(--danger-soft)]"
              style={{
                borderColor: 'var(--border-hairline)',
                color: 'var(--danger)'
              }}
            >
              F4
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Held Orders Drawer */}
      {showHeldList && parkedOrders.length > 0 && (
        <div
          className="px-4 py-2.5 border-b space-y-1.5 max-h-40 overflow-y-auto shrink-0"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--warning)' }}>
            <span>Parked / Held Orders</span>
            <button
              type="button"
              onClick={() => setShowHeldList(false)}
              className="p-0.5 rounded hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {parkedOrders.map((order) => (
            <div
              key={order.id}
              className="p-2 rounded-lg border flex items-center justify-between gap-2 text-[11px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="min-w-0">
                <div className="font-mono font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {order.id} · {formatCurrency(order.total)}
                </div>
                <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {order.itemCount} items{order.customer ? ` · ${order.customer.customerName}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onRetrieveParkedOrder && onRetrieveParkedOrder(order.id);
                    setShowHeldList(false);
                  }}
                  className="tactile-press px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Restore</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteParkedOrder && onDeleteParkedOrder(order.id)}
                  className="tactile-press p-1 rounded-md hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label={`Delete ${order.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Quick-Attach Strip (CloudBari / Posware Pattern) */}
      {onSelectCartCustomer && (
        <div
          className="px-4 py-2 border-b flex items-center justify-between gap-2 shrink-0"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-hairline)'
          }}
        >
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <UserPlus className="w-3.5 h-3.5 shrink-0" style={{ color: selectedCartCustomer ? 'var(--accent)' : 'var(--text-muted)' }} />
            <select
              aria-label="Attach Customer to Order"
              value={selectedCartCustomer?.id || ''}
              onChange={handleCustomerChange}
              className="w-full bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                Walk-in Customer (Attach Baki / Profile)
              </option>
              {dues.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                  style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                >
                  {d.customerName} ({d.customerPhone})
                </option>
              ))}
            </select>
          </div>

          {selectedCartCustomer?.totalDueBalance > 0 && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 border"
              style={{
                backgroundColor: 'var(--warning-soft)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                color: 'var(--warning)'
              }}
            >
              Prev Due {formatCurrency(selectedCartCustomer.totalDueBalance)}
            </span>
          )}
        </div>
      )}

      {/* Middle: Scrollable Line Items */}
      <div className="flex-1 min-h-[110px] overflow-y-auto px-4 py-2.5">
        {isCartEmpty ? (
          <div className="h-full min-h-[170px] flex flex-col items-center justify-center text-center gap-2 px-4">
            <div
              className="w-10 h-10 rounded-xl border flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-muted)'
              }}
            >
              <Receipt className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                No items in current order
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Tap product tiles, scan SKU (F1), or add a Custom Sale
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    <span className="truncate">{item.name}</span>
                    {item.isCustom && (
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase shrink-0"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(item.sellingPrice)} × {item.quantity}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>=</span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>
                      {formatCurrency(item.sellingPrice * item.quantity)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div
                    className="inline-flex items-center rounded-lg border h-7"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-hairline)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="tactile-press w-6 h-full flex items-center justify-center rounded-l-lg hover:bg-[var(--bg-hover)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Minus className="w-3 h-3" strokeWidth={2.2} />
                    </button>
                    <span
                      className="w-6 text-center font-mono font-bold text-[11px]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                      disabled={!item.isCustom && item.quantity >= item.stockQuantity}
                      aria-label="Increase quantity"
                      className="tactile-press w-6 h-full flex items-center justify-center rounded-r-lg hover:bg-[var(--bg-hover)] disabled:opacity-30"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Plus className="w-3 h-3" strokeWidth={2.2} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.productId)}
                    aria-label="Remove item"
                    className="tactile-press w-6 h-7 rounded-lg flex items-center justify-center transition-colors opacity-65 hover:opacity-100 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Pinned Discount, Channel Pre-Select, Summary & Charge CTA */}
      <div
        className="px-4 py-3 border-t space-y-2.5 shrink-0"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-hairline)'
        }}
      >
        {/* Discount Controls */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
              <Tag className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Flat Discount (৳)</span>
            </span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={flatDiscount || ''}
              onChange={(e) => onSetFlatDiscount(parseFloat(e.target.value) || 0)}
              className="pos-input w-20 text-right px-2.5 py-1 font-mono font-semibold text-xs"
              style={{ color: flatDiscount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {QUICK_DISCOUNTS.map((amt) => {
              const isSelected = (flatDiscount || 0) === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onSetFlatDiscount(amt)}
                  className="tactile-press py-1 rounded-lg text-[10.5px] font-mono font-semibold border transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-hairline)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  ৳{amt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Click Payment Channel Quick-Select */}
        {onSelectPaymentMethod && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Payment Channel
              </span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Quick Pre-select
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {QUICK_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isSelected = preferredPaymentMethod === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onSelectPaymentMethod(ch.id)}
                    className="tactile-press py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-all"
                    style={{
                      backgroundColor: isSelected ? ch.soft : 'var(--bg-subtle)',
                      borderColor: isSelected ? ch.color : 'var(--border-hairline)',
                      color: isSelected ? ch.color : 'var(--text-secondary)'
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.9} />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bill Breakdown Box */}
        <div className="terminal-display p-3 rounded-xl space-y-1">
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(cartTotals.subtotal)}
            </span>
          </div>

          {flatDiscount > 0 && (
            <div className="flex justify-between text-[11px]" style={{ color: 'var(--danger)' }}>
              <span>Discount</span>
              <span className="font-mono font-semibold">-{formatCurrency(flatDiscount)}</span>
            </div>
          )}

          <div
            className="pt-1.5 border-t flex items-baseline justify-between gap-2"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span
              className="text-[10.5px] uppercase font-bold tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Payable Total
            </span>
            <div className="text-2xl font-extrabold font-mono tracking-tight" style={{ color: 'var(--accent)' }}>
              {formatCurrency(cartTotals.grandTotal)}
            </div>
          </div>

          {isUserOwner && (
            <div className="flex items-center justify-between text-[10.5px] font-mono">
              <span style={{ color: 'var(--text-muted)' }}>Est. Net Profit</span>
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                +{formatCurrency(cartTotals.netProfit)}
              </span>
            </div>
          )}
        </div>

        {/* Tactile 46px Charge CTA */}
        <button
          type="button"
          onClick={onOpenCheckout}
          disabled={isCartEmpty}
          className="tactile-press w-full min-h-[46px] px-4 rounded-xl text-white font-bold text-sm flex items-center justify-between transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={(e) => {
            if (!isCartEmpty) e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
        >
          <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[10px] font-bold">F2</span>
          <span className="font-mono tracking-tight">
            Charge {formatCurrency(cartTotals.grandTotal)}
          </span>
          <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
