import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthScreen from './components/auth/AuthScreen';
import PosScreen from './components/pos/PosScreen';
import CheckoutModal from './components/pos/CheckoutModal';
import InventoryScreen from './components/inventory/InventoryScreen';
import ProductModal from './components/inventory/ProductModal';
import RestockModal from './components/inventory/RestockModal';
import DuesScreen from './components/dues/DuesScreen';
import RepaymentModal from './components/dues/RepaymentModal';
import ReportsScreen from './components/reports/ReportsScreen';
import ThermalReceipt from './components/receipt/ThermalReceipt';
import SettingsScreen from './components/settings/SettingsScreen';

import { loadStoreState, saveStoreState, exportBackupJson, parseBackupFile } from './utils/storage';
import { exportSalesToExcel } from './utils/excelExport';
import { getCurrentSession, clearCurrentSession, initializeDefaultUsers } from './utils/cryptoAuth';
import { calculateCartTotals, calculateInventoryStats, calculateSalesAnalytics, calculateDuesSummary } from './utils/posCalculations';
import { INITIAL_PRODUCTS, INITIAL_SAMPLE_SALES, INITIAL_CUSTOMER_DUES } from './constants/initialProducts';
import { DEFAULT_SHOP_CONFIG } from './constants/shopConfig';

export default function App() {
  const initial = loadStoreState();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());

  // Initialize seed users
  useEffect(() => {
    initializeDefaultUsers();
  }, []);

  // Core Data State (100% untouched business logic)
  const [products, setProducts] = useState(initial.products || INITIAL_PRODUCTS);
  const [sales, setSales] = useState(initial.sales || INITIAL_SAMPLE_SALES);
  const [dues, setDues] = useState(initial.dues || INITIAL_CUSTOMER_DUES);
  const [config, setConfig] = useState(initial.config || DEFAULT_SHOP_CONFIG);

  // Core App Tab Navigation with URL Hash Sync
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    return ['pos', 'inventory', 'dues', 'reports', 'settings'].includes(hash) ? hash : 'pos';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Synchronize URL Hash when activeTab changes
  const handleTabChange = (tabId) => {
    if (tabId === 'reports' && currentUser?.role !== 'Owner') {
      showToast('Access Denied: Only Owner can access financial reports! 🔒');
      return;
    }
    setActiveTab(tabId);
    window.location.hash = `#${tabId}`;
  };

  // URL Hash Direct Navigation Listener + Security Guard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'reports' && currentUser?.role !== 'Owner') {
        window.location.hash = '#pos';
        setActiveTab('pos');
        showToast('Unauthorized: Direct URL access to reports blocked. 🔒');
      } else if (['pos', 'inventory', 'dues', 'reports', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Route Guard: Eject Staff if activeTab somehow equals 'reports'
  useEffect(() => {
    if (activeTab === 'reports' && currentUser?.role !== 'Owner') {
      setActiveTab('pos');
      window.location.hash = '#pos';
    }
  }, [activeTab, currentUser]);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [flatDiscount, setFlatDiscount] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dokanpos_theme');
    if (saved) return saved === 'dark';
    return false; // Default light for clean SaaS look
  });

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [repayCustomer, setRepayCustomer] = useState(null);
  const [activeReceiptSale, setActiveReceiptSale] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dokanpos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dokanpos_theme', 'light');
    }
  }, [darkMode]);

  // Global POS Keyboard Shortcuts Engine (F1: Search, F2: Checkout, F4: Clear, F9: Theme, Esc: Close)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore when typing in modal text inputs (except hotkeys F1-F12)
      if (e.key === 'F1') {
        e.preventDefault();
        const searchInput = document.getElementById('mainPosSearchInput');
        if (searchInput) {
          setActiveTab('pos');
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (cartItems.length > 0) {
          setIsCheckoutOpen(true);
        } else {
          showToast('Cart is empty. Add products first.');
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cartItems.length > 0) {
          setCartItems([]);
          setFlatDiscount(0);
          showToast('Cleared cart');
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        setDarkMode(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsCheckoutOpen(false);
        setIsProductModalOpen(false);
        setRestockProduct(null);
        setRepayCustomer(null);
        setActiveReceiptSale(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cartItems]);

  // Quick 1-click stock adder
  const handleQuickAddStock = (productId, amountToAdd) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stockQuantity: p.stockQuantity + amountToAdd }
          : p
      )
    );
    showToast(`Added +${amountToAdd} units to stock! 📦`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations (100% untouched)
  const cartTotals = calculateCartTotals(cartItems, flatDiscount, config.taxRate || 0);
  const inventoryStats = calculateInventoryStats(products);
  const salesAnalytics = calculateSalesAnalytics(sales);
  const duesSummary = calculateDuesSummary(dues);

  // ==================== POS CART HANDLERS ====================
  const handleAddToCart = (product) => {
    const existingIndex = cartItems.findIndex((c) => c.productId === product.id);

    if (existingIndex > -1) {
      const existing = cartItems[existingIndex];
      if (existing.quantity >= product.stockQuantity) {
        showToast(`Stock limit reached (${product.stockQuantity} pcs)`);
        return;
      }
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      if (product.stockQuantity <= 0) {
        showToast('Item is out of stock!');
        return;
      }
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          sellingPrice: product.sellingPrice,
          buyingPrice: product.buyingPrice,
          stockQuantity: product.stockQuantity,
          quantity: 1,
          itemDiscount: 0
        }
      ]);
    }
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && newQty > product.stockQuantity) {
      showToast(`Only ${product.stockQuantity} pcs available in stock`);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems(cartItems.filter((i) => i.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setFlatDiscount(0);
  };

  // ==================== SALES COMPLETION ====================
  const handleCompleteSale = (saleRecord) => {
    // 1. Deduct Stock from Products
    const updatedProducts = products.map((prod) => {
      const cartMatch = saleRecord.items.find((i) => i.productId === prod.id);
      if (cartMatch) {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - cartMatch.quantity)
        };
      }
      return prod;
    });
    setProducts(updatedProducts);

    // 2. Handle Due / Baki Khata
    const dueAmount = saleRecord.paymentDetails?.dueAmount || 0;
    if (dueAmount > 0 && saleRecord.customerPhone && saleRecord.customerPhone !== '—') {
      const existingCustomerIndex = dues.findIndex(
        (d) => d.customerPhone === saleRecord.customerPhone
      );

      if (existingCustomerIndex > -1) {
        const updatedDues = [...dues];
        updatedDues[existingCustomerIndex].totalDueBalance += dueAmount;
        updatedDues[existingCustomerIndex].totalPurchased += saleRecord.grandTotal;
        updatedDues[existingCustomerIndex].lastPurchaseDate = saleRecord.timestamp;
        setDues(updatedDues);
      } else {
        const newCustomerDue = {
          id: `due-${Date.now()}`,
          customerName: saleRecord.customerName,
          customerPhone: saleRecord.customerPhone,
          totalDueBalance: dueAmount,
          totalPurchased: saleRecord.grandTotal,
          lastPurchaseDate: saleRecord.timestamp,
          repaymentHistory: []
        };
        setDues([newCustomerDue, ...dues]);
      }
    }

    // 3. Append to Sales History
    setSales([saleRecord, ...sales]);

    // 4. Reset Cart and open Receipt
    setCartItems([]);
    setFlatDiscount(0);
    setIsCheckoutOpen(false);
    setActiveReceiptSale(saleRecord);

    showToast(`Invoice ${saleRecord.id} recorded! 🧾`);
  };

  // ==================== INVENTORY ACTIONS ====================
  const handleSaveProduct = (savedProduct) => {
    const existingIdx = products.findIndex((p) => p.id === savedProduct.id);
    if (existingIdx > -1) {
      const updated = [...products];
      updated[existingIdx] = savedProduct;
      setProducts(updated);
      showToast(`Updated ${savedProduct.name}`);
    } else {
      setProducts([savedProduct, ...products]);
      showToast(`Added ${savedProduct.name}! ✨`);
    }
    setIsProductModalOpen(false);
    setProductToEdit(null);
  };

  const handleAddStock = (productId, qty) => {
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, stockQuantity: p.stockQuantity + qty } : p
      )
    );
    setRestockProduct(null);
    showToast(`Restocked +${qty} units! 📦`);
  };

  const handleDeleteProduct = (productId, name) => {
    if (window.confirm(`Delete "${name}" from inventory?`)) {
      setProducts(products.filter((p) => p.id !== productId));
      showToast(`Deleted product "${name}"`);
    }
  };

  // ==================== DUES REPAYMENT ====================
  const handleRecordRepayment = (dueId, repayment) => {
    setDues(
      dues.map((d) => {
        if (d.id === dueId) {
          const newBal = Math.max(0, d.totalDueBalance - repayment.amountPaid);
          return {
            ...d,
            totalDueBalance: newBal,
            repaymentHistory: [repayment, ...(d.repaymentHistory || [])]
          };
        }
        return d;
      })
    );
    setRepayCustomer(null);
    showToast(`Recorded repayment of ৳ ${repayment.amountPaid}! 💰`);
  };

  // ==================== REFUND / VOID SALE ====================
  const handleRefundSale = (saleId) => {
    const targetSale = sales.find((s) => s.id === saleId);
    if (!targetSale) return;

    if (window.confirm(`Void invoice ${saleId}? This will restore all items back to stock.`)) {
      const updatedProducts = products.map((prod) => {
        const match = targetSale.items.find((i) => i.productId === prod.id);
        if (match) {
          return {
            ...prod,
            stockQuantity: prod.stockQuantity + match.quantity
          };
        }
        return prod;
      });
      setProducts(updatedProducts);
      setSales(sales.filter((s) => s.id !== saleId));
      showToast(`Voided invoice ${saleId} and restored stock!`);
    }
  };

  // ==================== BACKUP & SETTINGS ====================
  const handleExportBackup = () => {
    exportBackupJson({ products, sales, dues, config });
    showToast('Exported backup JSON!');
  };

  const handleImportBackup = async (file) => {
    try {
      const data = await parseBackupFile(file);
      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);
      if (data.dues) setDues(data.dues);
      if (data.config) setConfig(data.config);
      showToast('Restored store database! ✨');
    } catch (err) {
      alert('Failed to restore backup: ' + err.message);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Preload Bangladesh gadgets demo inventory?')) {
      setProducts(INITIAL_PRODUCTS);
      setSales(INITIAL_SAMPLE_SALES);
      setDues(INITIAL_CUSTOMER_DUES);
      setConfig(DEFAULT_SHOP_CONFIG);
      showToast('Loaded demo dataset! 📱');
    }
  };

  const handleResetAllData = () => {
    if (window.confirm('Reset all records to empty?')) {
      setProducts([]);
      setSales([]);
      setDues([]);
      setCartItems([]);
      showToast('Reset store to blank');
    }
  };

  // ==================== AUTHENTICATION ACTIONS ====================
  const handleLogout = () => {
    clearCurrentSession();
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  // If not authenticated, render Login / Signup Screen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-100 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      
      {/* Left Sidebar Navigation (Desktop Fixed + Mobile Overlay) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lowStockCount={inventoryStats.lowStockCount}
        duesCount={duesSummary.customersWithDueCount}
        shopConfig={config}
        currentUser={currentUser}
        onLogout={handleLogout}
        mobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Workspace Area (Offset by 64 on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          config={config}
          analytics={salesAnalytics}
          inventoryStats={inventoryStats}
          duesSummary={duesSummary}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenMobile={() => setIsMobileNavOpen(true)}
          onExportBackup={handleExportBackup}
          onExportReport={handleExportReport}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 animate-fade-in bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 border border-slate-700/50 no-print">
              <span>✨</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {activeTab === 'pos' && (
            <PosScreen
              products={products}
              cartItems={cartItems}
              cartTotals={cartTotals}
              flatDiscount={flatDiscount}
              onSetFlatDiscount={setFlatDiscount}
              onAddToCart={handleAddToCart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveCartItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              onOpenAddProduct={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onOpenRestockModal={(product) => setRestockProduct(product)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen
              products={products}
              inventoryStats={inventoryStats}
              currentUser={currentUser}
              onOpenAddModal={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              onOpenEditModal={(product) => {
                setProductToEdit(product);
                setIsProductModalOpen(true);
              }}
              onOpenRestockModal={(product) => setRestockProduct(product)}
              onDeleteProduct={handleDeleteProduct}
              onQuickAddStock={handleQuickAddStock}
            />
          )}

          {activeTab === 'dues' && (
            <DuesScreen
              dues={dues}
              duesSummary={duesSummary}
              shopConfig={config}
              onOpenRepayModal={(customer) => setRepayCustomer(customer)}
            />
          )}

          {/* Defense-in-depth: Never mount or render Reports component if not Owner */}
          {activeTab === 'reports' && currentUser?.role === 'Owner' && (
            <ReportsScreen
              analytics={salesAnalytics}
              sales={sales}
              onViewReceipt={(sale) => setActiveReceiptSale(sale)}
              onRefundSale={handleRefundSale}
              onExportReport={handleExportReport}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              config={config}
              currentUser={currentUser}
              onUpdateConfig={setConfig}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetDemoData={handleResetDemoData}
              onResetAllData={handleResetAllData}
            />
          )}

        </main>

      </div>

      {/* ==================== MODALS ==================== */}

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        cartTotals={cartTotals}
        flatDiscount={flatDiscount}
        config={config}
        dues={dues}
        onCompleteSale={handleCompleteSale}
      />

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSaveProduct={handleSaveProduct}
      />

      {/* Quick Restock Modal */}
      <RestockModal
        isOpen={!!restockProduct}
        onClose={() => setRestockProduct(null)}
        product={restockProduct}
        onAddStock={handleAddStock}
      />

      {/* Customer Due Repayment Modal */}
      <RepaymentModal
        isOpen={!!repayCustomer}
        onClose={() => setRepayCustomer(null)}
        customerDue={repayCustomer}
        onRecordRepayment={handleRecordRepayment}
      />

      {/* 58mm Thermal Print Receipt Modal */}
      <ThermalReceipt
        isOpen={!!activeReceiptSale}
        onClose={() => setActiveReceiptSale(null)}
        sale={activeReceiptSale}
        config={config}
      />

    </div>
  );
}
