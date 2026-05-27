import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const docs = [
  'docs/uat-tester-delivery-pack-th.md',
  'docs/uat-role-quick-guides-th.md',
  'docs/uat-test-data-plan-th.md',
  'docs/uat-step-by-step-scripts-th.md',
  'docs/pilot-launch-checklist-th.md',
  'docs/pilot-known-limitations-th.md',
  'docs/uat-execution-checklist-th.md',
  'docs/pilot-defect-tracker-th.md',
  'docs/pilot-go-no-go-template-th.md',
  'docs/security-privacy-review-pack-th.md',
  'docs/deployment-pilot-runbook-th.md',
  'docs/clinic-user-manual-th.md',
  'docs/phase-4h-printer-bridge-adapter-contract.md',
  'docs/phase-5-planning-seeds.md',
];

const outDir = 'docs/pdf';
mkdirSync(outDir, { recursive: true });

for (const doc of docs) {
  const markdown = readFileSync(doc, 'utf8');
  const title = basename(doc, '.md');
  const htmlPath = join(outDir, `${title}.html`);
  const pdfPath = join(outDir, `${title}.pdf`);
  writeFileSync(htmlPath, renderHtml(markdown, title));

  const result = spawnSync(
    'google-chrome',
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--print-to-pdf-no-header',
      `--print-to-pdf=${pdfPath}`,
      htmlPath,
    ],
    { encoding: 'utf8' }
  );

  if (result.status !== 0) {
    throw new Error(`Failed to render ${doc}: ${result.stderr || result.stdout}`);
  }
  unlinkSync(htmlPath);
}

function renderHtml(markdown, title) {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body {
      color: #17211f;
      font-family: "Noto Sans Thai", "Noto Sans", "Tahoma", "Arial", sans-serif;
      font-size: 12px;
      line-height: 1.55;
    }
    h1 { font-size: 24px; margin: 0 0 14px; }
    h2 { font-size: 18px; margin: 22px 0 8px; border-bottom: 1px solid #d9e4e0; padding-bottom: 4px; }
    h3 { font-size: 15px; margin: 16px 0 6px; }
    p { margin: 7px 0; }
    ul, ol { padding-left: 22px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 14px; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td { border: 1px solid #cbd8d3; padding: 5px 6px; vertical-align: top; }
    th { background: #eef4f2; font-weight: 700; }
    code { background: #eef4f2; padding: 1px 3px; border-radius: 3px; }
    pre { background: #f7faf9; border: 1px solid #d9e4e0; padding: 10px; white-space: pre-wrap; }
  </style>
</head>
<body>
${markdownToHtml(markdown)}
</body>
</html>`;
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let i = 0;
  let inList = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i += 1;
      }
      html.push(`<pre>${escapeHtml(code.join('\n'))}</pre>`);
      i += 1;
      continue;
    }

    if (isTableStart(lines, i)) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      const headers = splitTableRow(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      html.push('<table><thead><tr>');
      for (const header of headers) html.push(`<th>${inline(header)}</th>`);
      html.push('</tr></thead><tbody>');
      for (const row of rows) {
        html.push('<tr>');
        for (const cell of row) html.push(`<td>${inline(cell)}</td>`);
        html.push('</tr>');
      }
      html.push('</tbody></table>');
      continue;
    }

    if (/^# /.test(line)) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (/^## /.test(line)) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (/^### /.test(line)) {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (/^- /.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\d+\. /.test(line)) {
      if (!inList) {
        html.push('<ol>');
        inList = true;
      }
      html.push(`<li>${inline(line.replace(/^\d+\. /, ''))}</li>`);
    } else if (line.trim() === '') {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
    } else {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      html.push(`<p>${inline(line)}</p>`);
    }
    i += 1;
  }

  if (inList) html.push('</ul>');
  return html.join('\n');
}

function isTableStart(lines, index) {
  return /^\|.*\|$/.test(lines[index] ?? '') && /^\|[\s:|-]+\|$/.test(lines[index + 1] ?? '');
}

function splitTableRow(line) {
  return line.trim().slice(1, -1).split('|').map((cell) => cell.trim());
}

function inline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
