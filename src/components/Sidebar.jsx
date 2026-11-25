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
  Crown,
  User
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
      label: 'POS Terminal',
      sublabel: 'বিক্রয় কাউন্টার',
      icon: ShoppingCart,
      badge: null,
      ownerOnly: false
    },
    {
      id: 'inventory',
      label: 'Inventory',
      sublabel: 'পণ্য ও স্টক',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeType: 'warning',
      ownerOnly: false
    },
    {
      id: 'dues',
      label: 'Baki Khata',
      sublabel: 'বকেয়া হিসাব',
      icon: BookOpen,
      badge: duesCount > 0 ? `${duesCount}` : null,
      badgeType: 'danger',
      ownerOnly: false
    },
    {
      id: 'reports',
      label: 'Analytics',
      sublabel: 'আয় ও লাভ',
      icon: BarChart3,
      badge: null,
      ownerOnly: true
    },
    {
      id: 'settings',
      label: 'Settings',
      sublabel: 'দোকান ও স্টাফ',
      icon: Settings,
      badge: null,
      ownerOnly: false
    }
  ];

  const visibleNavItems = allNavItems.filter(
    (item) => !item.ownerOnly || canViewReports(currentUser)
  );

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 shrink-0 border-r flex flex-col justify-between transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 no-print ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-hairline)'
        }}
      >
        <div>
          {/* 56px Brand Header matching top Header */}
          <div
            className="h-14 flex items-center justify-between px-4 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: 'var(--accent-soft)',
                  borderColor: 'rgba(16, 185, 129, 0.25)',
                  color: 'var(--accent)'
                }}
              >
                <Store className="w-4 h-4" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <div
                  className="font-bold text-[13px] tracking-tight truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {shopConfig?.shopName || 'DokanPOS'}
                </div>
                <div
                  className="text-[10px] font-mono font-medium truncate"
                  style={{ color: 'var(--text-muted)' }}
                >
                  POS OS · v2.0
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-2.5 space-y-1">
            <div className="px-2.5 pt-1.5 pb-1 flex items-center justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Terminal
              </span>
              <span
                className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md border"
                style={{
                  backgroundColor: isUserOwner ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                  borderColor: isUserOwner ? 'rgba(16, 185, 129, 0.24)' : 'var(--border-hairline)',
                  color: isUserOwner ? 'var(--accent)' : 'var(--text-secondary)'
                }}
              >
                {currentUser?.role || 'Staff'}
              </span>
            </div>

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              const badgeStyle =
                item.badgeType === 'warning'
                  ? { backgroundColor: 'var(--warning-soft)', color: 'var(--warning)' }
                  : { backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' };

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className="tactile-press relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                    fontWeight: isActive ? 600 : 500
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    <div className="text-left min-w-0">
                      <div
                        className="truncate text-[12.5px] leading-tight"
                        style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="text-[10px] truncate mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0"
                      style={badgeStyle}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Operator Card */}
        <div
          className="p-2.5 border-t"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          {currentUser && (
            <div
              className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isUserOwner ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                    color: isUserOwner ? 'var(--accent)' : 'var(--text-secondary)'
                  }}
                >
                  {isUserOwner ? (
                    <Crown className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <User className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className="font-semibold text-xs truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {currentUser.fullName || 'Operator'}
                  </div>
                  <div
                    className="text-[10px] truncate font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {currentUser.role}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
