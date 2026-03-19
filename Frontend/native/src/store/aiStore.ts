import { create } from 'zustand';

export type AiStatus = 'idle' | 'loading' | 'success' | 'error';

interface AiState {
  status: AiStatus;
  resultData: any | null;
  showToast: boolean;
  
  // Actions
  startAnalysis: () => void;
  simulateAnalysis: () => void;
  setSuccess: (data: any) => void;
  setError: () => void;
  hideToast: () => void;
  reset: () => void;
}

/**
 * useAiStore
 * AI 분석 상태와 결과 데이터를 전역적으로 관리합니다.
 * 사용자가 로딩 화면을 벗어나더라도 배경에서 상태를 유지하고 알림을 띄울 수 있게 합니다.
 */
export const useAiStore = create<AiState>((set, get) => ({
  status: 'idle',
  resultData: null,
  showToast: false,

  startAnalysis: () => {
    set({ status: 'loading', showToast: false, resultData: null });
  },

  simulateAnalysis: () => {
    // 8초 후 분석 완료 시뮬레이션 (화면을 나가도 유지됨)
    setTimeout(() => {
      // 이미 성공했거나 에러 상태가 아니라면 결과 설정
      const state = get();
      if (state.status === 'loading') {
        set({
          status: 'success',
          resultData: { completedAt: new Date().toISOString() },
          showToast: true
        });
      }
    }, 8500);
  },

  setSuccess: (data: any) => {
    set({ 
      status: 'success', 
      resultData: data, 
      showToast: true 
    });
  },

  setError: () => {
    set({ status: 'error', showToast: false });
  },

  hideToast: () => {
    set({ showToast: false });
  },

  reset: () => {
    set({ status: 'idle', resultData: null, showToast: false });
  },
}));
