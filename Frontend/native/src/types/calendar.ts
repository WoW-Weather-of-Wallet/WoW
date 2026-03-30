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

// 캘린더 백엔드 API는 일반 JSON, 문자열 응답, ApiResponse 래퍼 응답이 섞여 있습니다.
// 화면 코드에서 응답 형태를 추측하지 않도록 타입을 명시적으로 분리합니다.
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

export interface CalendarTransactionsParams {
  year: number;
  month: number;
}

export interface CalendarTransactionsItemResponse {
  transactionId: number;
  icon: string | null;
  merchantName: string;
  category: string | null;
  amount: number;
  isFixed: boolean;
}

export interface CalendarTransactionsDailyResponse {
  date: string;
  transactions: CalendarTransactionsItemResponse[];
}

export interface CalendarTransactionsResponse {
  yearMonth: string;
  totalAmount: number;
  items: CalendarTransactionsDailyResponse[];
}

export interface CalendarOverrideRow {
  merchant_name: string;
  category: string;
  reason?: string;
}

export interface FixedExpenseSummaryItemResponse {
  name: string;
  amount: number;
  dueDay: number;
  actualDueDay: number;
  paymentStatus: string;
  categoryName: string | null;
  isAuto: boolean;
}

export interface FixedExpenseSummaryResponse {
  totalAmount: number;
  items: FixedExpenseSummaryItemResponse[];
}

export interface FixedExpenseManageItemResponse {
  id: number;
  icon: string | null;
  name: string;
  amount: number;
  dueDay: number;
  isAuto: boolean | null;
  isEnable: boolean | null;
  paymentStatus: string;
  categoryName: string | null;
}

export interface FixedExpenseManageResponse {
  totalAmount: number;
  items: FixedExpenseManageItemResponse[];
}

export interface FixedExpenseParams {
  year: number;
  month: number;
}

export interface FixedExpenseUpdateRequest {
  icon?: string | null;
  amount?: number | null;
  dueDay?: number | null;
}

export interface FixedExpenseEnableRequest {
  isEnable: boolean;
}

export interface FixedExpenseEnableResponse {
  id: number;
  isEnable: boolean;
}

export interface FixedExpenseAddRequest {
  transactionId: number;
  dueDay: number;
  isAuto?: boolean | null;
}

export interface FixedExpenseAddResponse {
  id: number;
  name: string;
  isFixed: boolean;
}

export type CalendarHeaderFetchState = 'idle' | 'loading' | 'live' | 'fallback';
