import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  TrendingUp,
  AlertTriangle,
  Database,
  ChevronRight,
  FileSpreadsheet,
  LogOut,
  ShoppingBag,
  Wallet,
  Printer
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { isOwner } from '../utils/cryptoAuth';

export default function Header({
  activeTab,
  config,
  analytics,
  inventoryStats,
  duesSummary,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  onOpenMobile,
  onNavigateTab,
  lastSale,
  onOpenLastReceipt,
  onExportBackup,
  onExportReport
}) {
  const isUserOwner = isOwner(currentUser);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pos':
        return 'POS Billing Terminal';
      case 'inventory':
        return 'Inventory & Stock';
      case 'dues':
        return 'Baki Khata (Dues)';
      case 'reports':
        return 'Executive Analytics';
      case 'settings':
        return 'Settings & Staff';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header
      className="sticky top-0 z-30 w-full backdrop-blur-xl border-b transition-colors no-print"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-canvas) 88%, transparent)',
        borderColor: 'var(--border-hairline)'
      }}
    >
      <div className="px-4 sm:px-5 h-14 flex items-center justify-between gap-3">
        {/* Left: Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl transition-colors hover:bg-[var(--bg-hover)] shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <div className="flex items-center gap-1.5 text-xs min-w-0">
            <span
              className="font-medium hidden sm:inline truncate"
              style={{ color: 'var(--text-muted)' }}
            >
              {config?.shopName || 'Store'}
            </span>
            <ChevronRight
              className="w-3.5 h-3.5 hidden sm:inline shrink-0"
              style={{ color: 'var(--text-muted)' }}
              strokeWidth={1.75}
            />
            <h2
              className="font-bold text-sm tracking-tight truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {getTabTitle()}
            </h2>
            <span
              className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ml-1.5"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'rgba(16, 185, 129, 0.24)',
                color: 'var(--accent)'
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              <span>Online</span>
            </span>
          </div>
        </div>

        {/* Right: 5-Second Rule Compact Shift Ticker + Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isUserOwner ? (
            <div
              className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg border text-[11px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.9} />
                <span style={{ color: 'var(--text-muted)' }}>Sales</span>
                <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(analytics.todayRevenue)}
                </span>
              </span>
              <span className="w-px h-3.5" style={{ backgroundColor: 'var(--border-hairline)' }} />
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.9} />
                <span style={{ color: 'var(--text-muted)' }}>Profit</span>
                <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                  +{formatCurrency(analytics.todayProfit)}
                </span>
              </span>
            </div>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <ShoppingBag className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
              <span style={{ color: 'var(--text-muted)' }}>Shift Orders</span>
              <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                {analytics.todaySalesCount}
              </span>
            </div>
          )}

          {inventoryStats.lowStockCount > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('inventory')}
              className="tactile-press hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--warning-soft)',
                color: 'var(--warning)'
              }}
              title="View low stock items in Inventory"
            >
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.9} />
              <span className="font-mono">{inventoryStats.lowStockCount} Low</span>
            </button>
          )}

          {isUserOwner && duesSummary?.totalDuesBalance > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('dues')}
              className="tactile-press hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors hover:bg-[var(--bg-subtle)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)'
              }}
              title="Open Baki Khata"
            >
              <span>Baki</span>
              <span className="font-mono font-bold" style={{ color: 'var(--danger)' }}>
                {formatCurrency(duesSummary.totalDuesBalance)}
              </span>
            </button>
          )}

          {lastSale && onOpenLastReceipt && (
            <button
              type="button"
              onClick={onOpenLastReceipt}
              className="tactile-press px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors hover:bg-[var(--bg-hover)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)'
              }}
              title={`Re-print Last Receipt (${lastSale.id})`}
            >
              <Printer className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.85} />
              <span className="hidden lg:inline">Last Receipt</span>
            </button>
          )}

          {isUserOwner && onExportReport && (
            <button
              type="button"
              onClick={onExportReport}
              className="tactile-press px-3 py-1.5 rounded-lg text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              title="Download Sales Report (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" strokeWidth={1.85} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {isUserOwner && (
            <button
              type="button"
              onClick={onExportBackup}
              className="tactile-press w-8 h-8 rounded-lg border flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)'
              }}
              title="Download Store Backup (JSON)"
              aria-label="Download Store Backup"
            >
              <Database className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="tactile-press w-8 h-8 rounded-lg border flex items-center justify-center transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            title={darkMode ? 'Switch to Light Theme (F9)' : 'Switch to Dark Theme (F9)'}
            aria-label={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {darkMode ? (
              <Sun className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} strokeWidth={1.75} />
            ) : (
              <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              className="tactile-press w-8 h-8 rounded-lg border flex items-center justify-center transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-muted)'
              }}
              title={`Signed in as ${currentUser.fullName} (${currentUser.role}). Click to Logout.`}
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
