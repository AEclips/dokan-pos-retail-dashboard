import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  UserCheck,
  MessageSquare,
  Copy,
  ExternalLink,
  CheckCircle2,
  PhoneCall,
  Clock
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
    return !q || 
      d.customerName.toLowerCase().includes(q) || 
      d.customerPhone.includes(q);
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
    <div className="space-y-6 animate-fade-in">
      
      {/* Due Summary Card */}
      <div className="saas-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Total Market Dues (বকেয়া খাতা)
          </span>
          <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 my-1 tracking-tight">
            {formatCurrency(duesSummary.totalDuesBalance)}
          </div>
          <p className="text-xs text-slate-400">
            Across {duesSummary.customersWithDueCount} active customer accounts
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Auto-linked with POS Checkout & Reminders
          </span>
        </div>
      </div>

      {/* Grid: Table + Selected Customer History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Customer Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="saas-card p-3 flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-medium dark:text-white focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="saas-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                    <th className="py-3 px-4 text-center">Remind</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredDues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
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
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-slate-100/90 dark:bg-slate-800/90 font-semibold' 
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {d.customerName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {d.id}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {d.customerPhone}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <span className={`font-mono font-black text-sm ${hasBalance ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {formatCurrency(d.totalDueBalance)}
                            </span>
                          </td>

                          {/* Quick Reminder Action */}
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            {hasBalance ? (
                              <div className="inline-flex items-center space-x-1">
                                <button
                                  onClick={() => handleOpenWhatsApp(d)}
                                  className="p-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition"
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleCopyReminder(d)}
                                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                                  title="Copy Bengali SMS Text"
                                >
                                  {copiedId === d.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold">Cleared ✓</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenRepayModal(d);
                              }}
                              disabled={!hasBalance}
                              className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Settle (জমা)
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

        {/* Customer Ledger Sidebar */}
        <div className="lg:col-span-1">
          <div className="saas-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Customer Ledger Details</span>
            </h3>

            {selectedCustomer ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedCustomer.customerName}
                  </div>
                  <div className="text-slate-400 font-mono mt-0.5">
                    {selectedCustomer.customerPhone}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex justify-between items-center">
                  <span className="text-rose-700 dark:text-rose-300 font-medium">Unpaid Due Balance:</span>
                  <span className="text-xl font-mono font-black text-rose-600 dark:text-rose-400">
                    {formatCurrency(selectedCustomer.totalDueBalance)}
                  </span>
                </div>

                {/* WhatsApp Message Preview Box */}
                {selectedCustomer.totalDueBalance > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bangla SMS / WhatsApp Reminder:
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border leading-relaxed">
                      "{getReminderText(selectedCustomer)}"
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenWhatsApp(selectedCustomer)}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Send WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleCopyReminder(selectedCustomer)}
                        className="py-1.5 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[11px] flex items-center justify-center transition"
                      >
                        {copiedId === selectedCustomer.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Repayment Payment Records
                  </span>

                  {(selectedCustomer.repaymentHistory || []).length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[11px] border border-dashed rounded-xl">
                      No repayments recorded yet
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {selectedCustomer.repaymentHistory.map((rep) => (
                        <div key={rep.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between">
                          <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(rep.amountPaid)}</span>
                            <span className="text-[10px] text-slate-400 block">{rep.notes}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatDateTime(rep.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCustomer.totalDueBalance > 0 && (
                  <button
                    onClick={() => onOpenRepayModal(selectedCustomer)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs transition shadow-sm hover:opacity-90 cursor-pointer"
                  >
                    Receive Due Payment (জমা গ্রহণ)
                  </button>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select a customer row to view full credit ledger & reminder actions.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
