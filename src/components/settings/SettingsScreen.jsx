import React, { useState, useRef, useEffect } from 'react';
import { 
  Store, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { getAllStaffAccounts, deleteStaffAccount, registerUser, isOwner } from '../../utils/cryptoAuth';

export default function SettingsScreen({
  config,
  currentUser,
  onUpdateConfig,
  onExportBackup,
  onImportBackup,
  onResetDemoData,
  onResetAllData
}) {
  const [shopName, setShopName] = useState(config.shopName || '');
  const [tagline, setTagline] = useState(config.tagline || '');
  const [address, setAddress] = useState(config.address || '');
  const [phone, setPhone] = useState(config.phone || '');
  const [bkashNumber, setBkashNumber] = useState(config.bkashNumber || '');
  const [receiptFooter, setReceiptFooter] = useState(config.receiptFooter || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Staff Account Management (Owner Only)
  const isUserOwner = isOwner(currentUser);
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Staff');
  const [staffError, setStaffError] = useState(null);
  const [staffSuccess, setStaffSuccess] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isUserOwner) {
      setStaffAccounts(getAllStaffAccounts());
    }
  }, [isUserOwner]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      shopName: shopName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      bkashNumber: bkashNumber.trim(),
      receiptFooter: receiptFooter.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImportBackup(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffError(null);
    setStaffSuccess(null);

    try {
      if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword) {
        throw new Error('Please fill in all staff fields.');
      }
      if (newStaffPassword.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      await registerUser({
        email: newStaffEmail.trim(),
        fullName: newStaffName.trim(),
        password: newStaffPassword,
        role: newStaffRole
      });

      setStaffAccounts(getAllStaffAccounts());
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setStaffSuccess(`Added ${newStaffRole} account successfully!`);
      setTimeout(() => setStaffSuccess(null), 3000);
    } catch (err) {
      setStaffError(err.message || 'Failed to add staff account.');
    }
  };

  const handleDeleteStaff = (targetUser) => {
    if (window.confirm(`Delete user account "${targetUser.fullName}" (${targetUser.email})?`)) {
      try {
        const updated = deleteStaffAccount(targetUser.id, currentUser?.id);
        setStaffAccounts(updated);
        setStaffSuccess(`Removed account ${targetUser.fullName}`);
        setTimeout(() => setStaffSuccess(null), 3000);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* ==================== STAFF MANAGEMENT (OWNER ONLY) ==================== */}
      {isUserOwner && (
        <div className="saas-card p-6 sm:p-7 space-y-5 bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Staff & Role Access Control</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                    Owner Only
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage staff credentials, assign roles (Owner vs Staff), and revoke access
                </p>
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {staffError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{staffError}</span>
            </div>
          )}

          {staffSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{staffSuccess}</span>
            </div>
          )}

          {/* Add Staff Form */}
          <form onSubmit={handleCreateStaff} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Create New Staff Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahat Karim"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="staff2@dokanpos.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-600 dark:text-slate-400">Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
                >
                  <option value="Staff">Staff (POS & Stock Only)</option>
                  <option value="Owner">Owner (Full Admin Access)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                + Add Staff Account
              </button>
            </div>
          </form>

          {/* Existing Accounts List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active User Accounts ({staffAccounts.length})
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
              {staffAccounts.map((acc) => {
                const isCurrent = acc.id === currentUser?.id;
                return (
                  <div key={acc.id} className="p-3 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        acc.role === 'Owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {acc.role === 'Owner' ? '👑' : '👤'}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>{acc.fullName}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        acc.role === 'Owner' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {acc.role}
                      </span>

                      {!isCurrent && (
                        <button
                          onClick={() => handleDeleteStaff(acc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete Staff Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Shop Profile Form */}
      <div className="saas-card p-6 sm:p-7 space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Shop Profile & Thermal Header
              </h2>
              <p className="text-xs text-slate-400">These details appear at the top of POS receipts</p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shop Name (দোকানের নাম)
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shop Address (ঠিকানা)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                bKash / Nagad Wallet
              </label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Receipt Footer Note
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

      </div>

      {/* Database Backup & Maintenance (Owner Only) */}
      {isUserOwner && (
        <div className="saas-card p-6 sm:p-7 space-y-5">
          
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Data Backup & Offline Storage
              </h2>
              <p className="text-xs text-slate-400">Export timestamped JSON backups for 100% offsite safety</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Export */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Export Store Backup (.JSON)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Saves complete product catalog, all sales invoices, and customer dues.
                </p>
              </div>
              <button
                onClick={onExportBackup}
                className="py-2 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <span>Restore Store Database</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upload a previous DokanPOS backup JSON file to restore records.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select File</span>
              </button>
            </div>

          </div>

          {/* Demo & Reset */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              onClick={onResetDemoData}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load BD Gadgets Demo Data</span>
            </button>

            <button
              onClick={onResetAllData}
              className="px-3.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Store & Reset</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
