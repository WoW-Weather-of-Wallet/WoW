import axios from 'axios';
import { CALENDAR_ENTRY_CATEGORIES } from '../constants/calendar/addEntry';
import { nativeApi, type NativeApiErrorResponse } from './auth';
import type {
  CalendarApiErrorResponse,
  CalendarApiResponse,
  CalendarConfirmRequest,
  CalendarConfirmResponse,
  CalendarCustomRequest,
  CalendarCustomResponse,
  CalendarDailyParams,
  CalendarDailyResponse,
  CalendarHeaderParams,
  CalendarHeaderResponse,
  CalendarMemoRequest,
  CalendarMemoResponse,
  CalendarMonthlyParams,
  CalendarMonthlyResponse,
  CalendarOverrideRow,
  FixedExpenseManageResponse,
  FixedExpenseParams,
  FixedExpenseSummaryResponse,
  FixedExpenseEnableRequest,
  FixedExpenseEnableResponse,
  FixedExpenseUpdateRequest,
  CalendarUploadBackendSummary,
  CalendarUploadFile,
  CalendarUploadRequest,
  FixedExpenseAddRequest,
  FixedExpenseAddResponse,
  CalendarTransactionsParams,
  CalendarTransactionsResponse,
} from '../types/calendar';

interface RawCalendarUploadRecordSummary {
  amt?: number;
  cnt?: number;
  card_tpbuz_nm_2?: string;
  category?: string;
}

interface RawCalendarUploadExcludedRow {
  merchant_name?: string;
  merchantName?: string;
  classification_reason?: string;
  classificationReason?: string;
  amount?: number;
  cnt?: number;
}

interface RawCalendarUploadBackendItem {
  transaction_date?: string;
  transactionDate?: string;
  merchant_name?: string;
  merchantName?: string;
  transaction_detail?: string;
  transactionDetail?: string;
  amount?: number;
  card_tpbuz_nm_2?: string;
  category?: string;
  classification_reason?: string;
  classificationReason?: string;
  status?: 'classified' | 'needs-category';
}

interface RawCalendarUploadBackendSummary {
  message?: string;
  records?: RawCalendarUploadRecordSummary[];
  items?: RawCalendarUploadBackendItem[];
  excluded_rows?: RawCalendarUploadExcludedRow[];
  excludedRows?: RawCalendarUploadExcludedRow[];
  transaction_count?: number;
  transactionCount?: number;
  included_amount?: number;
  includedAmount?: number;
  excluded_amount?: number;
  excludedAmount?: number;
  total_amount?: number;
  totalAmount?: number;
}

function normalizeBackendCategoryName(category: string) {
  return category.replace(/\s+/g, '').trim();
}

const BACKEND_CATEGORY_ID_MAP = CALENDAR_ENTRY_CATEGORIES.reduce<Record<string, number>>(
  (acc, category, index) => {
    acc[normalizeBackendCategoryName(category.key)] = index + 1;
    return acc;
  },
  {},
);

const BACKEND_CATEGORY_ALIASES: Record<string, string> = {
  '제과/제빵': '제과/제빵/떡/케익',
};

function inferMimeType(file: CalendarUploadFile) {
  if (file.mimeType) {
    return file.mimeType;
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith('.csv')) {
    return 'text/csv';
  }
  if (lowerName.endsWith('.xlsx')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  if (lowerName.endsWith('.xls')) {
    return 'application/vnd.ms-excel';
  }

  return 'application/octet-stream';
}

function appendUploadFile(
  formData: FormData,
  fieldName: 'bank_file' | 'card_file',
  file?: CalendarUploadFile | null,
) {
  if (!file) {
    return;
  }

  formData.append(fieldName, {
    uri: file.uri,
    name: file.name,
    type: inferMimeType(file),
  } as never);
}

function resolveBackendCategoryId(category: string) {
  const normalizedCategory = normalizeBackendCategoryName(category);
  const canonicalCategory = BACKEND_CATEGORY_ALIASES[normalizedCategory] ?? normalizedCategory;

  return BACKEND_CATEGORY_ID_MAP[canonicalCategory];
}

function normalizeClassificationReason(reason?: string) {
  const trimmedReason = reason?.trim();

  if (!trimmedReason) {
    return '자동 분류 참고 정보가 아직 없어요.';
  }

  if (trimmedReason.includes('Kakao Local API matched')) {
    return '장소 정보를 바탕으로 자동 분류했어요.';
  }

  if (trimmedReason.includes('GMS(') || trimmedReason.includes('GMS classified')) {
    return '거래처 이름을 바탕으로 자동 분류했어요.';
  }

  if (trimmedReason.includes('No merchant map match')) {
    return '자동 분류에 참고할 정보가 부족해 직접 확인이 필요해요.';
  }

  if (trimmedReason.includes('GMS call budget exhausted')) {
    return '이번 업로드에서 자동 분류 한도를 넘어 직접 확인이 필요해요.';
  }

  if (trimmedReason.includes('Temporary fallback classification')) {
    return '자동 분류가 어려워 우선 임시 카테고리로 담아뒀어요. 나중에 수정할 수 있어요.';
  }

  return trimmedReason;
}

function normalizeCalendarUploadSummary(
  rawSummary: RawCalendarUploadBackendSummary,
): CalendarUploadBackendSummary {
  return {
    message: rawSummary.message?.trim() || '업로드한 거래를 바탕으로 자동 분류를 준비했어요.',
    records: (rawSummary.records ?? []).map((record) => ({
      category: record.category ?? record.card_tpbuz_nm_2 ?? '분류 미확정',
      amt: record.amt ?? 0,
      cnt: record.cnt ?? 0,
    })),
    items: (rawSummary.items ?? []).map((item) => {
      const category = item.category ?? item.card_tpbuz_nm_2 ?? '';
      return {
        transactionDate: item.transactionDate ?? item.transaction_date ?? '',
        merchantName: item.merchantName ?? item.merchant_name ?? '상호 정보 없음',
        transactionDetail: item.transactionDetail ?? item.transaction_detail ?? '',
        amount: item.amount ?? 0,
        category,
        classificationReason: normalizeClassificationReason(
          item.classificationReason ?? item.classification_reason,
        ),
        status: item.status ?? (category ? 'classified' : 'needs-category'),
        categoryId: category ? resolveBackendCategoryId(category) : undefined,
      };
    }),
    excludedRows: (rawSummary.excludedRows ?? rawSummary.excluded_rows ?? []).map((row) => ({
      merchantName: row.merchantName ?? row.merchant_name ?? '상호 정보 없음',
      classificationReason: normalizeClassificationReason(
        row.classificationReason ?? row.classification_reason,
      ),
      amount: row.amount ?? 0,
      cnt: row.cnt ?? 0,
    })),
    transactionCount: rawSummary.transactionCount ?? rawSummary.transaction_count ?? 0,
    includedAmount: rawSummary.includedAmount ?? rawSummary.included_amount ?? 0,
    excludedAmount: rawSummary.excludedAmount ?? rawSummary.excluded_amount ?? 0,
    totalAmount: rawSummary.totalAmount ?? rawSummary.total_amount ?? 0,
  };
}

export async function getCalendarHeader(params: CalendarHeaderParams) {
  const response = await nativeApi.get<CalendarApiResponse<CalendarHeaderResponse>>(
    '/api/v1/calendar/header',
    {
      params,
    },
  );

  return response.data.data;
}

export async function getCalendarMonthly(params: CalendarMonthlyParams) {
  const response = await nativeApi.get<CalendarApiResponse<CalendarMonthlyResponse[]>>(
    '/api/v1/calendar/monthly',
    {
      params,
    },
  );

  return response.data.data;
}

export async function getCalendarDaily(params: CalendarDailyParams) {
  const response = await nativeApi.get<CalendarApiResponse<CalendarDailyResponse>>(
    '/api/v1/calendar/daily/transactions',
    {
      params,
    },
  );

  return response.data.data;
}

export async function updateCalendarMemo(date: string, payload: CalendarMemoRequest) {
  const response = await nativeApi.put<CalendarApiResponse<CalendarMemoResponse>>(
    `/api/v1/calendar/${date}/memo`,
    payload,
  );

  return response.data.data;
}

export async function uploadCalendarTransactions(payload: CalendarUploadRequest) {
  const formData = new FormData();

  appendUploadFile(formData, 'bank_file', payload.bankFile);
  appendUploadFile(formData, 'card_file', payload.cardFile);

  const response = await nativeApi.post<RawCalendarUploadBackendSummary>(
    '/api/v1/calendar/transactions/csv',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000,
    },
  );

  return normalizeCalendarUploadSummary(response.data);
}

export async function confirmCalendarTransactions(payload: CalendarConfirmRequest) {
  const response = await nativeApi.post<CalendarApiResponse<CalendarConfirmResponse>>(
    '/api/v1/calendar/transactions/csv/confirm',
    payload,
  );

  return response.data.data;
}

export async function createCustomCalendarTransactions(payload: CalendarCustomRequest) {
  const response = await nativeApi.post<CalendarApiResponse<CalendarCustomResponse>>(
    '/api/v1/calendar/transactions/custom',
    payload,
  );

  return response.data.data;
}

export async function createCashCalendarTransactions(payload: CalendarCustomRequest) {
  const response = await nativeApi.post<CalendarApiResponse<CalendarCustomResponse>>(
    '/api/v1/calendar/transactions/custom/cash',
    payload,
  );

  return response.data.data;
}

export async function getCalendarTransactions(params: CalendarTransactionsParams) {
  const response = await nativeApi.get<CalendarApiResponse<CalendarTransactionsResponse>>(
    '/api/v1/calendar/transactions',
    {
      params,
    },
  );

  return response.data.data;
}

export async function saveCalendarOverrides(rows: CalendarOverrideRow[]) {
  if (rows.length === 0) {
    return;
  }

  await nativeApi.post('/api/v1/calendar/transactions/overrides', {
    rows,
  });
}

export async function getCalendarFixedExpenses(params: FixedExpenseParams) {
  const response = await nativeApi.get<CalendarApiResponse<FixedExpenseSummaryResponse>>(
    '/api/v1/calendar/fixed-expenses',
    {
      params,
    },
  );

  return response.data.data;
}

export async function getFixedExpenseManage(params: FixedExpenseParams) {
  const response = await nativeApi.get<CalendarApiResponse<FixedExpenseManageResponse>>(
    '/api/v1/fixed-expenses',
    {
      params,
    },
  );

  return response.data.data;
}

export async function addFixedExpense(payload: FixedExpenseAddRequest) {
  const response = await nativeApi.post<CalendarApiResponse<FixedExpenseAddResponse>>(
    '/api/v1/fixed-expenses/from-transaction',
    payload,
  );

  return response.data.data;
}

export async function updateFixedExpense(id: number, payload: FixedExpenseUpdateRequest) {
  const response = await nativeApi.patch(`/api/v1/fixed-expenses/${id}`, payload);
  return response.data;
}

export async function updateFixedExpenseEnable(
  id: number,
  payload: FixedExpenseEnableRequest,
) {
  const response = await nativeApi.patch<CalendarApiResponse<FixedExpenseEnableResponse>>(
    `/api/v1/fixed-expenses/${id}/enable`,
    payload,
  );

  return response.data.data;
}

export async function deleteFixedExpense(id: number) {
  const response = await nativeApi.delete(`/api/v1/fixed-expenses/${id}`);
  return response.data;
}

export async function deleteCustomCalendarTransaction(transactionId: number) {
  const response = await nativeApi.delete(
    `/api/v1/calendar/transactions/custom/${transactionId}`,
  );

  return response.data;
}

export function getCalendarApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | CalendarApiErrorResponse
      | NativeApiErrorResponse
      | undefined;

    return responseData?.errorMessage ?? error.message ?? fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
