import { create } from 'zustand';

import { getAiAnalysis, type AiAnalysisReport, type GetAiAnalysisParams } from '../services/ai';
import { extractApiErrorMessage } from '../utils/error';

export type AiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AiResultData {
  completedAt?: string;
  fromPush?: boolean;
  report?: AiAnalysisReport | null;
  [key: string]: unknown;
}

interface RefreshAiResultOptions extends GetAiAnalysisParams {
  fromPush?: boolean;
}

interface AiState {
  status: AiStatus;
  resultData: AiResultData | null;
  showToast: boolean;
  errorMessage: string | null;

  startAnalysis: () => void;
  simulateAnalysis: () => void;
  runAnalysis: (params?: GetAiAnalysisParams) => Promise<AiResultData | null>;
  refreshLatestAnalysis: (params?: RefreshAiResultOptions) => Promise<AiAnalysisReport | null>;
  setSuccess: (data: AiResultData) => void;
  setError: (message?: string) => void;
  hideToast: () => void;
  reset: () => void;
}

let analysisRequestToken = 0;
let analysisTimer: NodeJS.Timeout | null = null;

const nextAnalysisRequestToken = () => {
  analysisRequestToken += 1;
  return analysisRequestToken;
};

const buildAnalysisFallbackMessage = () =>
  'AI 피드백을 불러오지 못했어요. 잠시 후 다시 시도해주세요.';

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
  errorMessage: null,

  startAnalysis: () => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }

    set({
      status: 'loading',
      showToast: false,
      resultData: null,
      errorMessage: null,
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

      const nextResultData: AiResultData = {
        completedAt: new Date().toISOString(),
        fromPush: false,
        report,
      };

      set({
        status: 'success',
        resultData: nextResultData,
        showToast: true,
        errorMessage: null,
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
        errorMessage: extractApiErrorMessage(error, buildAnalysisFallbackMessage()),
      });

      return null;
    }
  },

  refreshLatestAnalysis: async (params = {}) => {
    const requestToken = nextAnalysisRequestToken();
    const { year, month, fromPush } = params;

    try {
      const report = await getAiAnalysis({ year, month });
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      set((state) => ({
        status: 'success',
        resultData: {
          ...(state.resultData ?? {}),
          completedAt: state.resultData?.completedAt ?? new Date().toISOString(),
          fromPush: fromPush ?? state.resultData?.fromPush ?? false,
          report,
        },
        errorMessage: null,
      }));

      return report;
    } catch (error) {
      if (requestToken !== analysisRequestToken) {
        return null;
      }

      const message = extractApiErrorMessage(error, buildAnalysisFallbackMessage());
      set({ errorMessage: message });

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
      errorMessage: null,
    }));
  },

  setError: (message) => {
    set({
      status: 'error',
      showToast: false,
      errorMessage: message ?? buildAnalysisFallbackMessage(),
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
      errorMessage: null,
    });
  },
}));
