import React, { useState } from 'react';
import {
  Search,
  UserCheck,
  MessageSquare,
  Copy,
  CheckCircle2,
  BookOpen,
  Users
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function DuesScreen({
  dues,
  duesSummary,
  onOpenRepayModal,
  shopConfig
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filteredDues = dues.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      d.customerName.toLowerCase().includes(q) ||
      d.customerPhone.includes(q)
    );
  });

  const getReminderText = (customer) => {
    const shop = shopConfig?.shopName || 'DokanPOS';
    return `আসসালামু আলাইকুম ${customer.customerName} ভাই, ${shop} থেকে আপনার বকেয়া হিসাব ৳${customer.totalDueBalance} টাকা। অনুগ্রহ করে সুবিধাজনক সময়ে পরিশোধের ব্যবস্থা করবেন। ধন্যবাদ!`;
  };

  const handleCopyReminder = (customer) => {
    const text = getReminderText(customer);
    navigator.clipboard.writeText(text);
    setCopiedId(customer.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenWhatsApp = (customer) => {
    const cleanPhone = customer.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(getReminderText(customer));
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5 animate-soft-enter">
      {/* TallyKhata-Inspired 2-Metric Bento Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-7 pos-surface p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--danger-soft)',
                borderColor: 'rgba(244, 63, 94, 0.25)',
                color: 'var(--danger)'
              }}
            >
              <BookOpen className="w-5 h-5" strokeWidth={1.85} />
            </div>
            <div>
              <span
                className="text-[10.5px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                মোট বকেয়া (Total Market Dues)
              </span>
              <div
                className="text-3xl font-extrabold font-mono tracking-tight mt-0.5"
                style={{ color: 'var(--danger)' }}
              >
                {formatCurrency(duesSummary.totalDuesBalance)}
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Auto-synced with POS Baki checkout & instant WhatsApp reminders
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 pos-surface p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                color: 'var(--accent)'
              }}
            >
              <Users className="w-5 h-5" strokeWidth={1.85} />
            </div>
            <div>
              <span
                className="text-[10.5px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                সক্রিয় বাকি হিসাব (Active Accounts)
              </span>
              <div
                className="text-2xl font-extrabold font-mono tracking-tight mt-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                {duesSummary.customersWithDueCount}
                <span className="text-xs font-normal ml-1.5" style={{ color: 'var(--text-muted)' }}>
                  of {dues.length} total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-3">
          <div className="pos-surface p-2.5 flex items-center gap-2">
            <Search
              className="w-4 h-4 ml-1.5"
              style={{ color: 'var(--text-muted)' }}
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search customer by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-medium focus:outline-none py-1"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div className="pos-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: 'var(--border-hairline)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                    <th className="py-3 px-4 text-center">Remind</th>
                    <th className="py-3 px-4 text-right">জমা (Settle)</th>
                  </tr>
                </thead>
                <tbody className="[&>*+*]:border-t [&>*+*]:border-[var(--border-hairline)]">
                  {filteredDues.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-10 text-center"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        No customer dues recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredDues.map((d) => {
                      const hasBalance = d.totalDueBalance > 0;
                      const isSelected = selectedCustomer?.id === d.id;

                      return (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedCustomer(d)}
                          className="cursor-pointer transition-colors hover:bg-[var(--bg-elevated)]"
                          style={{
                            backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent'
                          }}
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {d.customerName}
                            </div>
                            <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                              {hasBalance ? 'বাকি (Due)' : 'পরিশোধিত (Cleared)'}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {d.customerPhone}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span
                              className="font-mono font-bold text-sm"
                              style={{ color: hasBalance ? 'var(--danger)' : 'var(--accent)' }}
                            >
                              {formatCurrency(d.totalDueBalance)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {hasBalance ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsApp(d)}
                                  className="tactile-press p-1.5 rounded-lg border transition-colors"
                                  style={{
                                    backgroundColor: 'var(--accent-soft)',
                                    borderColor: 'rgba(16, 185, 129, 0.25)',
                                    color: 'var(--accent)'
                                  }}
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.85} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyReminder(d)}
                                  className="tactile-press p-1.5 rounded-lg border transition-colors hover:bg-[var(--bg-hover)]"
                                  style={{
                                    backgroundColor: 'var(--bg-subtle)',
                                    borderColor: 'var(--border-hairline)',
                                    color: 'var(--text-secondary)'
                                  }}
                                  title="Copy Bengali SMS Text"
                                >
                                  {copiedId === d.id ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.85} />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                              >
                                Cleared
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenRepayModal(d);
                              }}
                              disabled={!hasBalance}
                              className="tactile-press px-3 py-1 rounded-lg border text-xs font-semibold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: 'var(--warning-soft)',
                                borderColor: 'rgba(245, 158, 11, 0.28)',
                                color: 'var(--warning)'
                              }}
                            >
                              জমা নিন
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Credit Ledger Detail Panel */}
        <div className="lg:col-span-4">
          <div className="pos-surface p-5 space-y-4">
            <h3
              className="font-bold text-sm pb-2.5 border-b flex items-center gap-2"
              style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-primary)' }}
            >
              <UserCheck className="w-4 h-4" style={{ color: 'var(--warning)' }} strokeWidth={1.85} />
              <span>Customer Ledger Details</span>
            </h3>

            {selectedCustomer ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedCustomer.customerName}
                  </div>
                  <div className="font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {selectedCustomer.customerPhone}
                  </div>
                </div>

                <div
                  className="p-3.5 rounded-xl border flex justify-between items-center"
                  style={{
                    backgroundColor: 'var(--danger-soft)',
                    borderColor: 'rgba(244, 63, 94, 0.25)'
                  }}
                >
                  <span className="font-semibold" style={{ color: 'var(--danger)' }}>
                    বাকি ব্যালেন্স (Unpaid)
                  </span>
                  <span className="text-xl font-mono font-extrabold" style={{ color: 'var(--danger)' }}>
                    {formatCurrency(selectedCustomer.totalDueBalance)}
                  </span>
                </div>

                {selectedCustomer.totalDueBalance > 0 && (
                  <div
                    className="p-3 rounded-xl border space-y-2.5"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-hairline)'
                    }}
                  >
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider block"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Bangla SMS / WhatsApp Reminder
                    </span>
                    <p
                      className="text-[11px] p-2.5 rounded-lg border leading-relaxed"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      "{getReminderText(selectedCustomer)}"
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(selectedCustomer)}
                        className="tactile-press flex-1 py-2 px-2.5 rounded-lg font-semibold text-[11px] text-white flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.85} />
                        <span>Send WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyReminder(selectedCustomer)}
                        className="tactile-press py-2 px-3 rounded-lg border font-semibold text-[11px]"
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          borderColor: 'var(--border-hairline)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {copiedId === selectedCustomer.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <span
                    className="text-[10px] uppercase font-semibold tracking-wider block mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    জমা ইতিহাস (Repayment History)
                  </span>

                  {(selectedCustomer.repaymentHistory || []).length === 0 ? (
                    <div
                      className="py-6 text-center text-[11px] border border-dashed rounded-xl"
                      style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-muted)' }}
                    >
                      No repayments recorded yet
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {selectedCustomer.repaymentHistory.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-2.5 rounded-xl border flex items-center justify-between"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-hairline)'
                          }}
                        >
                          <div>
                            <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                              +{formatCurrency(rep.amountPaid)}
                            </span>
                            <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                              {rep.notes}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {formatDateTime(rep.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCustomer.totalDueBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => onOpenRepayModal(selectedCustomer)}
                    className="tactile-press w-full py-2.5 rounded-xl font-bold text-xs text-white transition-colors"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Receive Due Payment (জমা গ্রহণ)
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Select a customer row to view full credit ledger & reminder actions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
