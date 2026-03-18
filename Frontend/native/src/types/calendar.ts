import type { CalendarEntryCategoryKey } from '../constants/calendar/addEntry';

export interface ManualCalendarEntryDraft {
  id: string;
  dateKey: string;
  merchantName: string;
  category: CalendarEntryCategoryKey;
  amount: number;
}
