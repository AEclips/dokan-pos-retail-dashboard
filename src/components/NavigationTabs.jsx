import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  BookOpen, 
  BarChart3, 
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function NavigationTabs({
  activeTab,
  onTabChange,
  lowStockCount,
  duesCount
}) {
  const tabs = [
    {
      id: 'pos',
      label: 'POS Billing',
      sublabel: 'বিক্রয় কাউন্টার',
      icon: ShoppingCart,
      badge: null
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      sublabel: 'পণ্য ও স্টক',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-black'
    },
    {
      id: 'dues',
      label: 'Baki Khata (Dues)',
      sublabel: 'গ্রাহক বাকি খাতা',
      icon: BookOpen,
      badge: duesCount > 0 ? duesCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold'
    },
    {
      id: 'reports',
      label: 'Reports & Profit',
      sublabel: 'আয় ও লাভ হিসাব',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings & Backup',
      sublabel: 'দোকান ও ব্যাকআপ',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <nav className="w-full no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2.5 px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                    : 'glass-panel text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/90'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className={`text-[10px] font-normal leading-none ${isActive ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tab.sublabel}
                  </div>
                </div>

                {tab.badge !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ml-1 ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
