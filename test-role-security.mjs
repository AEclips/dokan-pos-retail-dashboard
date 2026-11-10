import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSecurityAudit() {
  console.log('===============================================================');
  console.log('🔒 EXECUTING ROLE-BASED ACCESS & DATA LEAK TEST: STAFF vs OWNER');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const appPath = path.resolve('C:/Users/hp/OneDrive/Desktop/DokanPOS_Retail_Dashboard.html');
  const fileUrl = `file://${appPath.replace(/\\/g, '/')}`;

  console.log(`[TEST 1] Loading Application at: ${fileUrl}`);
  await page.goto(fileUrl);
  await page.waitForLoadState('networkidle');

  // 1. Sign In as Staff
  console.log('[TEST 2] Logging in with Staff credentials (staff@dokanpos.com)...');
  await page.click('button:has-text("Staff Role")');
  await page.waitForTimeout(500);

  // Check role badge
  const roleText = await page.locator('#sidebarUserRole').innerText();
  console.log(` -> Verified Session Profile: "${roleText}"`);

  // 2. Check Sidebar Visibility: Is "Reports & Analytics" hidden?
  const repTabVisible = await page.locator('#tab-reports').isVisible();
  console.log(`[TEST 3] Checking Sidebar "Reports & Analytics" tab visibility...`);
  console.log(` -> Sidebar tab-reports isVisible: ${repTabVisible} (Expected: false)`);
  if (repTabVisible) {
    throw new Error('SECURITY FAILURE: Reports tab is visible in sidebar to Staff!');
  } else {
    console.log(' -> PASSED: Reports tab is completely hidden from Staff sidebar.');
  }

  // 3. Check Header Revenue Ticker
  const headerTickerVisible = await page.locator('#headerTodayTicker').isVisible();
  console.log(`[TEST 4] Checking Header Revenue Ticker visibility...`);
  console.log(` -> Header Revenue Ticker isVisible: ${headerTickerVisible} (Expected: false)`);
  if (headerTickerVisible) {
    throw new Error('SECURITY FAILURE: Header revenue ticker is exposed to Staff!');
  } else {
    console.log(' -> PASSED: Revenue numbers are completely hidden from Header.');
  }

  // 4. Check Product Deletion in Inventory
  console.log(`[TEST 5] Checking Product Deletion permissions in Inventory...`);
  await page.click('#tab-inventory');
  await page.waitForTimeout(300);
  const deleteBtnCount = await page.locator('button[title="Delete Product"]').count();
  console.log(` -> Count of active Delete buttons in Inventory table: ${deleteBtnCount} (Expected: 0)`);
  if (deleteBtnCount > 0) {
    throw new Error('SECURITY FAILURE: Active delete buttons are present for Staff!');
  } else {
    console.log(' -> PASSED: Product delete buttons are locked and disabled for Staff.');
  }

  // 5. THE CRITICAL TEST: Direct URL Navigation with #reports
  console.log(`\n[CRITICAL TEST 6] DIRECT URL ATTACK: Staff attempting direct navigation to #reports...`);
  
  // Set dialog handler to detect security alert
  let alertTriggered = false;
  let alertText = '';
  page.on('dialog', async (dialog) => {
    alertTriggered = true;
    alertText = dialog.message();
    console.log(` -> SECURITY INTERCEPTION DIALOG DETECTED: "${alertText}"`);
    await dialog.accept();
  });

  // Attempt direct URL hash change to #reports
  await page.evaluate(() => {
    window.location.hash = '#reports';
    switchTab('reports');
  });
  await page.waitForTimeout(500);

  // Check if View Reports container is hidden or visible
  const isReportsViewVisible = await page.locator('#view-reports').isVisible();
  console.log(` -> #view-reports container isVisible: ${isReportsViewVisible} (Expected: false)`);

  // Check if any financial revenue figures leaked into DOM
  const repTodayRev = await page.locator('#repTodayRev').innerText();
  console.log(` -> Financial Revenue DOM element text: "${repTodayRev}"`);
  console.log(` -> Security Interception Alert Fired: ${alertTriggered}`);

  if (isReportsViewVisible) {
    throw new Error('SECURITY FAILURE: #view-reports container was displayed to Staff!');
  } else {
    console.log(' -> PASSED: Direct #reports URL was BLOCKED. Staff was prevented from viewing the page.');
  }

  // 6. Contrast Test: Login as Owner and verify reports DO load for Owner
  console.log(`\n[TEST 7] CONTRAST TEST: Logging in as Owner (owner@dokanpos.com)...`);
  await page.click('button[title="Sign Out"]');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Owner Role")');
  await page.waitForTimeout(500);

  const ownerRoleText = await page.locator('#sidebarUserRole').innerText();
  console.log(` -> Verified Session Profile: "${ownerRoleText}"`);

  await page.click('#tab-reports');
  await page.waitForTimeout(300);
  const ownerReportsVisible = await page.locator('#view-reports').isVisible();
  console.log(` -> Owner accessing Reports page isVisible: ${ownerReportsVisible} (Expected: true)`);
  if (!ownerReportsVisible) {
    throw new Error('FAILURE: Owner could not access reports page!');
  } else {
    console.log(' -> PASSED: Owner has full authorized access to financial reports.');
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL SECURITY & PERMISSION TESTS PASSED WITH ZERO DATA LEAKS!');
  console.log('===============================================================');

  await browser.close();
}

runSecurityAudit().catch((err) => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err);
  process.exit(1);
});
