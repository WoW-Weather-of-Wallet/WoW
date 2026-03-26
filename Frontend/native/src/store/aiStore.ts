import { create } from 'zustand';

import {
  getAiAnalysis,
  isAiAnalysisApiError,
  type AiAnalysisApiError,
  type AiAnalysisReport,
  type GetAiAnalysisParams,
} from '../services/ai';

export type AiStatus = 'idle' | 'loading' | 'success' | 'error';

const AI_RESULT_CACHE_TTL_MS = 5 * 60 * 1000;

export interface AiResultData {
  completedAt?: string;
  fromPush?: boolean;
  report?: AiAnalysisReport | null;
  fetchedAt?: string;
  cacheExpiresAt?: string;
  reportYear?: number;
  reportMonth?: number;
  [key: string]: unknown;
}

export interface AiErrorState {
  kind: AiAnalysisApiError['kind'];
  message: string;
  statusCode?: number;
  canRetry: boolean;
}

interface RefreshAiResultOptions extends GetAiAnalysisParams {
  fromPush?: boolean;
  force?: boolean;
}

interface AiState {
  status: AiStatus;
  resultData: AiResultData | null;
  showToast: boolean;
  errorInfo: AiErrorState | null;
  isRefreshing: boolean;

  startAnalysis: () => void;
  simulateAnalysis: () => void;
  runAnalysis: (params?: GetAiAnalysisParams) => Promise<AiResultData | null>;
  refreshLatestAnalysis: (params?: RefreshAiResultOptions) => Promise<AiAnalysisReport | null>;
  setSuccess: (data: AiResultData) => void;
  setError: (error?: AiErrorState | null) => void;
  hideToast: () => void;
  reset: () => void;
}

let analysisRequestToken = 0;
let analysisTimer: NodeJS.Timeout | null = null;

const nextAnalysisRequestToken = () => {
  analysisRequestToken += 1;
  return analysisRequestToken;
};

const resolveTargetPeriod = (params: GetAiAnalysisParams = {}) => {
  const now = new Date();

  return {
    year: params.year ?? now.getFullYear(),
    month: params.month ?? now.getMonth() + 1,
  };
};

const hasFreshCachedReport = (
  resultData: AiResultData | null,
  params: GetAiAnalysisParams = {},
) => {
  if (!resultData?.report || !resultData.cacheExpiresAt) {
    return false;
  }

  const target = resolveTargetPeriod(params);
  const samePeriod =
    resultData.reportYear === target.year && resultData.reportMonth === target.month;

  return samePeriod && new Date(resultData.cacheExpiresAt).getTime() > Date.now();
};

const toAiErrorState = (error: unknown): AiErrorState => {
  if (isAiAnalysisApiError(error)) {
    return {
      kind: error.kind,
      message: error.message,
      statusCode: error.statusCode,
      canRetry: error.canRetry,
    };
  }

  return {
    kind: 'unknown',
    message: 'AI 피드백을 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
    canRetry: true,
  };
};

const buildStoredResultData = (
  report: AiAnalysisReport,
  params: RefreshAiResultOptions,
  previousData: AiResultData | null,
): AiResultData => {
  const now = new Date();
  const target = resolveTargetPeriod(params);

  return {
    ...(previousData ?? {}),
    completedAt: previousData?.completedAt ?? now.toISOString(),
    fromPush: params.fromPush ?? previousData?.fromPush ?? false,
    report,
    fetchedAt: now.toISOString(),
    cacheExpiresAt: new Date(now.getTime() + AI_RESULT_CACHE_TTL_MS).toISOString(),
    reportYear: target.year,
    reportMonth: target.month,
  };
};

const presentAnalysisReadyNotification = async () => {
  try {
    const { fcmService } = require('../services/fcmService');
    await fcmService.presentLocalNotification(
      'AI 소비 분석 결과가 도착했어요!',
      '지금 바로 리포트를 확인해보세요.',
      { action: 'ai_feedback' },
    );
  } catch (error) {
    console.warn('Failed to present AI notification', error);
  }
};

export const useAiStore = create<AiState>((set, get) => ({
  status: 'idle',
  resultData: null,
  showToast: false,
  errorInfo: null,
  isRefreshing: false,

  startAnalysis: () => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }

    set({
      status: 'loading',
      showToast: false,
      resultData: null,
      errorInfo: null,
      isRefreshing: false,
    });
  },

  simulateAnalysis: () => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
    }

    analysisTimer = setTimeout(() => {
      const state = get();
      if (state.status === 'loading') {
        state.setSuccess({
          completedAt: new Date().toISOString(),
          fromPush: false,
        });
        void presentAnalysisReadyNotification();
      }
      analysisTimer = null;
    }, 8500);
  },

  runAnalysis: async (params = {}) => {
    const requestToken = nextAnalysisRequestToken();

    try {
      const report = await getAiAnalysis(params);
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      const nextResultData = buildStoredResultData(report, params, null);

      set({
        status: 'success',
        resultData: nextResultData,
        showToast: true,
        errorInfo: null,
        isRefreshing: false,
      });

      void presentAnalysisReadyNotification();
      return nextResultData;
    } catch (error) {
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      set({
        status: 'error',
        showToast: false,
        errorInfo: toAiErrorState(error),
        isRefreshing: false,
      });

      return null;
    }
  },

  refreshLatestAnalysis: async (params = {}) => {
    const currentState = get();

    if (!params.force && hasFreshCachedReport(currentState.resultData, params)) {
      set({
        errorInfo: null,
        isRefreshing: false,
      });
      return currentState.resultData?.report ?? null;
    }

    const requestToken = nextAnalysisRequestToken();
    const hasExistingReport = Boolean(currentState.resultData?.report);

    set({
      isRefreshing: true,
      errorInfo: null,
      status: hasExistingReport ? 'success' : currentState.status,
    });

    try {
      const report = await getAiAnalysis(params);
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      set((state) => ({
        status: 'success',
        resultData: buildStoredResultData(report, params, state.resultData),
        errorInfo: null,
        isRefreshing: false,
      }));

      return report;
    } catch (error) {
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      const errorInfo = toAiErrorState(error);

      set((state) => ({
        status: state.resultData?.report ? 'success' : 'error',
        errorInfo,
        isRefreshing: false,
      }));

      return null;
    }
  },

  setSuccess: (data) => {
    set((state) => ({
      status: 'success',
      resultData: {
        ...(state.resultData ?? {}),
        ...data,
      },
      showToast: true,
      errorInfo: null,
      isRefreshing: false,
    }));
  },

  setError: (error) => {
    set({
      status: 'error',
      showToast: false,
      errorInfo: error ?? null,
      isRefreshing: false,
    });
  },

  hideToast: () => {
    set({ showToast: false });
  },

  reset: () => {
    nextAnalysisRequestToken();
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }
    set({
      status: 'idle',
      resultData: null,
      showToast: false,
      errorInfo: null,
      isRefreshing: false,
    });
  },
}));
