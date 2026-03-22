import type { CalendarEntryCategoryKey } from '../constants/calendar/addEntry';

export type ManualEntryPaymentMethod = 'card' | 'cash';

export interface ManualCalendarEntryDraft {
  id: string;
  dateKey: string;
  merchantName: string;
  category: string;
  amount: number;
  paymentMethod: ManualEntryPaymentMethod;
  categoryId?: number;
}

export interface CalendarUploadFile {
  name: string;
  uri: string;
  mimeType?: string | null;
  size?: number | null;
}

export type CalendarUploadItemStatus = 'classified' | 'needs-category';

export interface CalendarUploadPreviewItem {
  id: string;
  merchantName: string;
  amount: number;
  categoryLabel: CalendarEntryCategoryKey | string;
  status: CalendarUploadItemStatus;
  description?: string;
  categoryId?: number;
}

export interface CalendarUploadPreviewGroup {
  dateKey: string;
  totalCount: number;
  items: CalendarUploadPreviewItem[];
}

// Backend calendar APIs mix plain JSON, text responses, and wrapped responses.
// We keep those shapes explicit here so screen code can branch without guessing.
export interface CalendarApiResponse<T> {
  httpStatusCode: number;
  responseMessage: string;
  data: T;
}

export interface CalendarApiErrorResponse {
  httpStatusCode: number;
  errorMessage: string;
}

export interface CalendarHeaderParams {
  year: number;
  month: number;
}

export type CalendarBackendDayType = 'PAST' | 'TODAY' | 'NEAR_FUTURE' | 'FAR_FUTURE';

export interface CalendarHeaderResponse {
  yearMonth: string;
  weatherName: string;
  iconCode: string | null;
  description: string;
  savedAmount: number;
}

export interface CalendarMonthlyParams {
  year: number;
  month: number;
}

export interface CalendarMonthlyResponse {
  date: string;
  dayType: CalendarBackendDayType;
  dailyTotal: number | null;
  iconCode: string | null;
  isForecast: number | null;
}

export interface CalendarDailyParams {
  date: string;
}

export interface CalendarDailyTransactionItem {
  merchantName: string;
  category: string;
  categoryIcon: string | null;
  amount: number;
}

export interface CalendarDailyResponse {
  date: string;
  weather: {
    iconCode: string | null;
    weatherName: string;
    description: string;
    isForecast: number | null;
  };
  summary: {
    totalExpense: number | null;
    transactionCount: number | null;
  };
  transactions: CalendarDailyTransactionItem[];
  memo: string | null;
}

export interface CalendarUploadRecordSummary {
  category: string;
  amt: number;
  cnt: number;
}

export interface CalendarUploadExcludedRow {
  merchantName: string;
  classificationReason: string;
  amount: number;
  cnt: number;
}

export interface CalendarUploadBackendItem {
  transactionDate: string;
  merchantName: string;
  transactionDetail: string;
  amount: number;
  category: string;
  classificationReason: string;
  status: CalendarUploadItemStatus;
  categoryId?: number;
}

export interface CalendarUploadBackendSummary {
  message: string;
  records: CalendarUploadRecordSummary[];
  items: CalendarUploadBackendItem[];
  excludedRows: CalendarUploadExcludedRow[];
  transactionCount: number;
  includedAmount: number;
  excludedAmount: number;
  totalAmount: number;
}

export interface CalendarUploadRequest {
  bankFile?: CalendarUploadFile | null;
  cardFile?: CalendarUploadFile | null;
}

export interface CalendarConfirmItem {
  merchantName: string;
  amount: number;
  categoryId: number;
  transactionDate: string;
}

export interface CalendarConfirmRequest {
  items: CalendarConfirmItem[];
}

export interface CalendarConfirmResponse {
  savedCount: number;
  date: string;
}

export interface CalendarCustomItem {
  merchantName: string;
  amount: number;
  categoryId: number;
  transactionDate: string;
}

export interface CalendarCustomRequest {
  items: CalendarCustomItem[];
}

export interface CalendarCustomResponse {
  savedCount: number;
  items: Array<{
    transactionId: number;
    merchantName: string;
    amount: number;
    transactionDate: string;
    categoryName: string;
  }>;
}

export interface CalendarOverrideRow {
  merchant_name: string;
  card_tpbuz_nm_2: string;
  transaction_date?: string;
  transaction_detail?: string;
  amount?: string;
  classification_reason?: string;
}

export type CalendarHeaderFetchState = 'idle' | 'loading' | 'live' | 'fallback';
