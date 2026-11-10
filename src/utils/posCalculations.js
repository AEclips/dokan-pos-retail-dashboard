/**
 * Calculate Cart Totals
 */
export function calculateCartTotals(cartItems = [], flatDiscount = 0, taxRate = 0) {
  let subtotal = 0;
  let totalItemDiscounts = 0;
  let totalBuyingCost = 0;
  let totalItemCount = 0;

  for (const item of cartItems) {
    const qty = parseInt(item.quantity) || 1;
    const price = parseFloat(item.sellingPrice) || 0;
    const cost = parseFloat(item.buyingPrice) || 0;
    const disc = parseFloat(item.itemDiscount) || 0;

    const itemSubtotal = price * qty;
    const itemTotalDiscount = disc * qty;

    subtotal += itemSubtotal;
    totalItemDiscounts += itemTotalDiscount;
    totalBuyingCost += cost * qty;
    totalItemCount += qty;
  }

  const effectiveFlatDiscount = parseFloat(flatDiscount) || 0;
  const totalDiscount = totalItemDiscounts + effectiveFlatDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxAmount = (taxableAmount * (parseFloat(taxRate) || 0)) / 100;
  const grandTotal = Math.max(0, taxableAmount + taxAmount);
  const netProfit = Math.max(0, grandTotal - totalBuyingCost);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalItemDiscounts: Number(totalItemDiscounts.toFixed(2)),
    flatDiscount: Number(effectiveFlatDiscount.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    totalBuyingCost: Number(totalBuyingCost.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    totalItemCount
  };
}

/**
 * Calculate Product Profit Margin %
 */
export function calculateProfitMargin(buyingPrice, sellingPrice) {
  const buy = parseFloat(buyingPrice) || 0;
  const sell = parseFloat(sellingPrice) || 0;
  if (sell <= 0) return 0;
  const margin = ((sell - buy) / sell) * 100;
  return Number(margin.toFixed(1));
}

/**
 * Calculate Overall Inventory Statistics
 */
export function calculateInventoryStats(products = []) {
  let totalProductsCount = products.length;
  let totalStockUnits = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const p of products) {
    const qty = parseInt(p.stockQuantity) || 0;
    const buy = parseFloat(p.buyingPrice) || 0;
    const sell = parseFloat(p.sellingPrice) || 0;
    const minAlert = parseInt(p.minStockAlert) || 5;

    totalStockUnits += qty;
    totalCostValue += qty * buy;
    totalRetailValue += qty * sell;

    if (qty === 0) {
      outOfStockCount++;
    } else if (qty <= minAlert) {
      lowStockCount++;
    }
  }

  const potentialGrossProfit = Math.max(0, totalRetailValue - totalCostValue);

  return {
    totalProductsCount,
    totalStockUnits,
    totalCostValue: Number(totalCostValue.toFixed(2)),
    totalRetailValue: Number(totalRetailValue.toFixed(2)),
    potentialGrossProfit: Number(potentialGrossProfit.toFixed(2)),
    lowStockCount,
    outOfStockCount
  };
}

/**
 * Calculate Sales Analytics (Today, 7-Day, Overall, Payment breakdown, Top items)
 */
export function calculateSalesAnalytics(sales = []) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = todayStart - (7 * 86400000);

  let todayRevenue = 0;
  let todayProfit = 0;
  let todaySalesCount = 0;

  let sevenDaysRevenue = 0;
  let sevenDaysProfit = 0;

  let totalLifetimeRevenue = 0;
  let totalLifetimeProfit = 0;
  let totalTransactionsCount = sales.length;

  const paymentBreakdown = {
    cash: 0,
    bkash: 0,
    nagad: 0,
    rocket: 0,
    card: 0,
    due: 0,
    split: 0
  };

  const productSalesMap = {}; // { prodId: { name, count, revenue, profit } }

  for (const sale of sales) {
    const saleTime = new Date(sale.timestamp).getTime();
    const grandTotal = parseFloat(sale.grandTotal) || 0;
    const netProfit = parseFloat(sale.netProfit) || 0;
    const method = sale.paymentMethod || 'cash';

    totalLifetimeRevenue += grandTotal;
    totalLifetimeProfit += netProfit;

    if (paymentBreakdown[method] !== undefined) {
      paymentBreakdown[method] += grandTotal;
    } else {
      paymentBreakdown.cash += grandTotal;
    }

    if (saleTime >= todayStart) {
      todayRevenue += grandTotal;
      todayProfit += netProfit;
      todaySalesCount++;
    }

    if (saleTime >= sevenDaysAgo) {
      sevenDaysRevenue += grandTotal;
      sevenDaysProfit += netProfit;
    }

    // Tally item counts
    if (sale.items) {
      for (const item of sale.items) {
        const pId = item.productId || item.name;
        if (!productSalesMap[pId]) {
          productSalesMap[pId] = {
            name: item.name,
            count: 0,
            revenue: 0,
            profit: 0
          };
        }
        const qty = parseInt(item.quantity) || 1;
        const itmTotal = parseFloat(item.total) || (parseFloat(item.sellingPrice) * qty);
        const itmCost = (parseFloat(item.buyingPrice) || 0) * qty;

        productSalesMap[pId].count += qty;
        productSalesMap[pId].revenue += itmTotal;
        productSalesMap[pId].profit += (itmTotal - itmCost);
      }
    }
  }

  // Sort top 5 products by revenue
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    todayRevenue: Number(todayRevenue.toFixed(2)),
    todayProfit: Number(todayProfit.toFixed(2)),
    todaySalesCount,
    sevenDaysRevenue: Number(sevenDaysRevenue.toFixed(2)),
    sevenDaysProfit: Number(sevenDaysProfit.toFixed(2)),
    totalLifetimeRevenue: Number(totalLifetimeRevenue.toFixed(2)),
    totalLifetimeProfit: Number(totalLifetimeProfit.toFixed(2)),
    totalTransactionsCount,
    paymentBreakdown,
    topProducts
  };
}

/**
 * Calculate Customer Dues Summary
 */
export function calculateDuesSummary(dues = []) {
  let totalDuesBalance = 0;
  let customersWithDueCount = 0;

  for (const d of dues) {
    const bal = parseFloat(d.totalDueBalance) || 0;
    if (bal > 0) {
      totalDuesBalance += bal;
      customersWithDueCount++;
    }
  }

  return {
    totalDuesBalance: Number(totalDuesBalance.toFixed(2)),
    customersWithDueCount
  };
}
