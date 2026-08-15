/**
 * UI Screenshot Capture Script
 * Captures all major views/screens of the BetterRX DME Direct prototype.
 * 
 * Run: node scripts/capture-screens.mjs
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const PORT = 4199;
const ROOT = process.cwd();
const OUT = join(ROOT, 'screenshots');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.json': 'application/json' };

const server = createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  const path = join(ROOT, file);
  if (!existsSync(path)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
  res.end(readFileSync(path));
});

server.listen(PORT, async () => {
  console.log(`Serving on http://localhost:${PORT}`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const url = `http://localhost:${PORT}`;

  async function shot(name) {
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
    console.log(`  ✓ ${name}.png`);
  }

  // Navigate by manipulating state directly — more reliable than clicking through overlays
  async function nav(stateOverrides, uiOverrides) {
    await page.evaluate(({ s, u }) => {
      const state = JSON.parse(localStorage.getItem('betterrx-provider-demo') || '{}');
      Object.assign(state, s);
      localStorage.setItem('betterrx-provider-demo', JSON.stringify(state));
      // Trigger re-render by reloading
    }, { s: stateOverrides || {}, u: uiOverrides || {} });
    await page.reload();
    await page.waitForTimeout(600);
  }

  // ===== LANDING & AUTH SCREENS =====
  
  // 01 - Landing
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);
  await shot('01-landing');

  // 02 - Provider Login
  await page.click('[data-action="provider-login"]');
  await page.waitForTimeout(300);
  await shot('02-provider-login');

  // ===== ADMISSION NURSE VIEWS =====
  
  // 03 - Admission Home
  await nav({ screen: 'portal', role: 'admission', view: 'home', selectedOrder: null, selectedVendor: null });
  await shot('03-admission-home');

  // 04 - New Order Stage 1 (Patient)
  await nav({ view: 'new', selectedOrder: null, selectedVendor: null });
  await shot('04-new-order-patient');

  // 05 - EHR Pull + Duplicate detected
  await nav({ screen: 'portal', role: 'admission', view: 'new', selectedOrder: null, selectedVendor: null,
    draft: { ehr: true, patient: 'Jordan M.', address: '1452 East Willow Lane, Salt Lake City, UT', items: ['Hospital Bed E0260','Oxygen Concentrator E1390'], categories: ['Beds / support surfaces','Oxygen / respiratory'], standing: false, timeline: '4', rentalDays: 21, severeEvent: true, disruptionType: 'Winter Storm Warning', vendor: 'abc', verified: false, vendorVerificationFailed: false, vendorVerifyNote: '', vendorVerifiedBy: '', vendorVerifiedAt: '', vendorVerificationResponses: null, notes: '', savedLocal: false, duplicateResolution: '', duplicateNote: '', duplicateResolvedBy: '', duplicateResolvedAt: '', duplicatePendingDisposition: '', duplicatePendingNote: '' }
  });
  await shot('05-new-order-ehr-duplicate');

  // 06 - Standing Orders (stage 2) - resolve duplicate first
  await nav({ screen: 'portal', role: 'admission', view: 'new', selectedOrder: null, selectedVendor: null,
    draft: { ehr: true, patient: 'Jordan M.', address: '1452 East Willow Lane, Salt Lake City, UT', items: ['Hospital Bed E0260','Oxygen Concentrator E1390'], categories: ['Beds / support surfaces','Oxygen / respiratory'], standing: false, timeline: '4', rentalDays: 21, severeEvent: true, disruptionType: 'Winter Storm Warning', vendor: 'abc', verified: false, vendorVerificationFailed: false, vendorVerifyNote: '', vendorVerifiedBy: '', vendorVerifiedAt: '', vendorVerificationResponses: null, notes: '', savedLocal: false, duplicateResolution: 'not_duplicate', duplicateNote: 'Verified with respiratory — different location.', duplicateResolvedBy: 'Admission Nurse', duplicateResolvedAt: 'Aug 15, 12:30 PM', duplicatePendingDisposition: '', duplicatePendingNote: '' }
  });
  // Click stage 2 tab
  await page.click('button[data-stage="2"]', { force: true });
  await page.waitForTimeout(400);
  await shot('06-new-order-standing');

  // 07 - Vendor & Risk (stage 3) - set standing=true
  await nav({ screen: 'portal', role: 'admission', view: 'new', selectedOrder: null, selectedVendor: null,
    draft: { ehr: true, patient: 'Jordan M.', address: '1452 East Willow Lane, Salt Lake City, UT', items: ['Hospital Bed E0260','Oxygen Concentrator E1390'], categories: ['Beds / support surfaces','Oxygen / respiratory'], standing: true, timeline: '4', rentalDays: 21, severeEvent: true, disruptionType: 'Winter Storm Warning', vendor: 'abc', verified: false, vendorVerificationFailed: false, vendorVerifyNote: '', vendorVerifiedBy: '', vendorVerifiedAt: '', vendorVerificationResponses: null, notes: '', savedLocal: false, duplicateResolution: 'not_duplicate', duplicateNote: 'Verified with respiratory — different location.', duplicateResolvedBy: 'Admission Nurse', duplicateResolvedAt: 'Aug 15, 12:30 PM', duplicatePendingDisposition: '', duplicatePendingNote: '' }
  });
  await page.click('button[data-stage="3"]', { force: true });
  await page.waitForTimeout(600);
  // Modal may have opened (vendor verify) — screenshot it
  const modalCount = await page.locator('.modal').count();
  if (modalCount > 0) {
    await shot('07-vendor-verification-modal');
    await page.click('[data-action="close-action-modal"]', { force: true });
    await page.waitForTimeout(400);
  }
  await shot('08-new-order-vendor-risk');

  // 09 - Review (stage 4) - set verified=true
  await nav({ screen: 'portal', role: 'admission', view: 'new', selectedOrder: null, selectedVendor: null,
    draft: { ehr: true, patient: 'Jordan M.', address: '1452 East Willow Lane, Salt Lake City, UT', items: ['Hospital Bed E0260','Oxygen Concentrator E1390'], categories: ['Beds / support surfaces','Oxygen / respiratory'], standing: true, timeline: '4', rentalDays: 21, severeEvent: true, disruptionType: 'Winter Storm Warning', vendor: 'abc', verified: true, vendorVerificationFailed: false, vendorVerifyNote: 'Sarah confirmed availability.', vendorVerifiedBy: 'Admission Nurse', vendorVerifiedAt: 'Aug 15, 12:42 PM', vendorVerificationResponses: {equipment:'yes',timeline:'yes',address:'yes',operations:'yes'}, notes: '', savedLocal: false, duplicateResolution: 'not_duplicate', duplicateNote: 'Verified with respiratory — different location.', duplicateResolvedBy: 'Admission Nurse', duplicateResolvedAt: 'Aug 15, 12:30 PM', duplicatePendingDisposition: '', duplicatePendingNote: '' }
  });
  await page.click('button[data-stage="4"]', { force: true });
  await page.waitForTimeout(400);
  await shot('09-new-order-review');

  // ===== ORDERS VIEWS =====
  
  // 10 - Existing Orders
  await nav({ view: 'existing', selectedOrder: null, selectedVendor: null });
  await shot('10-existing-orders');

  // 11 - Order Drawer
  await nav({ view: 'existing', selectedOrder: 'BRX-10482', selectedVendor: null });
  await shot('11-order-drawer');

  // 12 - Past Orders
  await nav({ view: 'past', selectedOrder: null, selectedVendor: null });
  await shot('12-past-orders');

  // ===== DON VIEWS =====
  
  // 13 - DON Home (with leadership dashboard)
  await nav({ role: 'don', view: 'home', selectedOrder: null, selectedVendor: null });
  await shot('13-don-home');

  // 14 - Vendor Management
  await nav({ role: 'don', view: 'vendors', selectedOrder: null, selectedVendor: null });
  await shot('14-vendor-management');

  // 15 - Vendor Drawer (profile)
  await nav({ role: 'don', view: 'vendors', selectedVendor: 'abc', selectedOrder: null });
  await shot('15-vendor-drawer');

  // 16 - Reports
  await nav({ role: 'don', view: 'reports', selectedOrder: null, selectedVendor: null });
  await shot('16-reports-leadership');

  // 17 - Messages
  await nav({ role: 'don', view: 'messages', selectedOrder: null, selectedVendor: null });
  await shot('17-messages');

  // 18 - Settings
  await nav({ role: 'don', view: 'settings', selectedOrder: null, selectedVendor: null });
  await shot('18-settings');

  // ===== EXECUTIVE VIEWS =====
  
  // 19 - Executive Home
  await nav({ role: 'executive', view: 'home', selectedOrder: null, selectedVendor: null });
  await shot('19-executive-home');

  // ===== VENDOR SCREENS =====
  
  // 20 - Vendor Login
  await nav({ screen: 'vendor-login' });
  await shot('20-vendor-login');

  // 21 - Vendor Portal
  await nav({ screen: 'vendor-portal' });
  await shot('21-vendor-portal');

  // 22 - Vendor Enrollment
  await nav({ screen: 'join' });
  await shot('22-vendor-enrollment');

  // ===== MOBILE VIEWS =====
  await page.setViewportSize({ width: 390, height: 844 });

  // 23 - Mobile Landing
  await nav({ screen: 'landing' });
  await shot('23-mobile-landing');

  // 24 - Mobile Provider Home
  await nav({ screen: 'portal', role: 'admission', view: 'home', selectedOrder: null, selectedVendor: null });
  await shot('24-mobile-admission-home');

  // 25 - Mobile Existing Orders
  await nav({ screen: 'portal', role: 'admission', view: 'existing', selectedOrder: null, selectedVendor: null });
  await shot('25-mobile-existing-orders');

  // 26 - Mobile New Order
  await nav({ screen: 'portal', role: 'admission', view: 'new', selectedOrder: null, selectedVendor: null });
  await shot('26-mobile-new-order');

  await browser.close();
  server.close();
  console.log(`\nDone! ${Object.keys(Array(26).fill(0)).length + 1} screenshots saved to: ${OUT}`);
});
