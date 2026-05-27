export type ParsedGs1Barcode = {
  isGs1: boolean;
  gtin: string | null;
  lotNumber: string | null;
  expiresOn: string | null;
  serialNumber: string | null;
};

const GROUP_SEPARATOR = String.fromCharCode(29);

export function parseGs1Barcode(rawBarcode: string | null | undefined): ParsedGs1Barcode {
  const value = rawBarcode?.trim() ?? '';
  if (!value) return emptyGs1();

  const normalized = value
    .replace(/^\]C1/, '')
    .replace(/\(01\)/g, '01')
    .replace(/\(17\)/g, '17')
    .replace(/\(10\)/g, '10')
    .replace(/\(21\)/g, '21');

  const parsed = parseApplicationIdentifiers(normalized);
  return {
    ...parsed,
    isGs1: Boolean(parsed.gtin || parsed.lotNumber || parsed.expiresOn || parsed.serialNumber),
  };
}

export function barcodeMatchesExpected(
  scannedBarcode: string | null | undefined,
  expectedValues: Array<string | null | undefined>,
  options: { lotNumber?: string | null; expiresOn?: string | null } = {}
) {
  const scanned = scannedBarcode?.trim();
  if (!scanned) return false;
  const expected = expectedValues.map((value) => value?.trim()).filter(Boolean);
  if (expected.includes(scanned)) return true;

  const parsed = parseGs1Barcode(scanned);
  if (!parsed.isGs1) return false;

  return expected.some((value) => {
    if (!value) return false;
    if (parsed.gtin && parsed.gtin === value) return true;
    if (parsed.lotNumber && parsed.lotNumber === value) return true;
    return false;
  }) || Boolean(
    options.lotNumber &&
      parsed.lotNumber === options.lotNumber &&
      (!options.expiresOn || !parsed.expiresOn || parsed.expiresOn === options.expiresOn)
  );
}

function parseApplicationIdentifiers(value: string): Omit<ParsedGs1Barcode, 'isGs1'> {
  let index = 0;
  const parsed = {
    gtin: null as string | null,
    lotNumber: null as string | null,
    expiresOn: null as string | null,
    serialNumber: null as string | null,
  };

  while (index < value.length) {
    if (value[index] === GROUP_SEPARATOR) {
      index += 1;
      continue;
    }

    const ai = value.slice(index, index + 2);
    if (ai === '01') {
      const gtin = value.slice(index + 2, index + 16);
      if (/^\d{14}$/.test(gtin)) parsed.gtin = gtin;
      index += 16;
      continue;
    }
    if (ai === '17') {
      const expiry = value.slice(index + 2, index + 8);
      const expiresOn = parseGs1ExpiryDate(expiry);
      if (expiresOn) parsed.expiresOn = expiresOn;
      index += 8;
      continue;
    }
    if (ai === '10' || ai === '21') {
      const next = findNextKnownAi(value, index + 2);
      const end = next > -1 ? next : value.length;
      const data = value.slice(index + 2, end).replaceAll(GROUP_SEPARATOR, '').trim();
      if (data) {
        if (ai === '10') parsed.lotNumber = data;
        if (ai === '21') parsed.serialNumber = data;
      }
      index = end;
      continue;
    }
    index += 1;
  }

  return parsed;
}

function findNextKnownAi(value: string, start: number) {
  for (let index = start; index < value.length - 1; index += 1) {
    if (value[index] === GROUP_SEPARATOR) return index + 1;
    const candidate = value.slice(index, index + 2);
    if (candidate === '01' || candidate === '17' || candidate === '10' || candidate === '21') {
      return index;
    }
  }
  return -1;
}

function parseGs1ExpiryDate(value: string) {
  if (!/^\d{6}$/.test(value)) return null;
  const year = Number(value.slice(0, 2)) + 2000;
  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6)) || lastDayOfMonth(year, month);
  if (month < 1 || month > 12 || day < 1 || day > lastDayOfMonth(year, month)) return null;
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function emptyGs1(): ParsedGs1Barcode {
  return {
    isGs1: false,
    gtin: null,
    lotNumber: null,
    expiresOn: null,
    serialNumber: null,
  };
}
