import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Store, 
  X, 
  LogOut, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { canViewReports } from '../utils/cryptoAuth';

export default function Sidebar({
  activeTab,
  onTabChange,
  lowStockCount,
  duesCount,
  shopConfig,
  currentUser,
  onLogout,
  mobileOpen,
  onCloseMobile
}) {
  const isUserOwner = currentUser?.role === 'Owner';

  const allNavItems = [
    {
      id: 'pos',
      label: 'POS Billing',
      sublabel: 'বিক্রয় কাউন্টার',
      icon: ShoppingCart,
      badge: null,
      ownerOnly: false
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      sublabel: 'পণ্য ও স্টক তালিকা',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      ownerOnly: false
    },
    {
      id: 'dues',
      label: 'Baki Khata (Dues)',
      sublabel: 'গ্রাহক বাকি খাতা',
      icon: BookOpen,
      badge: duesCount > 0 ? `${duesCount}` : null,
      badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
      ownerOnly: false
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      sublabel: 'আয় ও লাভ হিসাব',
      icon: BarChart3,
      badge: null,
      ownerOnly: true // Staff CANNOT see revenue reports
    },
    {
      id: 'settings',
      label: 'Settings & Staff',
      sublabel: 'দোকান ও স্টাফ',
      icon: Settings,
      badge: null,
      ownerOnly: false
    }
  ];

  // Filter out owner-only tabs for Staff
  const visibleNavItems = allNavItems.filter((item) => !item.ownerOnly || canViewReports(currentUser));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
                <Store className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {shopConfig?.shopName || 'DokanPOS'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  Retail Management
                </div>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Workspace</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                isUserOwner 
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' 
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
              }`}>
                {currentUser?.role || 'Staff'} Mode
              </span>
            </div>

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive 
                        ? 'text-white dark:text-slate-900' 
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`} />
                    <div className="text-left truncate">
                      <div className="truncate">{item.label}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Logout */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          {currentUser && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                  isUserOwner ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300' : 'bg-blue-600/15 text-blue-700 dark:text-blue-300'
                }`}>
                  {isUserOwner ? '👑' : '👤'}
                </div>
                <div className="min-w-0 truncate">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.fullName || 'Staff'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.role} • {currentUser.email}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="text-[10px] text-slate-400 text-center">
            DokanPOS • Role: {currentUser?.role || 'Staff'}
          </div>
        </div>

      </aside>
    </>
  );
}
