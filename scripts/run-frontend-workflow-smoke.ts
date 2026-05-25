import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const frontendDir = join(rootDir, 'frontend');

const html = readFileSync(join(frontendDir, 'index.html'), 'utf8');
const app = readFileSync(join(frontendDir, 'app.js'), 'utf8');
const styles = readFileSync(join(frontendDir, 'styles.css'), 'utf8');

assertContains(html, 'data-view="queue"', 'queue tab');
assertContains(html, 'id="queue-form"', 'queue form');
assertContains(html, 'id="queue-export-button"', 'daily operations CSV export button');
assertContains(app, 'function renderQueueBoard()', 'queue board renderer');
assertContains(app, 'function createOperationsCharts()', 'operations chart renderer');
assertContains(app, 'function createBarChart(', 'bar chart helper');
assertContains(app, 'function createClaimVisitButton(', 'queue claim action');
assertContains(app, 'function createStartVisitEncounterButton(', 'queue start encounter action');
assertContains(app, 'function buildPrescriptionPrintHtml(', 'prescription print HTML builder');
assertContains(app, 'ใบสั่งยา / Prescription', 'prescription print title');
assertContains(app, 'fetchDailyOperationsReport', 'daily operations report fetch');
assertContains(app, 'exportDailyOperationsCsv', 'daily operations CSV export flow');
assertContains(styles, '.operations-charts', 'operations chart layout');
assertContains(styles, '.bar-chart', 'bar chart card style');
assertContains(styles, '.bar-track', 'bar chart track style');

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
