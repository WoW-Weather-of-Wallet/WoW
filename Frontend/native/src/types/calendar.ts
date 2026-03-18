import type { CalendarEntryCategoryKey } from '../constants/calendar/addEntry';

export interface ManualCalendarEntryDraft {
  id: string;
  dateKey: string;
  merchantName: string;
  category: CalendarEntryCategoryKey;
  amount: number;
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
  categoryLabel: CalendarEntryCategoryKey | '분류필요';
  status: CalendarUploadItemStatus;
  description?: string;
}

export interface CalendarUploadPreviewGroup {
  dateKey: string;
  totalCount: number;
  items: CalendarUploadPreviewItem[];
}
