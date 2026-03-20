import type { CalendarEntryCategoryKey } from '../constants/calendar/addEntry';

export interface ManualCalendarEntryDraft {
  id: string;
  dateKey: string;
  merchantName: string;
  category: string;
  amount: number;
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

export interface CalendarHeaderResponse {
  yearMonth: string;
  weatherName: string;
  iconCode: string | null;
  description: string;
  savedAmount: number;
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

export type CalendarHeaderFetchState = 'idle' | 'loading' | 'live' | 'fallback';
