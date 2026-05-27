import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const frontendDir = join(rootDir, 'frontend');

const html = readFileSync(join(frontendDir, 'index.html'), 'utf8');
const app = readFileSync(join(frontendDir, 'app.js'), 'utf8');
const styles = readFileSync(join(frontendDir, 'styles.css'), 'utf8');

assertContains(html, 'data-view="queue"', 'queue tab');
assertContains(html, 'id="auth-form"', 'auth session form');
assertContains(html, 'id="authLoginCode"', 'auth login code field');
assertContains(html, 'id="queue-form"', 'queue form');
assertContains(html, 'id="queue-export-button"', 'daily operations CSV export button');
assertContains(app, 'function renderQueueBoard()', 'queue board renderer');
assertContains(app, 'function createAuthSession(', 'auth session API helper');
assertContains(app, '/api/auth/sessions', 'auth session endpoint');
assertContains(app, 'fetchRolePermissions', 'role permission admin loader');
assertContains(app, '/api/role-permissions', 'role permission admin endpoint');
assertContains(app, 'Role Permissions', 'role permission admin section');
assertContains(app, 'function createOperationsCharts()', 'operations chart renderer');
assertContains(app, 'function createBarChart(', 'bar chart helper');
assertContains(app, 'function createClaimVisitButton(', 'queue claim action');
assertContains(app, 'function createStartVisitEncounterButton(', 'queue start encounter action');
assertContains(app, 'function userSummary(', 'admin user summary helper');
assertContains(app, 'oidcSubject', 'admin OIDC subject field');
assertContains(app, 'function buildPrescriptionPrintHtml(', 'prescription print HTML builder');
assertContains(app, 'ใบสั่งยา / Prescription', 'prescription print title');
assertContains(app, 'function createPrescriptionEntryForm(', 'prescription entry form');
assertContains(app, '/api/prescription-safety-checks', 'prescription safety check endpoint');
assertContains(app, 'function fetchDrugCatalog(', 'drug catalog loader');
assertContains(app, 'function fetchInventoryLots(', 'inventory lot loader');
assertContains(app, 'function fetchInventoryLocations(', 'inventory location loader');
assertContains(app, 'function fetchInventoryLocationStocks(', 'location stock loader');
assertContains(app, 'function fetchInventoryTransfers(', 'inventory transfer loader');
assertContains(app, '/api/inventory-locations', 'inventory location endpoint');
assertContains(app, '/api/inventory-location-stocks', 'location stock endpoint');
assertContains(app, '/api/inventory-transfers', 'inventory transfer endpoint');
assertContains(app, '/api/inventory-lots/receive', 'inventory lot receiving endpoint');
assertContains(app, '/api/inventory-barcode-scans', 'barcode scan endpoint');
assertContains(app, 'function receiveInventoryLotFromForm(', 'inventory lot receiving form handler');
assertContains(app, 'function createInventoryLocationFromForm(', 'inventory location form handler');
assertContains(app, 'function createInventoryTransferFromForm(', 'inventory transfer form handler');
assertContains(app, 'function createInventoryTransferCard(', 'inventory transfer workflow card');
assertContains(app, 'function createInventoryTransferActions(', 'inventory transfer workflow actions');
assertContains(app, 'function runInventoryTransferAction(', 'inventory transfer action handler');
assertContains(app, 'approvalRequired', 'inventory transfer approval flag');
assertContains(app, 'expiryOverrideReason', 'expiry override reason payload');
assertContains(app, 'fefoOverrideReason', 'FEFO override reason payload');
assertContains(app, 'function findFefoRecommendedLot(', 'FEFO frontend recommendation helper');
assertContains(app, "'approve'", 'inventory transfer approve action');
assertContains(app, "'receive'", 'inventory transfer receive action');
assertContains(app, "'cancel'", 'inventory transfer cancel action');
assertContains(app, 'inventoryLocationId', 'location-aware stock payload');
assertContains(app, 'function createBarcodeScannerPanel(', 'barcode scanner panel');
assertContains(app, "dataset.workflow = 'barcode-scanner-panel'", 'barcode scanner workflow hook');
assertContains(app, 'function buildBarcodeScanResultText(', 'barcode scan result formatter');
assertContains(app, 'function renderBarcodeScanDetail(', 'barcode scan detail renderer');
assertContains(app, 'Keep focus', 'barcode scanner keep focus toggle');
assertContains(app, 'Clear after scan', 'barcode scanner clear toggle');
assertContains(app, 'gs1_gtin', 'GS1 scan detail display');
assertContains(app, 'function buildBarcodeLabelPrintHtml(', 'barcode label print HTML builder');
assertContains(app, 'พิมพ์ labels ทั้งหมด', 'barcode label print action');
assertContains(app, '/api/inventory-barcode-print-jobs', 'barcode print job endpoint');
assertContains(app, '/api/inventory-barcode-print-jobs/${printJobId}/${endpoint}', 'barcode print job recovery endpoint');
assertContains(app, '/api/inventory-barcode-label-templates', 'barcode label template endpoint');
assertContains(app, 'function createInventoryBarcodeLabelTemplateFromForm(', 'barcode label template form handler');
assertContains(app, 'function createLabelTemplateSelectField(', 'barcode label template selector');
assertContains(app, 'function createPrintRecoveryPanel(', 'barcode print recovery panel');
assertContains(app, 'function exportBarcodePrintJob(', 'barcode print job export helper');
assertContains(app, '/api/inventory-printer-profiles', 'printer profile endpoint');
assertContains(app, 'function createInventoryPrinterProfileFromForm(', 'printer profile form handler');
assertContains(app, 'Printer profile', 'printer profile selector label');
assertContains(app, 'printerProfileId', 'barcode print job profile payload');
assertContains(app, 'labelTemplateId', 'barcode print job template payload');
assertContains(app, 'fallbackStatus', 'barcode print fallback payload');
assertContains(app, 'Export ZPL', 'ZPL export action');
assertContains(app, 'Export ESC/POS', 'ESC/POS export action');
assertContains(app, 'inventoryLotId', 'lot-aware dispense payload');
assertContains(app, 'safetyOverrideReason', 'prescription safety override reason field');
assertContains(app, 'fetchDailyOperationsReport', 'daily operations report fetch');
assertContains(app, 'fetchPharmacyOverrideReport', 'pharmacy override report fetch');
assertContains(app, '/api/reports/pharmacy-overrides', 'pharmacy override report endpoint');
assertContains(app, 'function createPharmacyOverrideChart(', 'pharmacy override chart');
assertContains(app, 'fetchControlledSubstanceRegister', 'controlled substance register fetch');
assertContains(app, '/api/reports/controlled-substances', 'controlled substance register endpoint');
assertContains(app, 'function createControlledSubstanceChart(', 'controlled substance chart');
assertContains(app, 'fetchControlledSubstanceReconciliations', 'controlled substance reconciliation fetch');
assertContains(app, '/api/controlled-substance-reconciliations', 'controlled substance reconciliation endpoint');
assertContains(app, 'closeControlledSubstanceReconciliation', 'controlled substance reconciliation close action');
assertContains(app, 'approveControlledSubstanceReconciliation', 'controlled substance reconciliation approve action');
assertContains(app, 'isControlledSubstance', 'controlled inventory item payload');
assertContains(app, 'witnessUserId', 'controlled dispense witness payload');
assertContains(app, 'Witness user ID for controlled dispense', 'controlled dispense witness prompt');
assertContains(app, 'witnessLoginCode', 'controlled dispense witness re-auth payload');
assertContains(app, 'Witness login code for re-authentication', 'controlled dispense witness re-auth prompt');
assertContains(app, 'exportDailyOperationsCsv', 'daily operations CSV export flow');
assertContains(app, 'createClinicLogoAsset', 'clinic logo asset workflow');
assertContains(styles, '.operations-charts', 'operations chart layout');
assertContains(styles, '.bar-chart', 'bar chart card style');
assertContains(styles, '.bar-track', 'bar chart track style');
assertContains(styles, '.safety-warning-panel', 'prescription safety warning panel style');
assertContains(styles, '.scan-result-grid', 'barcode scanner result grid style');

assertMatch(
  app,
  /fragment\.append\(createQueueSummary\(\)\);\s*fragment\.append\(createOperationsCharts\(\)\);/s,
  'queue summary renders before operations charts'
);
assertMatch(
  app,
  /printWindow\.document\.write\(html\);/,
  'print window uses generated prescription HTML'
);
assertMatch(
  app,
  /report\.by_room[\s\S]+report\.top_diagnoses[\s\S]+report\.by_prescriber/,
  'operations charts cover room, diagnosis, and prescriber metrics'
);

console.log('Frontend workflow smoke passed');

function assertContains(source: string, needle: string, label: string) {
  assert.ok(source.includes(needle), `Missing ${label}: ${needle}`);
}

function assertMatch(source: string, pattern: RegExp, label: string) {
  assert.match(source, pattern, `Missing ${label}`);
}
