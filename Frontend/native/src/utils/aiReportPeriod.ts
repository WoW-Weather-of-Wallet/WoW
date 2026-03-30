export interface AiReportPeriodLike {
  reportYear?: number;
  reportMonth?: number;
  ownerUserId?: string | null;
}

export interface AiReportPeriod {
  year: number;
  month: number;
  key: string;
  label: string;
}

const padMonth = (month: number) => String(month).padStart(2, '0');

export const resolveAiReportPeriod = (
  params: { year?: number; month?: number } = {},
  now: Date = new Date(),
): AiReportPeriod => {
  const baseDate = new Date(now);
  baseDate.setDate(1);
  baseDate.setMonth(baseDate.getMonth() - 1);

  const year = params.year ?? baseDate.getFullYear();
  const month = params.month ?? baseDate.getMonth() + 1;

  return {
    year,
    month,
    key: `${year}-${padMonth(month)}`,
    label: `${year}.${padMonth(month)}`,
  };
};

export const matchesAiReportPeriod = (
  value: AiReportPeriodLike | null | undefined,
  period: AiReportPeriod,
  ownerUserId?: string | null,
) => {
  if (!value) {
    return false;
  }

  const samePeriod =
    value.reportYear === period.year
    && value.reportMonth === period.month;

  if (!samePeriod) {
    return false;
  }

  if (ownerUserId === undefined) {
    return true;
  }

  return value.ownerUserId === ownerUserId;
};
