import { create } from 'zustand';

export type AiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AiResultData {
  completedAt?: string;
  fromPush?: boolean;
  [key: string]: unknown;
}

interface AiState {
  status: AiStatus;
  resultData: AiResultData | null;
  showToast: boolean;
  
  // Actions
  startAnalysis: () => void;
  simulateAnalysis: () => void;
  setSuccess: (data: AiResultData) => void;
  setError: () => void;
  hideToast: () => void;
  reset: () => void;
}

/**
 * useAiStore
 * AI 분석 상태와 결과 데이터를 전역적으로 관리합니다.
 * 사용자가 로딩 화면을 벗어나더라도 배경에서 상태를 유지하고 알림을 띄울 수 있게 합니다.
 */
let analysisTimer: NodeJS.Timeout | null = null;

export const useAiStore = create<AiState>((set, get) => ({
  status: 'idle',
  resultData: null,
  showToast: false,

  startAnalysis: () => {
    // 기존 타이머가 있다면 정리 (안전 장치)
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }
    set({ status: 'loading', showToast: false, resultData: null });
  },

  simulateAnalysis: () => {
    // 이미 실행 중인 타이머가 있다면 무시하거나 재설정 (여기서는 혹시 모를 중복 방지를 위해 정리 후 시작)
    if (analysisTimer) {
      clearTimeout(analysisTimer);
    }

    // 8.5초 후 분석 완료 시뮬레이션
    analysisTimer = setTimeout(() => {
      const state = get();
      // 반드시 로딩 상태일 때만 성공으로 변경
      if (state.status === 'loading') {
        set({
          status: 'success',
          resultData: { completedAt: new Date().toISOString() },
          showToast: true
        });
        
        // [Item 5] 시뮬레이션 완료 시에도 시스템 알림(상단 바)을 강제 발생시켜 사용자 인지 유도
        const { fcmService } = require('../services/fcmService');
        void fcmService.presentLocalNotification(
          'AI 소비 분석 결과 도착!',
          '지금 바로 리포트를 확인해보세요.',
          { action: 'ai_feedback' }
        );
      }
      analysisTimer = null;
    }, 8500);
  },

  setSuccess: (data: AiResultData) => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }
    set({ 
      status: 'success', 
      resultData: data, 
      showToast: true 
    });
  },

  setError: () => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }
    set({ status: 'error', showToast: false });
  },

  hideToast: () => {
    set({ showToast: false });
  },

  reset: () => {
    if (analysisTimer) {
      clearTimeout(analysisTimer);
      analysisTimer = null;
    }
    set({ status: 'idle', resultData: null, showToast: false });
  },
}));
