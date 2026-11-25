import React from 'react';
import {
  Plus,
  Minus,
  Zap,
  Cable,
  Headphones,
  BatteryCharging,
  Shield,
  Watch,
  HardDrive,
  Car,
  Package,
  ShieldCheck,
  PackagePlus
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_THEME = {
  'Chargers & Adapters': { icon: Zap, color: '#F59E0B', rgb: '245, 158, 11' },
  'Cables & Converters': { icon: Cable, color: '#F43F5E', rgb: '244, 63, 94' },
  'Audio & Earphones': { icon: Headphones, color: '#8B5CF6', rgb: '139, 92, 246' },
  'Power Banks': { icon: BatteryCharging, color: '#10B981', rgb: '16, 185, 129' },
  'Cases & Protection': { icon: Shield, color: '#6366F1', rgb: '99, 102, 241' },
  Smartwatches: { icon: Watch, color: '#06B6D4', rgb: '6, 182, 212' },
  'Memory & Storage': { icon: HardDrive, color: '#0EA5E9', rgb: '14, 165, 233' },
  'Car & Mounts': { icon: Car, color: '#F97316', rgb: '249, 115, 22' }
};

function formatShortWarranty(warranty) {
  if (!warranty) return null;
  return warranty
    .replace(/Replacement/i, 'Repl.')
    .replace(/Official/i, 'Official')
    .replace(/Brand Warranty/i, 'Brand')
    .replace(/Check Warranty/i, 'Check')
    .replace(/Testing Warranty/i, 'Testing')
    .replace(/Months/i, 'M')
    .replace(/Month/i, 'M')
    .replace(/Years/i, 'Y')
    .replace(/Year/i, 'Y');
}

export default function ProductCard({
  product,
  onAddToCart,
  onUpdateQty,
  inCartQty = 0,
  onOpenRestockModal
}) {
  const threshold = product.minStockAlert || 5;
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= threshold;
  const remainingAvailable = Math.max(0, product.stockQuantity - inCartQty);

  const theme = CATEGORY_THEME[product.category] || {
    icon: Package,
    color: '#10B981',
    rgb: '16, 185, 129'
  };
  const CategoryIcon = theme.icon;

  const stockDotColor = isOutOfStock
    ? 'var(--danger)'
    : isLowStock
    ? 'var(--warning)'
    : 'var(--accent)';

  const stockLabel = isOutOfStock
    ? 'Out'
    : isLowStock
    ? `Low · ${product.stockQuantity}`
    : `${product.stockQuantity} in stock`;

  const shortWarranty = formatShortWarranty(product.warranty);

  return (
    <div
      onClick={() => {
        if (!isOutOfStock && remainingAvailable > 0) {
          onAddToCart(product);
        }
      }}
      className={`pos-surface p-3.5 flex flex-col justify-between gap-3 relative group select-none ${
        isOutOfStock
          ? 'opacity-55 cursor-not-allowed border-dashed'
          : 'cursor-pointer pos-surface-interactive'
      }`}
      style={{
        borderColor:
          inCartQty > 0
            ? 'var(--accent)'
            : isLowStock && !isOutOfStock
            ? 'rgba(245, 158, 11, 0.38)'
            : 'var(--border-hairline)',
        boxShadow:
          inCartQty > 0
            ? '0 0 0 1px var(--accent), 0 8px 20px -10px rgba(16, 185, 129, 0.32)'
            : undefined
      }}
    >
      {/* Top Row: Category Icon + Brand on left, Stock Pill on right */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `rgba(${theme.rgb}, 0.12)`,
              borderColor: `rgba(${theme.rgb}, 0.24)`,
              color: theme.color
            }}
          >
            <CategoryIcon className="w-3.5 h-3.5" strokeWidth={1.9} />
          </div>
          <span
            className="text-[11px] font-semibold truncate"
            style={{ color: 'var(--text-secondary)' }}
          >
            {product.brand}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tabular-nums border"
            style={{
              backgroundColor: isOutOfStock
                ? 'var(--danger-soft)'
                : isLowStock
                ? 'var(--warning-soft)'
                : 'var(--bg-subtle)',
              borderColor: isOutOfStock
                ? 'rgba(244, 63, 94, 0.25)'
                : isLowStock
                ? 'rgba(245, 158, 11, 0.25)'
                : 'var(--border-hairline)',
              color: isOutOfStock
                ? 'var(--danger)'
                : isLowStock
                ? 'var(--warning)'
                : 'var(--text-secondary)'
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: stockDotColor }}
            />
            <span>{stockLabel}</span>
          </span>

          {(isLowStock || isOutOfStock) && onOpenRestockModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRestockModal(product);
              }}
              className="tactile-press p-1 rounded-md border transition-colors hover:opacity-85"
              style={{
                backgroundColor: 'var(--warning-soft)',
                borderColor: 'rgba(245, 158, 11, 0.28)',
                color: 'var(--warning)'
              }}
              title="Quick Restock"
              aria-label={`Restock ${product.name}`}
            >
              <PackagePlus className="w-3 h-3" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Middle: Product Title + Monospace SKU & Warranty Chip */}
      <div className="space-y-1.5">
        <h4
          className="font-bold text-[13px] line-clamp-2 leading-snug min-h-[2.3rem]"
          style={{ color: 'var(--text-primary)' }}
        >
          {product.name}
        </h4>

        <div className="flex items-center justify-between gap-2 text-[10.5px]">
          <span
            className="font-mono truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {product.sku}
          </span>

          {shortWarranty && (
            <span
              title={product.warranty}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-medium shrink-0 border"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)'
              }}
            >
              <ShieldCheck className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={2} />
              <span>{shortWarranty}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer: Tabular Price + Add / Inline Stepper */}
      <div
        className="pt-2.5 border-t flex items-center justify-between gap-2"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div
          className="text-lg font-extrabold font-mono tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {formatCurrency(product.sellingPrice)}
        </div>

        {inCartQty > 0 && onUpdateQty ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center rounded-lg border h-[34px] overflow-hidden"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'rgba(16, 185, 129, 0.35)'
            }}
          >
            <button
              type="button"
              onClick={() => onUpdateQty(product.id, inCartQty - 1)}
              aria-label="Decrease quantity"
              className="tactile-press w-8 h-full flex items-center justify-center transition-colors hover:bg-black/10"
              style={{ color: 'var(--accent)' }}
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2.25} />
            </button>
            <span
              className="w-7 text-center font-mono font-bold text-xs"
              style={{ color: 'var(--text-primary)' }}
            >
              {inCartQty}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(product.id, inCartQty + 1)}
              disabled={remainingAvailable <= 0}
              aria-label="Increase quantity"
              className="tactile-press w-8 h-full flex items-center justify-center transition-colors hover:bg-black/10 disabled:opacity-35"
              style={{ color: 'var(--accent)' }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.25} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isOutOfStock || remainingAvailable <= 0}
            className="tactile-press min-h-[34px] px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-colors disabled:opacity-40"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)'
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
