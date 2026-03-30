import axios from 'axios';

import { nativeApi } from './auth';

const AI_ANALYSIS_TIMEOUT_MS = 180000;

interface ApiResponse<T> {
  data: T;
}

interface AiAnalysisClusterResponse {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  icon?: string | null;
}

interface AiAnalysisCategoryResponse {
  name?: string | null;
  amount?: number | null;
  my_ratio?: number | null;
  base_ratio?: number | null;
  diff?: number | null;
}

interface AiAnalysisOverspendingResponse {
  name?: string | null;
  my_ratio?: number | null;
  base_ratio?: number | null;
  savable_amount?: number | null;
}

interface AiAnalysisSummaryResponse {
  total_savable?: number | null;
  expected_spending?: number | null;
}

interface AiAnalysisTipResponse {
  order?: number | null;
  keyword?: string | null;
  title?: string | null;
  description?: string | null;
}

interface AiAnalysisGoalResponse {
  savable_amount?: number | null;
  expected_spending?: number | null;
  action_tip?: string | null;
}

interface AiAnalysisResponse {
  cluster?: AiAnalysisClusterResponse | null;
  categories?: AiAnalysisCategoryResponse[] | null;
  overspending?: AiAnalysisOverspendingResponse[] | null;
  summary?: AiAnalysisSummaryResponse | null;
  tips?: AiAnalysisTipResponse[] | null;
  goal?: AiAnalysisGoalResponse | null;
}

export type AiAnalysisErrorKind =
  | 'report-not-generated'
  | 'no-transactions'
  | 'server'
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'unknown';

export interface AiAnalysisApiError extends Error {
  kind: AiAnalysisErrorKind;
  statusCode?: number;
  canRetry: boolean;
}

export interface AiAnalysisCluster {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface AiAnalysisCategory {
  name: string;
  amount: number;
  myRatio: number;
  baseRatio: number;
  diff: number;
}

export interface AiAnalysisOverspending {
  name: string;
  myRatio: number;
  baseRatio: number;
  savableAmount: number;
}

export interface AiAnalysisSummary {
  totalSavable: number;
  expectedSpending: number;
}

export interface AiAnalysisTip {
  order: number;
  keyword: string;
  title: string;
  description: string;
}

export interface AiAnalysisGoal {
  savableAmount: number;
  expectedSpending: number;
  actionTip: string;
}

export interface AiAnalysisReport {
  cluster: AiAnalysisCluster;
  categories: AiAnalysisCategory[];
  overspending: AiAnalysisOverspending[];
  summary: AiAnalysisSummary;
  tips: AiAnalysisTip[];
  goal: AiAnalysisGoal;
}

export interface GetAiAnalysisParams {
  year?: number;
  month?: number;
  generateIfAbsent?: boolean;
}

const toNumber = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toText = (value?: string | null) => (typeof value === 'string' ? value : '');

const normalizeAiAnalysis = (report?: AiAnalysisResponse | null): AiAnalysisReport => ({
  cluster: {
    id: toNumber(report?.cluster?.id),
    name: toText(report?.cluster?.name),
    description: toText(report?.cluster?.description),
    icon: toText(report?.cluster?.icon),
  },
  categories: (report?.categories ?? []).map((item) => ({
    name: toText(item?.name),
    amount: toNumber(item?.amount),
    myRatio: toNumber(item?.my_ratio),
    baseRatio: toNumber(item?.base_ratio),
    diff: toNumber(item?.diff),
  })),
  overspending: (report?.overspending ?? []).map((item) => ({
    name: toText(item?.name),
    myRatio: toNumber(item?.my_ratio),
    baseRatio: toNumber(item?.base_ratio),
    savableAmount: toNumber(item?.savable_amount),
  })),
  summary: {
    totalSavable: toNumber(report?.summary?.total_savable),
    expectedSpending: toNumber(report?.summary?.expected_spending),
  },
  tips: (report?.tips ?? []).map((item, index) => ({
    order: toNumber(item?.order) || index + 1,
    keyword: toText(item?.keyword),
    title: toText(item?.title),
    description: toText(item?.description),
  })),
  goal: {
    savableAmount: toNumber(report?.goal?.savable_amount),
    expectedSpending: toNumber(report?.goal?.expected_spending),
    actionTip: toText(report?.goal?.action_tip),
  },
});

const buildAiAnalysisApiError = (
  error: unknown,
  params: GetAiAnalysisParams = {},
): AiAnalysisApiError => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const apiMessage =
      error.response?.data?.errorMessage
      ?? error.response?.data?.responseMessage
      ?? error.response?.data?.message
      ?? error.message;

    if (statusCode === 404) {
      if (params.generateIfAbsent) {
        return {
          name: 'AiAnalysisApiError',
          kind: 'no-transactions',
          message: apiMessage || '최근 3개월 거래가 없어 AI 리포트를 생성할 수 없어요.',
          statusCode,
          canRetry: false,
        };
      }

      return {
        name: 'AiAnalysisApiError',
        kind: 'report-not-generated',
        message: apiMessage || '이번 달 AI 리포트가 아직 생성되지 않았어요.',
        statusCode,
        canRetry: false,
      };
    }

    if (statusCode === 401) {
      return {
        name: 'AiAnalysisApiError',
        kind: 'unauthorized',
        message: apiMessage || '로그인이 만료됐어요. 다시 로그인해주세요.',
        statusCode,
        canRetry: false,
      };
    }

    if (statusCode === 403) {
      return {
        name: 'AiAnalysisApiError',
        kind: 'forbidden',
        message: apiMessage || 'AI 리포트를 조회할 권한이 없어요.',
        statusCode,
        canRetry: false,
      };
    }

    if (statusCode && statusCode >= 500) {
      return {
        name: 'AiAnalysisApiError',
        kind: 'server',
        message: apiMessage || 'AI 서버 연결이 불안정해요. 잠시 후 다시 시도해주세요.',
        statusCode,
        canRetry: true,
      };
    }

    if (!error.response) {
      return {
        name: 'AiAnalysisApiError',
        kind: 'network',
        message: '네트워크 연결이 불안정해요. 인터넷 상태를 확인한 뒤 다시 시도해주세요.',
        canRetry: true,
      };
    }

    return {
      name: 'AiAnalysisApiError',
      kind: 'unknown',
      message: apiMessage || 'AI 리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
      statusCode,
      canRetry: true,
    };
  }

  if (error instanceof Error) {
    return {
      name: 'AiAnalysisApiError',
      kind: 'unknown',
      message: error.message,
      canRetry: true,
    };
  }

  return {
    name: 'AiAnalysisApiError',
    kind: 'unknown',
    message: 'AI 리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
    canRetry: true,
  };
};

export const isAiAnalysisApiError = (error: unknown): error is AiAnalysisApiError =>
  error != null
  && typeof error === 'object'
  && 'kind' in error
  && 'canRetry' in error;

export async function getAiAnalysis(params: GetAiAnalysisParams = {}) {
  const queryParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value != null),
  );

  try {
    const response = await nativeApi.get<ApiResponse<AiAnalysisResponse>>('/api/v1/ai/analysis', {
      params: queryParams,
      timeout: AI_ANALYSIS_TIMEOUT_MS,
    });

    return normalizeAiAnalysis(response.data.data);
  } catch (error) {
    throw buildAiAnalysisApiError(error, params);
  }
}
