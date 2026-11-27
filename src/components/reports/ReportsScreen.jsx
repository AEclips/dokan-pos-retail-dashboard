import React, { useState, useMemo } from 'react';
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

function buildSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${midX},${p0.y.toFixed(1)} ${midX},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  return d;
}

function buildSmoothArea(points, baseY) {
  if (!points || points.length === 0) return '';
  const curve = buildSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${curve} L ${last.x.toFixed(1)},${baseY} L ${first.x.toFixed(1)},${baseY} Z`;
}

function formatAxisTick(val) {
  if (val >= 1000) {
    const k = val / 1000;
    return `৳${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `৳${Math.round(val)}`;
}

export default function ReportsScreen({
  analytics,
  sales,
  onViewReceipt,
  onRefundSale,
  onExportReport
}) {
  const [rangeDays, setRangeDays] = useState(7);
  const [seriesMode, setSeriesMode] = useState('both'); // 'both' | 'revenue' | 'profit'
  const [hoveredIdx, setHoveredIdx] = useState(null);

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

  const seriesData = useMemo(() => {
    return Array.from({ length: rangeDays }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (rangeDays - 1 - i));
      const dayStr = d.toISOString().split('T')[0];
      const dayLabel =
        i === rangeDays - 1
          ? 'Today'
          : rangeDays <= 7
          ? d.toLocaleDateString('en-US', { weekday: 'short' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const daySales = sales.filter((s) => {
        const sDate = (s.timestamp || s.date || '').split('T')[0];
        return sDate === dayStr;
      });

      const revenue = daySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      const profit = daySales.reduce((sum, s) => sum + (s.netProfit || 0), 0);

      return { dayStr, dayLabel, revenue, profit, count: daySales.length };
    });
  }, [sales, rangeDays]);

  const rawMax = Math.max(
    ...seriesData.map((d) =>
      seriesMode === 'profit' ? d.profit : Math.max(d.revenue, d.profit)
    ),
    1000
  );
  // Round ceiling up to a clean nice number
  const maxVal = Math.ceil((rawMax * 1.15) / 1000) * 1000 || 5000;

  // SVG Chart Geometry
  const svgW = 600;
  const svgH = 200;
  const padLeft = 48;
  const padRight = 18;
  const padTop = 16;
  const padBottom = 26;
  const usableW = svgW - padLeft - padRight;
  const usableH = svgH - padTop - padBottom;
  const baseY = svgH - padBottom;
  const stepX = seriesData.length > 1 ? usableW / (seriesData.length - 1) : 0;

  const chartPoints = seriesData.map((day, idx) => {
    const x = padLeft + idx * stepX;
    const revY = padTop + usableH - (day.revenue / maxVal) * usableH;
    const profY = padTop + usableH - (day.profit / maxVal) * usableH;
    return { ...day, x, revY, profY, idx };
  });

  const revPoints = chartPoints.map((p) => ({ x: p.x, y: p.revY }));
  const profPoints = chartPoints.map((p) => ({ x: p.x, y: p.profY }));

  const revPath = buildSmoothPath(revPoints);
  const revArea = buildSmoothArea(revPoints, baseY);
  const profPath = buildSmoothPath(profPoints);
  const profArea = buildSmoothArea(profPoints, baseY);

  const activePoint = hoveredIdx !== null ? chartPoints[hoveredIdx] : chartPoints[chartPoints.length - 1];
  const labelEvery = rangeDays <= 7 ? 1 : rangeDays <= 14 ? 2 : 5;

  const topProductMaxRev = Math.max(...topProducts.map((p) => p.revenue || 0), 1);

  const paymentEntries = Object.entries(paymentBreakdown).filter(
    ([method, amount]) => amount > 0 || method === 'cash' || method === 'bkash'
  );

  // Clover-style Donut Ring Geometry
  const donutRadius = 40;
  const donutCirc = 2 * Math.PI * donutRadius;
  let donutOffset = 0;
  const donutSegments = paymentEntries
    .filter(([, amount]) => amount > 0 && totalPayments > 0)
    .map(([method, amount]) => {
      const segLen = (amount / totalPayments) * donutCirc;
      const seg = {
        method,
        amount,
        pct: Math.round((amount / totalPayments) * 100),
        color: METHOD_META[method]?.color || 'var(--accent)',
        dasharray: `${segLen.toFixed(2)} ${(donutCirc - segLen).toFixed(2)}`,
        dashoffset: -donutOffset
      };
      donutOffset += segLen;
      return seg;
    });

  return (
    <div className="space-y-5 animate-soft-enter">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Executive Analytics & Profit Ledger
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Dual-series revenue vs. net profit trajectory, MFS channel donut, and SKU performance
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

      {/* Asymmetric Bento Row 1: Hero Margin Card (4 cols) + Dual-Series Combo Chart (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Hero Revenue & Margin Bento */}
        <div className="lg:col-span-4 pos-surface p-5 flex flex-col justify-between gap-4">
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
                  +{formatCurrency(todayProfit)} profit
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
            className="grid grid-cols-2 gap-2.5 pt-4 border-t"
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
                +{formatCurrency(sevenDaysProfit)}
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
                +{formatCurrency(totalLifetimeProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Upgraded Dual-Series SVG Chart Card */}
        <div className="lg:col-span-8 pos-surface p-5 flex flex-col justify-between">
          <div
            className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" style={{ color: 'var(--accent)' }} strokeWidth={1.85} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Revenue & Profit Trajectory
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Series Toggle */}
              <div
                className="inline-flex rounded-lg border p-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-hairline)' }}
              >
                {[
                  { id: 'both', label: 'Both' },
                  { id: 'revenue', label: 'Revenue' },
                  { id: 'profit', label: 'Profit' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSeriesMode(m.id)}
                    className="px-2 py-0.5 rounded-md transition-colors"
                    style={{
                      backgroundColor: seriesMode === m.id ? 'var(--bg-surface)' : 'transparent',
                      color: seriesMode === m.id ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Timeframe Switcher */}
              <div
                className="inline-flex rounded-lg border p-0.5 text-[10.5px] font-mono font-bold"
                style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-hairline)' }}
              >
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setRangeDays(days);
                      setHoveredIdx(null);
                    }}
                    className="px-2 py-0.5 rounded-md transition-colors"
                    style={{
                      backgroundColor: rangeDays === days ? 'var(--accent-soft)' : 'transparent',
                      color: rangeDays === days ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Point / Summary Readout Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 text-[11px] font-mono">
            <div className="flex items-center gap-3">
              {(seriesMode === 'both' || seriesMode === 'revenue') && (
                <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                  <span>Revenue</span>
                </span>
              )}
              {(seriesMode === 'both' || seriesMode === 'profit') && (
                <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
                  <span>Net Profit</span>
                </span>
              )}
            </div>

            {activePoint && (
              <div
                className="px-2.5 py-1 rounded-lg border flex flex-wrap items-center gap-2.5"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-hairline)'
                }}
              >
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {activePoint.dayLabel}
                </span>
                <span style={{ color: '#10B981' }}>Rev: {formatCurrency(activePoint.revenue)}</span>
                <span style={{ color: '#06B6D4' }}>Profit: +{formatCurrency(activePoint.profit)}</span>
                <span style={{ color: 'var(--text-muted)' }}>({activePoint.count} orders)</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="dokanRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="dokanProfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Ticks & Dashed Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = baseY - usableH * t;
                const val = maxVal * t;
                return (
                  <g key={t}>
                    <line
                      x1={padLeft}
                      x2={svgW - padRight}
                      y1={y}
                      y2={y}
                      stroke="var(--border-hairline)"
                      strokeDasharray={t === 0 ? undefined : '3 4'}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9.5"
                      fontFamily="var(--font-mono)"
                      fill="var(--text-muted)"
                    >
                      {formatAxisTick(val)}
                    </text>
                  </g>
                );
              })}

              {/* Hover Crosshair */}
              {hoveredIdx !== null && chartPoints[hoveredIdx] && (
                <line
                  x1={chartPoints[hoveredIdx].x}
                  x2={chartPoints[hoveredIdx].x}
                  y1={padTop}
                  y2={baseY}
                  stroke="var(--border-strong)"
                  strokeDasharray="3 3"
                />
              )}

              {/* Subtle Revenue Columns */}
              {(seriesMode === 'both' || seriesMode === 'revenue') &&
                chartPoints.map((p) => {
                  const barH = Math.max(2, baseY - p.revY);
                  const barW = rangeDays <= 7 ? 18 : rangeDays <= 14 ? 10 : 5;
                  return (
                    <rect
                      key={`bar-${p.dayStr}`}
                      x={p.x - barW / 2}
                      y={p.revY}
                      width={barW}
                      height={barH}
                      rx={3}
                      fill={
                        hoveredIdx === p.idx || p.idx === chartPoints.length - 1
                          ? 'rgba(16, 185, 129, 0.22)'
                          : 'rgba(148, 163, 184, 0.08)'
                      }
                    />
                  );
                })}

              {/* Revenue Smooth Curve & Area */}
              {(seriesMode === 'both' || seriesMode === 'revenue') && (
                <>
                  <path d={revArea} fill="url(#dokanRevGrad)" />
                  <path
                    d={revPath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Profit Smooth Curve & Area */}
              {(seriesMode === 'both' || seriesMode === 'profit') && (
                <>
                  <path d={profArea} fill="url(#dokanProfGrad)" />
                  <path
                    d={profPath}
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Interactive Data Points & X-Axis Labels */}
              {chartPoints.map((p) => {
                const isActive = hoveredIdx === p.idx || (hoveredIdx === null && p.idx === chartPoints.length - 1);
                const showLabel = p.idx % labelEvery === 0 || p.idx === chartPoints.length - 1;
                return (
                  <g
                    key={`pt-${p.dayStr}`}
                    onMouseEnter={() => setHoveredIdx(p.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={p.x - (stepX || 24) / 2}
                      y={padTop}
                      width={stepX || 24}
                      height={usableH + 14}
                      fill="transparent"
                    />
                    {(seriesMode === 'both' || seriesMode === 'revenue') && (
                      <circle
                        cx={p.x}
                        cy={p.revY}
                        r={isActive ? 4.5 : 2.5}
                        fill="var(--bg-surface)"
                        stroke="#10B981"
                        strokeWidth="2.2"
                      />
                    )}
                    {(seriesMode === 'both' || seriesMode === 'profit') && (
                      <circle
                        cx={p.x}
                        cy={p.profY}
                        r={isActive ? 4 : 2.2}
                        fill="var(--bg-surface)"
                        stroke="#06B6D4"
                        strokeWidth="2"
                      />
                    )}
                    {showLabel && (
                      <text
                        x={p.x}
                        y={svgH - 4}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontFamily="var(--font-mono)"
                        fontWeight={isActive ? '700' : '500'}
                        fill={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                      >
                        {p.dayLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Asymmetric Bento Row 2: Payment Channels Donut (5 cols) + Top 5 Products (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Payment Channels Bento + Donut Ring */}
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

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Clover-style SVG Donut Ring */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 112 112" className="w-28 h-28 -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={donutRadius}
                  fill="none"
                  stroke="var(--bg-subtle)"
                  strokeWidth="12"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.method}
                    cx="56"
                    cy="56"
                    r={donutRadius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={seg.dasharray}
                    strokeDashoffset={seg.dashoffset}
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[9px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Total
                </span>
                <span className="text-xs font-extrabold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {formatAxisTick(totalPayments)}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2 text-xs">
              {paymentEntries.map(([method, amount]) => {
                const pct = totalPayments > 0 ? Math.round((amount / totalPayments) * 100) : 0;
                const meta = METHOD_META[method] || { label: method, color: 'var(--accent)' };

                return (
                  <div
                    key={method}
                    className="px-2.5 py-2 rounded-xl border flex items-center justify-between"
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
                      <span className="text-[10px] font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
