import * as XLSX from 'xlsx';
import type { CalendarEntryCategoryKey } from './addEntry';
import type {
  CalendarUploadPreviewGroup,
  CalendarUploadPreviewItem,
} from '../../types/calendar';

const DATE_HEADERS = ['날짜', '거래일자', '거래일시', '거래일', '승인일시', 'date'];
const AMOUNT_HEADERS = ['거래금액', '승인금액', '출금액', '출금(원)', '이용금액', '사용금액', '금액', 'amount'];
const PRIMARY_MERCHANT_HEADERS = ['가맹점명', '사용처', 'merchant'];
const CONTENT_HEADERS = ['내용'];
const PLACE_HEADERS = ['거래점'];
const SECONDARY_MERCHANT_HEADERS = ['거래처', '비고'];
const DESCRIPTION_HEADERS = ['적요', '거래구분', '카드구분', '상품구분'];

const CATEGORY_KEYWORDS: Array<{ keyword: string; category: CalendarEntryCategoryKey }> = [
  { keyword: '스타벅스', category: '커피/음료' },
  { keyword: '카페', category: '커피/음료' },
  { keyword: '배민', category: '외식' },
  { keyword: '복지단', category: '외식' },
  { keyword: '지하철', category: '교통서비스' },
  { keyword: '버스', category: '교통서비스' },
  { keyword: '택시', category: '교통서비스' },
  { keyword: '교통', category: '교통서비스' },
  { keyword: '쿠팡', category: '인터넷쇼핑' },
  { keyword: '다이소', category: '인테리어/가정용품' },
  { keyword: '올리브영', category: '화장품소매' },
  { keyword: 'CGV', category: '공연관람' },
  { keyword: '영화', category: '공연관람' },
  { keyword: '병원', category: '병원/의료' },
  { keyword: '약국', category: '의약/의료품' },
  { keyword: '통신', category: '시스템/통신' },
  { keyword: 'KT', category: '시스템/통신' },
  { keyword: '전세', category: '인테리어/가정용품' },
  { keyword: '월세', category: '인테리어/가정용품' },
];

export function parseCsvToUploadGroups(csvText: string): CalendarUploadPreviewGroup[] {
  const rows = parseCsvRows(csvText);
  return parseTabularRows(rows, 'csv');
}

export function parseSpreadsheetToUploadGroups(base64Data: string): CalendarUploadPreviewGroup[] {
  const workbook = XLSX.read(base64Data, { type: 'base64' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, {
    header: 1,
    raw: false,
    defval: '',
  }) as string[][];

  const sourceKind = inferSpreadsheetKind(rows);
  const parsed = parseTabularRows(rows, sourceKind);
  if (parsed.length > 0) {
    return parsed;
  }

  return parseRowsWithFixedSchema(rows, sourceKind);
}

export function isCsvFile(fileName: string, mimeType?: string | null) {
  const lowerName = fileName.toLowerCase();
  return (
    lowerName.endsWith('.csv') ||
    mimeType === 'text/csv' ||
    mimeType === 'text/comma-separated-values'
  );
}

export function isSpreadsheetFile(fileName: string) {
  const lowerName = fileName.toLowerCase();
  return lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx');
}

function parseTabularRows(rows: string[][], sourceKind: 'bank' | 'card' | 'csv'): CalendarUploadPreviewGroup[] {
  if (rows.length === 0) {
    return [];
  }

  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex === -1) {
    return [];
  }

  const normalizedHeaders = rows[headerRowIndex].map((header) => normalizeHeader(header ?? ''));
  const dateIndex = findHeaderIndex(normalizedHeaders, DATE_HEADERS);
  const amountIndex = findHeaderIndex(normalizedHeaders, AMOUNT_HEADERS);
  const primaryMerchantIndex = findHeaderIndex(normalizedHeaders, PRIMARY_MERCHANT_HEADERS);
  const contentIndex = findHeaderIndex(normalizedHeaders, CONTENT_HEADERS);
  const placeIndex = findHeaderIndex(normalizedHeaders, PLACE_HEADERS);
  const secondaryMerchantIndex = findHeaderIndex(normalizedHeaders, SECONDARY_MERCHANT_HEADERS);
  const descriptionIndex = findHeaderIndex(normalizedHeaders, DESCRIPTION_HEADERS);

  if (
    dateIndex === -1 ||
    amountIndex === -1 ||
    (primaryMerchantIndex === -1 &&
      contentIndex === -1 &&
      placeIndex === -1 &&
      secondaryMerchantIndex === -1)
  ) {
    return [];
  }

  const groups = new Map<string, CalendarUploadPreviewItem[]>();

  rows.slice(headerRowIndex + 1).forEach((row, rowIndex) => {
    const dateKey = normalizeDate(row[dateIndex] ?? '');
    const amount = normalizeAmount(row[amountIndex] ?? '');
    const merchantName = extractMerchantName(
      row,
      sourceKind,
      primaryMerchantIndex,
      contentIndex,
      placeIndex,
      secondaryMerchantIndex,
      descriptionIndex,
    );
    const description = extractDescription(row, descriptionIndex);

    if (!dateKey || amount <= 0 || merchantName.length === 0) {
      return;
    }

    if (!isConsumptionRow({ sourceKind, merchantName, description })) {
      return;
    }

    const category = classifyCategory(merchantName);
    const item: CalendarUploadPreviewItem = {
      id: `upload-${dateKey}-${rowIndex}`,
      merchantName,
      amount,
      categoryLabel: category ?? '분류필요',
      status: category ? 'classified' : 'needs-category',
      description: description || undefined,
    };

    groups.set(dateKey, [...(groups.get(dateKey) ?? []), item]);
  });

  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, items]) => ({
      dateKey,
      totalCount: items.length,
      items,
    }));
}

function parseRowsWithFixedSchema(
  rows: string[][],
  sourceKind: 'bank' | 'card',
): CalendarUploadPreviewGroup[] {
  const schema =
    sourceKind === 'bank'
      ? {
          dateIndex: 0,
          amountIndex: 3,
          merchantIndices: [4, 5, 2],
          descriptionIndex: 2,
        }
      : {
          dateIndex: 0,
          amountIndex: 6,
          merchantIndices: [5, 4],
          descriptionIndex: 4,
        };

  const groups = new Map<string, CalendarUploadPreviewItem[]>();

  rows.forEach((row, rowIndex) => {
    const dateKey = normalizeDate(String(row[schema.dateIndex] ?? ''));
    const amount = normalizeAmount(String(row[schema.amountIndex] ?? ''));
    const merchantName = extractMerchantFromCandidates(
      schema.merchantIndices.map((index) => String(row[index] ?? '').trim()),
    );
    const description = String(row[schema.descriptionIndex] ?? '').trim();

    if (!dateKey || amount <= 0 || !merchantName) {
      return;
    }

    if (!isConsumptionRow({ sourceKind, merchantName, description })) {
      return;
    }

    const category = classifyCategory(merchantName);
    const item: CalendarUploadPreviewItem = {
      id: `fixed-${dateKey}-${rowIndex}`,
      merchantName,
      amount,
      categoryLabel: category ?? '분류필요',
      status: category ? 'classified' : 'needs-category',
      description: description || undefined,
    };

    groups.set(dateKey, [...(groups.get(dateKey) ?? []), item]);
  });

  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, items]) => ({
      dateKey,
      totalCount: items.length,
      items,
    }));
}

function findHeaderRowIndex(rows: string[][]) {
  return rows.findIndex((row) => {
    const normalized = row.map((cell) => normalizeHeader(cell ?? ''));
    return (
      findHeaderIndex(normalized, DATE_HEADERS) !== -1 &&
      findHeaderIndex(normalized, AMOUNT_HEADERS) !== -1 &&
      (findHeaderIndex(normalized, PRIMARY_MERCHANT_HEADERS) !== -1 ||
        findHeaderIndex(normalized, SECONDARY_MERCHANT_HEADERS) !== -1)
    );
  });
}

function extractMerchantName(
  row: string[],
  sourceKind: 'bank' | 'card' | 'csv',
  primaryMerchantIndex: number,
  contentIndex: number,
  placeIndex: number,
  secondaryMerchantIndex: number,
  descriptionIndex: number,
) {
  const primary = primaryMerchantIndex !== -1 ? String(row[primaryMerchantIndex] ?? '').trim() : '';
  const content = contentIndex !== -1 ? String(row[contentIndex] ?? '').trim() : '';
  const place = placeIndex !== -1 ? String(row[placeIndex] ?? '').trim() : '';
  const secondary =
    secondaryMerchantIndex !== -1 ? String(row[secondaryMerchantIndex] ?? '').trim() : '';
  const description = descriptionIndex !== -1 ? String(row[descriptionIndex] ?? '').trim() : '';

  if (sourceKind === 'card' || sourceKind === 'csv') {
    return primary || content || place || secondary;
  }

  if (content && !isGenericBankContent(content)) {
    return content;
  }

  if (place) {
    return place;
  }

  if (content) {
    return content;
  }

  if (primary) {
    return primary;
  }

  return description || secondary;
}

function extractMerchantFromCandidates(candidates: string[]) {
  for (const candidate of candidates) {
    if (candidate && !isGenericBankContent(candidate)) {
      return candidate;
    }
  }

  return candidates.find(Boolean) ?? '';
}

function extractDescription(row: string[], descriptionIndex: number) {
  if (descriptionIndex === -1) {
    return '';
  }

  return String(row[descriptionIndex] ?? '').trim();
}

function parseCsvRows(csvText: string): string[][] {
  const normalized = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const nextChar = normalized[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
      continue;
    }

    if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((field) => field.length > 0));
}

function normalizeHeader(header: string) {
  return header.replace(/\s+/g, '').trim().toLowerCase();
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  return headers.findIndex((header) =>
    candidates.some((candidate) => header === candidate.replace(/\s+/g, '').trim().toLowerCase()),
  );
}

function normalizeDate(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return null;
  }

  const matched = value.match(/(\d{4})[./-]?(\d{2})[./-]?(\d{2})/);
  if (!matched) {
    return null;
  }

  return `${matched[1]}-${matched[2]}-${matched[3]}`;
}

function normalizeAmount(rawValue: string) {
  const cleaned = rawValue.replace(/[^\d-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
}

function classifyCategory(merchantName: string): CalendarEntryCategoryKey | null {
  const matched = CATEGORY_KEYWORDS.find(({ keyword }) => merchantName.includes(keyword));
  return matched?.category ?? null;
}

function inferSpreadsheetKind(rows: string[][]): 'bank' | 'card' {
  const flattened = rows
    .slice(0, 6)
    .flat()
    .map((cell) => String(cell ?? ''));

  const joined = flattened.join(' ');
  if (joined.includes('가맹점명') || joined.includes('개인사업자용 이용내역')) {
    return 'card';
  }

  return 'bank';
}

function isConsumptionRow({
  sourceKind,
  merchantName,
  description,
}: {
  sourceKind: 'bank' | 'card' | 'csv';
  merchantName: string;
  description: string;
}) {
  if (sourceKind === 'card' || sourceKind === 'csv') {
    return !containsNonConsumptionKeyword(`${merchantName} ${description}`);
  }

  const normalizedMerchant = merchantName.replace(/\s+/g, '');
  const normalizedDescription = description.replace(/\s+/g, '');
  const joined = `${normalizedDescription} ${normalizedMerchant}`;

  if (containsNonConsumptionKeyword(joined)) {
    return false;
  }

  if (normalizedDescription.includes('체크카드') || normalizedDescription.includes('자동결제')) {
    return true;
  }

  if (normalizedDescription.includes('인터넷뱅킹')) {
    return isInternetBankingConsumption(merchantName);
  }

  return looksLikeConsumptionMerchant(merchantName);
}

function containsNonConsumptionKeyword(value: string) {
  const keywords = [
    '입금',
    '출금취소',
    '환급',
    '환불',
    '송금',
    '계좌이체',
    '이체',
    '급여',
    '이자',
    '적금',
    '예금',
    '대출',
    '카드대금',
    'ATM',
  ];

  return keywords.some((keyword) => value.includes(keyword));
}

function looksLikeConsumptionMerchant(merchantName: string) {
  const normalized = merchantName.trim();
  if (!normalized) {
    return false;
  }

  const blockedPatterns = [
    /^\d{3,4}\s/,
    /^\d{4,}$/,
    /교통비$/,
    /훈련비$/,
    /송금$/,
    /이체$/,
    /입금$/,
  ];

  return !blockedPatterns.some((pattern) => pattern.test(normalized));
}

function isGenericBankContent(content: string) {
  const normalized = content.replace(/\s+/g, '').trim();
  const genericKeywords = ['자동결제', '체크카드', '현금IC', '인터넷뱅킹'];
  return genericKeywords.includes(normalized);
}

function isInternetBankingConsumption(merchantName: string) {
  const normalized = merchantName.replace(/\s+/g, '').trim();
  if (!normalized) {
    return false;
  }

  const excludedKeywords = [
    '교통비',
    '훈련비',
    '관리비',
    '생활비',
    '용돈',
    '송금',
    '이체',
    '회비',
    '납부',
    '입금',
    '출금',
    '적금',
    '예금',
    '저축',
    '환불',
    '환급',
    '수수료',
    '카드대금',
  ];

  if (excludedKeywords.some((keyword) => normalized.includes(keyword))) {
    return false;
  }

  const excludedPatterns = [
    /^\d{3,4}$/,
    /^\d{4}\d{2,}/,
    /^\d{4}[가-힣]/,
    /^\d{4,}\D*$/,
    /^[0-9-]+$/,
  ];

  if (excludedPatterns.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  const hasMerchantSuffix = /(점|마트|스토어|약국|카페|병원|의원|식당|치킨|피자|편의점|몰)$/.test(
    normalized,
  );
  const hasCompanyMarker = /(주식회사|유한회사|\(주\)|㈜)/.test(normalized);
  const hasEnoughLetters = /[가-힣A-Za-z]/.test(normalized) && normalized.length >= 3;

  if (hasMerchantSuffix || hasCompanyMarker) {
    return true;
  }

  return hasEnoughLetters && looksLikeConsumptionMerchant(normalized);
}
