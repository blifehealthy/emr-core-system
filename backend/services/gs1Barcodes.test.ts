import test from 'node:test';
import assert from 'node:assert/strict';

import { barcodeMatchesExpected, parseGs1Barcode } from './gs1Barcodes.ts';

test('parseGs1Barcode parses GTIN expiry lot and serial from parenthesized GS1 text', () => {
  const parsed = parseGs1Barcode('(01)01234567890128(17)260531(10)LOT-42(21)SER-9');

  assert.equal(parsed.isGs1, true);
  assert.equal(parsed.gtin, '01234567890128');
  assert.equal(parsed.expiresOn, '2026-05-31');
  assert.equal(parsed.lotNumber, 'LOT-42');
  assert.equal(parsed.serialNumber, 'SER-9');
});

test('parseGs1Barcode treats YYMM00 expiry as last day of month', () => {
  const parsed = parseGs1Barcode('01012345678901281726020010LOT-1');

  assert.equal(parsed.expiresOn, '2026-02-28');
});

test('barcodeMatchesExpected accepts raw and parsed GS1 values', () => {
  assert.equal(barcodeMatchesExpected('BC-1', ['BC-1']), true);
  assert.equal(
    barcodeMatchesExpected('(01)01234567890128(17)260531(10)LOT-42', ['01234567890128']),
    true
  );
  assert.equal(
    barcodeMatchesExpected('(01)01234567890128(17)260531(10)LOT-42', ['BC-1'], {
      lotNumber: 'LOT-42',
      expiresOn: '2026-05-31',
    }),
    true
  );
});
