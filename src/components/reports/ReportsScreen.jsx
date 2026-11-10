import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award, 
  CreditCard, 
  FileSpreadsheet,
  Download,
  Calendar,
  BarChart2,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import TransactionList from './TransactionList';

export default function ReportsScreen({
  analytics,
  sales,
  onViewReceipt,
  onRefundSale,
  onExportReport
}) {
  const {
    todayRevenue,
    todayProfit,
    todaySalesCount,
    sevenDaysRevenue,
    sevenDaysProfit,
    totalLifetimeRevenue,
    totalLifetimeProfit,
    totalTransactionsCount,
    paymentBreakdown,
    topProducts
  } = analytics;

  const totalPayments = Object.values(paymentBreakdown).reduce((a, b) => a + b, 0);

  // Compute 7-day daily trend for interactive visual SVG chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const daySales = sales.filter((s) => {
      const sDate = (s.timestamp || s.date || '').split('T')[0];
      return sDate === dayStr;
    });

    const revenue = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const profit = daySales.reduce((sum, s) => sum + (s.netProfit || 0), 0);

    return { dayStr, dayLabel, revenue, profit, count: daySales.length };
  });

  const maxDailyRev = Math.max(...last7Days.map(d => d.revenue), 5000);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Section with Export CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Executive Reports
          </h2>
          <p className="text-xs text-slate-400">
            Real-time revenue, gross profit margins, and payment channel insights
          </p>
        </div>

        {onExportReport && (
          <button
            onClick={onExportReport}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Full Report (.xlsx)</span>
          </button>
        )}
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Today's Gross Sales
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
              {todaySalesCount} orders
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(todayRevenue)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex justify-between">
              <span>Today's Net Profit:</span>
              <span className="font-bold font-mono">+{formatCurrency(todayProfit)}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400">
            Net margin after cost deduction
          </div>
        </div>

        {/* 7-Day Sales */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Past 7 Days Revenue
          </span>

          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(sevenDaysRevenue)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex justify-between">
              <span>7-Day Profit:</span>
              <span className="font-bold font-mono">+{formatCurrency(sevenDaysProfit)}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400">
            Rolling weekly sales volume
          </div>
        </div>

        {/* Total Lifetime Sales */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              All-Time Sales
            </span>
            <span className="text-[10px] font-medium text-slate-400 font-mono">
              {totalTransactionsCount} receipts
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalLifetimeRevenue)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex justify-between">
              <span>Cumulative Profit:</span>
              <span className="font-bold font-mono">+{formatCurrency(totalLifetimeProfit)}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400">
            Total sales processed through register
          </div>
        </div>

        {/* Average Profit Margin */}
        <div className="saas-card p-5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Overall Profit Margin
          </span>

          <div className="my-2">
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {totalLifetimeRevenue > 0
                ? `${((totalLifetimeProfit / totalLifetimeRevenue) * 100).toFixed(1)}%`
                : '0.0%'}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Average markup across all lines
            </p>
          </div>

          <div className="text-[10px] text-slate-400">
            Calculated as Profit ÷ Gross Sales
          </div>
        </div>

      </div>

      {/* 7-Day Interactive Sales Chart Card */}
      <div className="saas-card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              7-Day Daily Revenue Trend
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Weekly total: {formatCurrency(sevenDaysRevenue)}
          </span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48">
          {last7Days.map((day, i) => {
            const heightPct = Math.max(8, Math.round((day.revenue / maxDailyRev) * 100));
            const isToday = i === 6;

            return (
              <div key={day.dayStr} className="flex flex-col items-center justify-end h-full group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-1 whitespace-nowrap">
                  ৳{day.revenue}
                </div>
                <div 
                  className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                    isToday 
                      ? 'bg-emerald-600 dark:bg-emerald-500 shadow-md shadow-emerald-600/20' 
                      : day.revenue > 0 
                        ? 'bg-slate-800 dark:bg-slate-300 group-hover:bg-emerald-500' 
                        : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className={`text-[10px] font-bold mt-2 font-mono ${isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {isToday ? 'Today' : day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Methods Distribution */}
        <div className="saas-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <span>Payment Channels</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {formatCurrency(totalPayments)}
            </span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0;
              if (amount === 0 && method !== 'cash' && method !== 'bkash') return null;

              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="capitalize text-slate-600 dark:text-slate-400">{method}</span>
                    <span className="font-mono text-slate-900 dark:text-white font-bold">
                      {formatCurrency(amount)} <span className="text-slate-400 text-[10px] font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        method === 'bkash' ? 'bg-pink-500' :
                        method === 'due' ? 'bg-amber-500' :
                        method === 'nagad' ? 'bg-orange-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Best-Selling Products */}
        <div className="lg:col-span-2 saas-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top 5 Best-Selling Products</span>
            </h3>
            <span className="text-xs text-slate-400">Ranked by Revenue</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No sales recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.count} units sold
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(p.revenue)}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      +{formatCurrency(p.profit)} profit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Transaction Log */}
      <div className="space-y-3 pt-2">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
          Recent Sales Transaction Log
        </h3>
        <TransactionList
          sales={sales}
          onViewReceipt={onViewReceipt}
          onRefundSale={onRefundSale}
        />
      </div>

    </div>
  );
}
