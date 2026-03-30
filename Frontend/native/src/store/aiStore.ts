import { create } from 'zustand';

import {
  getAiAnalysis,
  isAiAnalysisApiError,
  type AiAnalysisApiError,
  type AiAnalysisReport,
  type GetAiAnalysisParams,
} from '../services/ai';
import {
  clearPersistedAiReport,
  loadPersistedAiReport,
  savePersistedAiReport,
  type PersistedAiReportData,
} from '../services/aiReportStorage';
import { matchesAiReportPeriod, resolveAiReportPeriod } from '../utils/aiReportPeriod';
import { useAuthStore } from './authStore';

export type AiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AiResultData {
  completedAt?: string;
  fromPush?: boolean;
  report?: AiAnalysisReport | null;
  fetchedAt?: string;
  cacheExpiresAt?: string;
  reportYear?: number;
  reportMonth?: number;
  ownerUserId?: string | null;
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

interface GenerateAiResultOptions extends GetAiAnalysisParams {
  userInitiated?: boolean;
}

interface AiState {
  status: AiStatus;
  resultData: AiResultData | null;
  showToast: boolean;
  errorInfo: AiErrorState | null;
  isRefreshing: boolean;

  startAnalysis: (params?: GenerateAiResultOptions) => void;
  simulateAnalysis: (params?: GenerateAiResultOptions) => void;
  runAnalysis: (params?: GenerateAiResultOptions) => Promise<AiResultData | null>;
  refreshLatestAnalysis: (params?: RefreshAiResultOptions) => Promise<AiAnalysisReport | null>;
  setSuccess: (data: AiResultData) => void;
  setError: (error?: AiErrorState | null) => void;
  hideToast: () => void;
  reset: () => void;
}

const ANALYSIS_MINIMUM_LOADING_MS = 8500;

let analysisRequestToken = 0;
let analysisTimer: NodeJS.Timeout | null = null;

const nextAnalysisRequestToken = () => {
  analysisRequestToken += 1;
  return analysisRequestToken;
};

const getCurrentAuthUserId = () => useAuthStore.getState().user?.userId ?? null;

const resolveTargetPeriod = (params: GetAiAnalysisParams = {}) => resolveAiReportPeriod(params);

const waitMinimumLoadingTime = (durationMs: number) =>
  new Promise<void>((resolve) => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
    }

    analysisTimer = setTimeout(() => {
      analysisTimer = null;
      resolve();
    }, durationMs);
  });

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

const toPersistedResultData = (data: AiResultData): PersistedAiReportData => ({
  completedAt: data.completedAt,
  fromPush: data.fromPush,
  report: data.report ?? null,
  fetchedAt: data.fetchedAt,
  cacheExpiresAt: data.cacheExpiresAt,
  reportYear: data.reportYear,
  reportMonth: data.reportMonth,
  ownerUserId: data.ownerUserId ?? null,
});

const toAiResultData = (data: PersistedAiReportData | null): AiResultData | null =>
  data
    ? {
        completedAt: data.completedAt,
        fromPush: data.fromPush,
        report: data.report ?? null,
        fetchedAt: data.fetchedAt,
        cacheExpiresAt: data.cacheExpiresAt,
        reportYear: data.reportYear,
        reportMonth: data.reportMonth,
        ownerUserId: data.ownerUserId ?? null,
      }
    : null;

const buildStoredResultData = (
  report: AiAnalysisReport,
  params: GetAiAnalysisParams,
  previousData: AiResultData | null,
  fromPush = false,
): AiResultData => {
  const now = new Date();
  const target = resolveTargetPeriod(params);
  const previousForSamePeriod = matchesAiReportPeriod(previousData, target, getCurrentAuthUserId())
    ? previousData
    : null;

  return {
    ...(previousForSamePeriod ?? {}),
    completedAt: previousForSamePeriod?.completedAt ?? now.toISOString(),
    fromPush: fromPush || previousForSamePeriod?.fromPush || false,
    report,
    fetchedAt: now.toISOString(),
    cacheExpiresAt: now.toISOString(),
    reportYear: target.year,
    reportMonth: target.month,
    ownerUserId: getCurrentAuthUserId(),
  };
};

const getCurrentPeriodResult = (
  resultData: AiResultData | null,
  params: GetAiAnalysisParams = {},
) => {
  const target = resolveTargetPeriod(params);
  const ownerUserId = getCurrentAuthUserId();

  if (!matchesAiReportPeriod(resultData, target, ownerUserId) || !resultData?.report) {
    return null;
  }

  return resultData;
};

const loadPersistedResultForCurrentUser = async (params: GetAiAnalysisParams = {}) => {
  const persisted = await loadPersistedAiReport();
  const aiResultData = toAiResultData(persisted);
  const target = resolveTargetPeriod(params);
  const ownerUserId = getCurrentAuthUserId();

  if (!matchesAiReportPeriod(aiResultData, target, ownerUserId) || !aiResultData?.report) {
    return null;
  }

  return aiResultData;
};

const persistAiResultData = async (data: AiResultData | null) => {
  if (!data?.report) {
    await clearPersistedAiReport();
    return;
  }

  await savePersistedAiReport(toPersistedResultData(data));
};

const presentAnalysisReadyNotification = async () => {
  try {
    const { fcmService } = require('../services/fcmService');
    await fcmService.presentLocalNotification(
      'AI 소비 분석 결과가 도착했어요',
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

  startAnalysis: (params = {}) => {
    if (!params.userInitiated) {
      return;
    }

    const currentPeriodResult = getCurrentPeriodResult(get().resultData, params);

    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }

    set({
      status: 'loading',
      showToast: false,
      resultData: currentPeriodResult,
      errorInfo: null,
      isRefreshing: false,
    });
  },

  simulateAnalysis: (params = {}) => {
    if (!params.userInitiated) {
      return;
    }

    const requestToken = nextAnalysisRequestToken();
    const currentState = get();
    const delayPromise = waitMinimumLoadingTime(ANALYSIS_MINIMUM_LOADING_MS);

    void (async () => {
      try {
        const report = await getAiAnalysis({
          ...resolveTargetPeriod(params),
          generateIfAbsent: true,
        });
        await delayPromise;

        if (requestToken !== analysisRequestToken) {
          return;
        }

        const nextResultData = buildStoredResultData(
          report,
          params,
          currentState.resultData,
          false,
        );

        set({
          status: 'success',
          resultData: nextResultData,
          showToast: true,
          errorInfo: null,
          isRefreshing: false,
        });

        await persistAiResultData(nextResultData);
        void presentAnalysisReadyNotification();
      } catch (error) {
        await delayPromise;

        if (requestToken !== analysisRequestToken) {
          return;
        }

        set({
          status: 'error',
          showToast: false,
          resultData: null,
          errorInfo: toAiErrorState(error),
          isRefreshing: false,
        });
      }
    })();
  },

  runAnalysis: async (params = {}) => {
    if (!params.userInitiated) {
      return null;
    }

    const requestToken = nextAnalysisRequestToken();

    set({
      status: 'loading',
      showToast: false,
      resultData: getCurrentPeriodResult(get().resultData, params),
      errorInfo: null,
      isRefreshing: false,
    });

    try {
      const report = await getAiAnalysis({
        ...resolveTargetPeriod(params),
        generateIfAbsent: true,
      });
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      const nextResultData = buildStoredResultData(report, params, get().resultData, false);

      set({
        status: 'success',
        resultData: nextResultData,
        showToast: true,
        errorInfo: null,
        isRefreshing: false,
      });

      await persistAiResultData(nextResultData);
      void presentAnalysisReadyNotification();
      return nextResultData;
    } catch (error) {
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      set({
        status: 'error',
        resultData: null,
        showToast: false,
        errorInfo: toAiErrorState(error),
        isRefreshing: false,
      });

      return null;
    }
  },

  refreshLatestAnalysis: async (params = {}) => {
    const target = resolveTargetPeriod(params);
    const currentPeriodResult = getCurrentPeriodResult(get().resultData, params);

    if (currentPeriodResult && !params.force) {
      set({
        status: 'success',
        resultData: currentPeriodResult,
        errorInfo: null,
        isRefreshing: false,
      });
      return currentPeriodResult.report ?? null;
    }

    if (!params.force) {
      const persistedResult = await loadPersistedResultForCurrentUser(params);
      if (persistedResult) {
        set({
          status: 'success',
          resultData: persistedResult,
          errorInfo: null,
          isRefreshing: false,
        });
        return persistedResult.report ?? null;
      }
    }

    const requestToken = nextAnalysisRequestToken();

    set({
      isRefreshing: true,
      errorInfo: null,
      status: currentPeriodResult?.report ? 'success' : 'idle',
      resultData: currentPeriodResult,
    });

    try {
      const report = await getAiAnalysis({
        year: target.year,
        month: target.month,
        generateIfAbsent: false,
      });

      if (requestToken !== analysisRequestToken) {
        return null;
      }

      const nextResultData = buildStoredResultData(
        report,
        { year: target.year, month: target.month },
        get().resultData,
        params.fromPush ?? false,
      );

      set({
        status: 'success',
        resultData: nextResultData,
        errorInfo: null,
        isRefreshing: false,
      });

      await persistAiResultData(nextResultData);
      return report;
    } catch (error) {
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      const errorInfo = toAiErrorState(error);
      const nextResultData = currentPeriodResult ?? null;

      set({
        status: nextResultData?.report ? 'success' : 'error',
        resultData: nextResultData,
        errorInfo,
        isRefreshing: false,
      });

      if (!nextResultData) {
        await clearPersistedAiReport();
      }

      return null;
    }
  },

  setSuccess: (data) => {
    const nextResultData: AiResultData = {
      ...get().resultData,
      ...data,
      ownerUserId: data.ownerUserId ?? getCurrentAuthUserId(),
    };

    set({
      status: 'success',
      resultData: nextResultData,
      showToast: true,
      errorInfo: null,
      isRefreshing: false,
    });

    void persistAiResultData(nextResultData);
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

    const currentResult = getCurrentPeriodResult(get().resultData);

    set({
      status: currentResult?.report ? 'success' : 'idle',
      resultData: currentResult,
      showToast: false,
      errorInfo: null,
      isRefreshing: false,
    });
  },
}));
