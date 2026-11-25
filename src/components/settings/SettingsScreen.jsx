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
  AlertCircle,
  Crown,
  User
} from 'lucide-react';
import {
  getAllStaffAccounts,
  deleteStaffAccount,
  registerUser,
  isOwner
} from '../../utils/cryptoAuth';

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
      setStaffSuccess(`Added ${newStaffRole} account successfully.`);
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
    <div className="space-y-6 max-w-4xl mx-auto animate-soft-enter">
      {/* Staff Management (Owner Only) */}
      {isUserOwner && (
        <div className="pos-surface p-6 sm:p-7 space-y-5">
          <div
            className="flex items-center justify-between pb-3.5 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                <Users className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>Staff & Role Access Control</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    Owner Only
                  </span>
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Manage staff credentials, assign Owner/Staff roles, and revoke access
                </p>
              </div>
            </div>
          </div>

          {staffError && (
            <div
              className="p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{staffError}</span>
            </div>
          )}

          {staffSuccess && (
            <div
              className="p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Check className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{staffSuccess}</span>
            </div>
          )}

          <form
            onSubmit={handleCreateStaff}
            className="p-4 rounded-xl border space-y-3 text-xs"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-hairline)'
            }}
          >
            <div className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <UserPlus className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
              <span>Create New Staff Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahat Karim"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs font-medium"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff2@dokanpos.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs font-medium"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs font-mono"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Role
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="pos-input w-full px-3 py-2 text-xs font-medium"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="Staff">Staff (POS & Stock)</option>
                  <option value="Owner">Owner (Full Admin)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="tactile-press px-4 py-2 rounded-xl text-white font-semibold text-xs transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                + Add Staff Account
              </button>
            </div>
          </form>

          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Active Accounts ({staffAccounts.length})
            </div>

            <div
              className="border rounded-xl overflow-hidden [&>*+*]:border-t [&>*+*]:border-[var(--border-hairline)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              {staffAccounts.map((acc) => {
                const isCurrent = acc.id === currentUser?.id;
                const isAccOwner = acc.role === 'Owner';
                return (
                  <div
                    key={acc.id}
                    className="p-3 flex items-center justify-between gap-3 text-xs"
                    style={{ backgroundColor: 'var(--bg-surface)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isAccOwner ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                          color: isAccOwner ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                      >
                        {isAccOwner ? (
                          <Crown className="w-4 h-4" strokeWidth={1.75} />
                        ) : (
                          <User className="w-4 h-4" strokeWidth={1.75} />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <span>{acc.fullName}</span>
                          {isCurrent && (
                            <span
                              className="text-[10px] px-1.5 py-0.2 rounded-full font-medium"
                              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                            >
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className="px-2.5 py-0.5 rounded-full font-semibold text-[10px]"
                        style={{
                          backgroundColor: isAccOwner ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                          color: isAccOwner ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                      >
                        {acc.role}
                      </span>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(acc)}
                          className="tactile-press p-1.5 rounded-lg transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Delete Staff Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
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
      <div className="pos-surface p-6 sm:p-7 space-y-5">
        <div
          className="flex items-center justify-between pb-3.5 border-b"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
            >
              <Store className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Shop Profile & Thermal Header
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Printed at the top of 58mm POS receipts
              </p>
            </div>
          </div>

          {savedSuccess && (
            <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>Saved</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Shop Name (দোকানের নাম)
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="pos-input w-full px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="pos-input w-full px-3 py-2 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Shop Address (ঠিকানা)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pos-input w-full px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pos-input w-full px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                bKash / Nagad Wallet
              </label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                className="pos-input w-full px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Receipt Footer Note
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="pos-input w-full px-3 py-2 text-xs font-medium"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="tactile-press px-5 py-2.5 rounded-xl font-semibold text-xs transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-surface)' }}
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Maintenance (Owner Only) */}
      {isUserOwner && (
        <div className="pos-surface p-6 sm:p-7 space-y-5">
          <div
            className="flex items-center gap-3 pb-3.5 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
            >
              <Database className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Data Backup & Offline Storage
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Export timestamped JSON backups for offsite safety
              </p>
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
            <div
              className="p-4 rounded-xl border flex flex-col justify-between gap-3"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div>
                <div className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Download className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                  <span>Export Store Backup (.JSON)</span>
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Saves product catalog, sales invoices, and customer dues.
                </p>
              </div>
              <button
                type="button"
                onClick={onExportBackup}
                className="tactile-press py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-surface)' }}
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Download Backup</span>
              </button>
            </div>

            <div
              className="p-4 rounded-xl border flex flex-col justify-between gap-3"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div>
                <div className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Upload className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
                  <span>Restore Store Database</span>
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Upload a previous DokanPOS backup JSON file to restore records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="tactile-press py-2 px-3 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[var(--bg-hover)]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)'
                }}
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Select File</span>
              </button>
            </div>
          </div>

          <div
            className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <button
              type="button"
              onClick={onResetDemoData}
              className="tactile-press px-3.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors hover:bg-[var(--bg-hover)]"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} strokeWidth={1.75} />
              <span>Load BD Gadgets Demo Data</span>
            </button>

            <button
              type="button"
              onClick={onResetAllData}
              className="tactile-press px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors hover:bg-[var(--danger-soft)]"
              style={{ color: 'var(--danger)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Clear Store & Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
