import axios from 'axios';
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
  CalendarMonthlyParams,
  CalendarMonthlyResponse,
  CalendarOverrideRow,
  FixedExpenseManageResponse,
  FixedExpenseParams,
  FixedExpenseSummaryResponse,
  FixedExpenseUpdateRequest,
  CalendarUploadBackendSummary,
  CalendarUploadFile,
  CalendarUploadRequest,
  FixedExpenseAddRequest,
  FixedExpenseAddResponse,
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

const BACKEND_CATEGORY_ID_MAP: Record<string, number> = {
  '인터넷쇼핑': 1,
  '인테리어/가정용품': 2,
  '교통서비스': 3,
  '음/식료품소매': 4,
  '외식': 5,
  '제과/제빵/떡/케익': 6,
  '커피/음료': 7,
  '패스트푸드': 8,
  '자동차/유지비': 9,
  '시스템/통신': 10,
  '건강/기호식품': 11,
  '분식': 12,
  '육류/회식': 13,
  '선물/완구': 14,
  '병원/의료': 15,
  '화장품소매': 16,
  '공연관람': 17,
  '의약/의료품': 18,
  '건강/뷰티/마사지': 19,
  '수리서비스': 20,
  // Flask 분류 결과에 남아 있는 구 라벨도 저장 단계에서 호환합니다.
  '제과/제빵': 6,
  '종합소매점': 2,
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
  return BACKEND_CATEGORY_ID_MAP[category];
}

function normalizeCalendarUploadSummary(
  rawSummary: RawCalendarUploadBackendSummary,
): CalendarUploadBackendSummary {
  // The Flask response currently comes back in snake_case, while the screen
  // code is written against camelCase fields. We normalize once here so the
  // rest of the app can stay consistent.
  return {
    message: rawSummary.message ?? '',
    records: (rawSummary.records ?? []).map((record) => ({
      category: record.category ?? record.card_tpbuz_nm_2 ?? '미분류',
      amt: record.amt ?? 0,
      cnt: record.cnt ?? 0,
    })),
    items: (rawSummary.items ?? []).map((item) => {
      const category = item.category ?? item.card_tpbuz_nm_2 ?? '';
      return {
        transactionDate: item.transactionDate ?? item.transaction_date ?? '',
        merchantName: item.merchantName ?? item.merchant_name ?? '알 수 없는 상호',
        transactionDetail: item.transactionDetail ?? item.transaction_detail ?? '',
        amount: item.amount ?? 0,
        category,
        classificationReason:
          item.classificationReason ?? item.classification_reason ?? '분류 사유 정보 없음',
        status: item.status ?? (category ? 'classified' : 'needs-category'),
        categoryId: category ? resolveBackendCategoryId(category) : undefined,
      };
    }),
    excludedRows: (rawSummary.excludedRows ?? rawSummary.excluded_rows ?? []).map((row) => ({
      merchantName: row.merchantName ?? row.merchant_name ?? '알 수 없는 상호',
      classificationReason:
        row.classificationReason ?? row.classification_reason ?? '제외 사유 정보 없음',
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

  // 캘린더 헤더만 ApiResponse 래퍼를 사용하므로 여기서 한 번만 벗겨서 화면 코드를 단순하게 유지합니다.
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
    '/api/v1/calendar/daily',
    {
      params,
    },
  );

  return response.data.data;
}

export async function uploadCalendarTransactions(payload: CalendarUploadRequest) {
  const formData = new FormData();

  // Backend accepts each file independently, so the UI can upload only bank or only card data.
  appendUploadFile(formData, 'bank_file', payload.bankFile);
  appendUploadFile(formData, 'card_file', payload.cardFile);

  const response = await nativeApi.post<RawCalendarUploadBackendSummary>(
    '/api/v1/calendar/transactions/csv',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
    '/api/v1/fixed-expenses',
    payload,
  );

  return response.data.data;
}

export async function updateFixedExpense(id: number, payload: FixedExpenseUpdateRequest) {
  const response = await nativeApi.patch(`/api/v1/fixed-expenses/${id}`, payload);
  return response.data;
}

export async function deleteFixedExpense(id: number) {
  const response = await nativeApi.delete(`/api/v1/fixed-expenses/${id}`);
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
