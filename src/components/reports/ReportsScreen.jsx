import React, { useState } from 'react';
import {
  Award,
  CreditCard,
  FileSpreadsheet,
  BarChart2,
  TrendingUp,
  Percent
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import TransactionList from './TransactionList';

const METHOD_META = {
  cash: { label: 'Cash', color: '#10B981' },
  bkash: { label: 'bKash', color: '#E2136E' },
  nagad: { label: 'Nagad', color: '#F26522' },
  rocket: { label: 'Rocket', color: '#8B5CF6' },
  card: { label: 'Card', color: '#3B82F6' },
  due: { label: 'Due / Baki', color: '#F59E0B' }
};

export default function ReportsScreen({
  analytics,
  sales,
  onViewReceipt,
  onRefundSale,
  onExportReport
}) {
  const [hoveredDayIdx, setHoveredDayIdx] = useState(null);

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
  const overallMargin =
    totalLifetimeRevenue > 0
      ? ((totalLifetimeProfit / totalLifetimeRevenue) * 100).toFixed(1)
      : '0.0';

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayLabel = i === 6 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

    const daySales = sales.filter((s) => {
      const sDate = (s.timestamp || s.date || '').split('T')[0];
      return sDate === dayStr;
    });

    const revenue = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const profit = daySales.reduce((sum, s) => sum + (s.netProfit || 0), 0);

    return { dayStr, dayLabel, revenue, profit, count: daySales.length };
  });

  const maxDailyRev = Math.max(...last7Days.map((d) => d.revenue), 5000);
  const topProductMaxRev = Math.max(...topProducts.map((p) => p.revenue || 0), 1);

  // SVG Chart Geometry (viewBox 560 x 180)
  const svgW = 560;
  const svgH = 170;
  const padX = 28;
  const padTop = 18;
  const padBottom = 18;
  const usableH = svgH - padTop - padBottom;
  const stepX = (svgW - padX * 2) / 6;

  const chartPoints = last7Days.map((day, idx) => {
    const x = padX + idx * stepX;
    const ratio = day.revenue / maxDailyRev;
    const y = padTop + usableH - ratio * usableH;
    return { ...day, x, y, idx };
  });

  const polylinePts = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${chartPoints[0].x},${svgH - padBottom} ${chartPoints
    .map((p) => `L ${p.x},${p.y}`)
    .join(' ')} L ${chartPoints[chartPoints.length - 1].x},${svgH - padBottom} Z`;

  const activeHoverDay = hoveredDayIdx !== null ? chartPoints[hoveredDayIdx] : null;

  const paymentEntries = Object.entries(paymentBreakdown).filter(
    ([method, amount]) => amount > 0 || method === 'cash' || method === 'bkash'
  );

  return (
    <div className="space-y-5 animate-soft-enter">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Executive Analytics & Profit Ledger
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Real-time gross margin, 7-day trend curve, and MFS channel velocity
          </p>
        </div>

        {onExportReport && (
          <button
            type="button"
            onClick={onExportReport}
            className="tactile-press px-4 py-2 rounded-xl text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            <FileSpreadsheet className="w-4 h-4" strokeWidth={1.85} />
            <span>Export Full Report (.xlsx)</span>
          </button>
        )}
      </div>

      {/* Asymmetric Bento Row 1: Hero Margin Card (5 cols) + SVG Revenue Trend Chart (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Hero Revenue & Margin Bento */}
        <div className="lg:col-span-5 pos-surface p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="text-[10.5px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span>Today's Gross Revenue</span>
              </span>
              <div
                className="text-3xl font-extrabold font-mono tracking-tight mt-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatCurrency(todayRevenue)}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                  +{formatCurrency(todayProfit)} net profit
                </span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span style={{ color: 'var(--text-secondary)' }}>{todaySalesCount} orders</span>
              </div>
            </div>

            <div
              className="px-2.5 py-1.5 rounded-xl border text-right shrink-0"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'rgba(16, 185, 129, 0.25)'
              }}
            >
              <div className="flex items-center justify-end gap-1 text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                <Percent className="w-3 h-3" />
                <span>Margin</span>
              </div>
              <div className="text-base font-extrabold font-mono" style={{ color: 'var(--accent)' }}>
                {overallMargin}%
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-3 pt-4 border-t"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="text-[10.5px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Past 7 Days
              </div>
              <div className="text-base font-bold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(sevenDaysRevenue)}
              </div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                +{formatCurrency(sevenDaysProfit)} profit
              </div>
            </div>

            <div
              className="p-3 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-hairline)'
              }}
            >
              <div className="text-[10.5px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Lifetime ({totalTransactionsCount})
              </div>
              <div className="text-base font-bold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(totalLifetimeRevenue)}
              </div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--accent)' }}>
                +{formatCurrency(totalLifetimeProfit)} profit
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 7-Day SVG Area + Column Trend */}
        <div className="lg:col-span-7 pos-surface p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border-hairline)' }}>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.85} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                7-Day Revenue Trajectory
              </h3>
            </div>

            {activeHoverDay ? (
              <div
                className="px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)'
                }}
              >
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {activeHoverDay.dayLabel}:
                </span>
                <span style={{ color: 'var(--accent)' }}>{formatCurrency(activeHoverDay.revenue)}</span>
                <span style={{ color: 'var(--text-muted)' }}>({activeHoverDay.count} orders)</span>
              </div>
            ) : (
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Hover data points for breakdown
              </span>
            )}
          </div>

          <div className="pt-3">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="dokanRevArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0.25, 0.5, 0.75, 1].map((t) => {
                const y = padTop + usableH * (1 - t);
                return (
                  <line
                    key={t}
                    x1={padX}
                    x2={svgW - padX}
                    y1={y}
                    y2={y}
                    stroke="var(--border-hairline)"
                    strokeDasharray="3 4"
                  />
                );
              })}

              {/* Area Fill */}
              <path d={areaPath} fill="url(#dokanRevArea)" />

              {/* Subtle Vertical Columns */}
              {chartPoints.map((p) => {
                const barH = Math.max(4, svgH - padBottom - p.y);
                const isHovered = hoveredDayIdx === p.idx;
                return (
                  <rect
                    key={p.dayStr}
                    x={p.x - 10}
                    y={p.y}
                    width={20}
                    height={barH}
                    rx={4}
                    fill={
                      isHovered || p.idx === 6
                        ? 'rgba(16, 185, 129, 0.28)'
                        : 'rgba(148, 163, 184, 0.12)'
                    }
                  />
                );
              })}

              {/* Crisp Trend Polyline */}
              <polyline
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePts}
              />

              {/* Interactive Data Nodes */}
              {chartPoints.map((p) => {
                const isHovered = hoveredDayIdx === p.idx;
                return (
                  <g
                    key={`node-${p.dayStr}`}
                    onMouseEnter={() => setHoveredDayIdx(p.idx)}
                    onMouseLeave={() => setHoveredDayIdx(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered || p.idx === 6 ? 4.5 : 3}
                      fill="var(--bg-surface)"
                      stroke="var(--accent)"
                      strokeWidth="2.25"
                    />
                    <text
                      x={p.x}
                      y={svgH - 2}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                      fontWeight={p.idx === 6 || isHovered ? '700' : '500'}
                      fill={p.idx === 6 || isHovered ? 'var(--accent)' : 'var(--text-muted)'}
                    >
                      {p.dayLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Asymmetric Bento Row 2: Payment Channels (5 cols) + Top 5 Products (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Payment Channels Bento */}
        <div className="lg:col-span-5 pos-surface p-5 space-y-4">
          <div
            className="flex items-center justify-between pb-2.5 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <CreditCard className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.85} />
              <span>Payment Channels</span>
            </h3>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {formatCurrency(totalPayments)}
            </span>
          </div>

          {/* Multi-segment stacked bar */}
          <div
            className="w-full h-2.5 rounded-full overflow-hidden flex gap-0.5"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
          >
            {paymentEntries.map(([method, amount]) => {
              const pct = totalPayments > 0 ? (amount / totalPayments) * 100 : 0;
              if (pct <= 0) return null;
              const meta = METHOD_META[method] || { color: 'var(--accent)' };
              return (
                <div
                  key={method}
                  style={{ width: `${pct}%`, backgroundColor: meta.color }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                  title={`${method}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            {paymentEntries.map(([method, amount]) => {
              const pct = totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0;
              const meta = METHOD_META[method] || { label: method, color: 'var(--accent)' };

              return (
                <div
                  key={method}
                  className="p-2.5 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-hairline)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(amount)}{' '}
                    <span className="text-[10px] font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
                      ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Products Bento */}
        <div className="lg:col-span-7 pos-surface p-5 space-y-4">
          <div
            className="flex items-center justify-between pb-2.5 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Award className="w-4 h-4" style={{ color: 'var(--warning)' }} strokeWidth={1.85} />
              <span>Top 5 Best-Selling Products</span>
            </h3>
            <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
              By Gross Revenue
            </span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No sales recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => {
                const barWidth = Math.max(8, Math.round(((p.revenue || 0) / topProductMaxRev) * 100));
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shrink-0 border"
                          style={{
                            backgroundColor: idx === 0 ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                            borderColor: idx === 0 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-hairline)',
                            color: idx === 0 ? 'var(--accent)' : 'var(--text-secondary)'
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {p.name}
                          </div>
                          <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {p.count} units sold
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(p.revenue)}
                        </div>
                        <div className="text-[10px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
                          +{formatCurrency(p.profit)} profit
                        </div>
                      </div>
                    </div>

                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-subtle)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: idx === 0 ? 'var(--accent)' : 'rgba(16, 185, 129, 0.55)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Log */}
      <div className="space-y-3 pt-1">
        <h3 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
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
