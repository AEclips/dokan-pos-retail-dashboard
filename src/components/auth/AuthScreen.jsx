import React, { useState } from 'react';
import {
  Store,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Crown,
  Printer,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { authenticateUser, registerUser } from '../../utils/cryptoAuth';

export default function AuthScreen({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Staff');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isLoginView) {
        if (!email.trim() || !password) {
          throw new Error('Please fill in both email and password.');
        }
        const user = await authenticateUser(email, password);
        onLoginSuccess(user);
      } else {
        if (!fullName.trim() || !email.trim() || !password) {
          throw new Error('Please fill in all required fields.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const user = await registerUser({ email, fullName, password, role });
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = async (demoRole) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      if (demoRole === 'Owner') {
        setEmail('owner@dokanpos.com');
        setPassword('owner123');
        const user = await authenticateUser('owner@dokanpos.com', 'owner123');
        onLoginSuccess(user);
      } else {
        setEmail('staff@dokanpos.com');
        setPassword('staff123');
        const user = await authenticateUser('staff@dokanpos.com', 'staff123');
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      {/* Left Brand Architectural Panel (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#090D14] text-[#F5F6F8] auth-grid-bg border-r border-white/10 relative overflow-hidden">
        {/* Radial Emerald/Cyan Spotlight */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full opacity-35 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(6,182,212,0.18) 45%, transparent 72%)'
          }}
        />
        {/* Top Wordmark */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center">
            <Store className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white">DokanPOS</div>
            <div className="text-[11px] font-mono text-white/50">RETAIL TERMINAL OS</div>
          </div>
        </div>

        {/* Center Thesis & Capabilities */}
        <div className="max-w-md space-y-8 relative z-10">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-[-0.03em] leading-[1.12] text-white">
              Modern Retail OS for Bangladeshi Shops
            </h1>
            <p className="text-sm text-white/65 leading-relaxed">
              Built for fast counter checkout, live stock control, customer Baki ledger, and Owner-grade profit intelligence.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Mini Live Terminal Preview Card */}
            <div className="p-4 rounded-2xl bg-[#131822]/90 border border-white/10 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-white/55">LIVE COUNTER SNAPSHOT</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#34D399] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Online
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="text-[10px] text-white/50">Daily Sales</div>
                  <div className="text-base font-bold font-mono text-white">৳ 7,900</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/50">Net Profit</div>
                  <div className="text-base font-bold font-mono text-[#34D399]">+৳ 1,920</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/50">Stock Sync</div>
                  <div className="text-base font-bold font-mono text-[#38BDF8]">Real-time</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                <Printer className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Fast POS & 58mm Thermal Print</div>
                <div className="text-xs text-white/55 mt-0.5">
                  Barcode scanner ready with Cash, bKash, Nagad, Card & Split checkout.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Automated Baki Khata & WhatsApp Reminders</div>
                <div className="text-xs text-white/55 mt-0.5">
                  Auto-tracks customer dues with one-click Bengali payment reminders.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Role-Based Profit Analytics</div>
                <div className="text-xs text-white/55 mt-0.5">
                  Strict Owner vs Staff separation with Excel (.xlsx) financial exports.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="flex items-center gap-2 text-xs text-white/50 relative z-10">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" strokeWidth={1.75} />
          <span>Client-side PBKDF2-HMAC-SHA256 authentication · Offline-first storage</span>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-[400px] space-y-6 animate-soft-enter">
          {/* Mobile Brand Header */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Store className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                DokanPOS
              </h1>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Retail POS & Inventory (Bangladesh)
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="pos-surface p-6 sm:p-7 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {isLoginView ? 'Sign in to counter' : 'Create store account'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {isLoginView
                  ? 'Enter your credentials or select a demo role below.'
                  : 'Set up an Owner or Staff terminal profile.'}
              </p>
            </div>

            {/* Segmented Tab Switcher */}
            <div
              className="grid grid-cols-2 p-1 rounded-xl"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(true);
                  setErrorMsg(null);
                }}
                className="py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  backgroundColor: isLoginView ? 'var(--bg-surface)' : 'transparent',
                  color: isLoginView ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: isLoginView ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(false);
                  setErrorMsg(null);
                }}
                className="py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  backgroundColor: !isLoginView ? 'var(--bg-surface)' : 'transparent',
                  color: !isLoginView ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: !isLoginView ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div
                className="p-3 rounded-xl text-xs flex items-start gap-2 animate-soft-enter"
                style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {!isLoginView && (
                <div>
                  <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                      strokeWidth={1.75}
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pos-input w-full pl-9 pr-3 py-2.5 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    strokeWidth={1.75}
                  />
                  <input
                    type="email"
                    required
                    placeholder="owner@dokanpos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pos-input w-full pl-9 pr-3 py-2.5 text-xs font-medium"
                  />
                </div>
              </div>

              {!isLoginView && (
                <div>
                  <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Assigned Store Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="pos-input w-full px-3 py-2.5 text-xs font-medium"
                  >
                    <option value="Staff">Staff (POS Sales & Stock View Only)</option>
                    <option value="Owner">Owner (Full Admin, Reports & Staff Control)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    strokeWidth={1.75}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pos-input w-full pl-9 pr-9 py-2.5 text-xs font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity opacity-60 hover:opacity-100"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} />
                    ) : (
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>

              {!isLoginView && (
                <div>
                  <label className="block font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                      strokeWidth={1.75}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pos-input w-full pl-9 pr-3 py-2.5 text-xs font-mono font-medium"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="tactile-press w-full py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                <span>
                  {isLoading
                    ? 'Verifying Hash...'
                    : isLoginView
                    ? 'Sign In to POS'
                    : 'Create Account & Sign In'}
                </span>
                {!isLoading && <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />}
              </button>
            </form>

            {/* Quick Demo Access */}
            <div
              className="pt-4 border-t space-y-2.5"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <div className="text-[11px] font-medium text-center" style={{ color: 'var(--text-muted)' }}>
                Instant 1-Click Role Testing
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('Owner')}
                  disabled={isLoading}
                  className="tactile-press py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <Crown className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                  <span>Owner Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('Staff')}
                  disabled={isLoading}
                  className="tactile-press py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <User className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
                  <span>Staff Role</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] lg:hidden" style={{ color: 'var(--text-muted)' }}>
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
            <span>PBKDF2-HMAC-SHA256 · Role Guard (Owner / Staff)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
