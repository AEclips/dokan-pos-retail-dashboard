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
  Shield
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
  onExportBackup,
  onExportReport
}) {
  const isUserOwner = isOwner(currentUser);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pos': return 'POS Billing Counter';
      case 'inventory': return 'Inventory & Stock Management';
      case 'dues': return 'Customer Due (Baki Khata)';
      case 'reports': return 'Financial Analytics & Profit';
      case 'settings': return 'Store Settings & Staff';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="font-semibold text-slate-400 hidden sm:inline">Store</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
              {getTabTitle()}
            </h2>
          </div>
        </div>

        {/* Right: Role-Gated KPI Tickers, Export Button & User Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Today's Ticker: Revenue (Owner only) vs Order Count (Staff) */}
          {isUserOwner ? (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-500 dark:text-slate-400">Today's Sales:</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(analytics.todayRevenue)}
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 dark:text-slate-400">Today:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">
                {analytics.todaySalesCount} orders logged
              </span>
            </div>
          )}

          {/* Low Stock Badge */}
          {inventoryStats.lowStockCount > 0 && (
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{inventoryStats.lowStockCount} Low</span>
            </div>
          )}

          {/* Export Report Excel (Owner Only) */}
          {isUserOwner && onExportReport && (
            <button
              onClick={onExportReport}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              title="Download Sales Report (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}

          {/* Backup Button (Owner Only) */}
          {isUserOwner && (
            <button
              onClick={onExportBackup}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Download Store Backup (JSON)"
            >
              <Database className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Avatar & Logout */}
          {currentUser && (
            <div className="flex items-center space-x-1 pl-1 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title={`Signed in as ${currentUser.fullName} (${currentUser.role}). Click to Logout.`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
