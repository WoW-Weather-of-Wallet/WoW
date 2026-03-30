type ApiErrorData = {
  message?: string;
  errorMessage?: string;
  responseMessage?: string;
};

/**
 * extractApiErrorMessage
 * native 화면에서 공통 API 에러 문구를 정리합니다.
 * 화면별 fallback 문구를 유지하면서, 백엔드 메시지가 있으면 우선 사용합니다.
 */
export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  const apiError = error as
    | {
        message?: string;
        response?: {
          status?: number;
          data?: ApiErrorData;
        };
      }
    | undefined;

  const status = apiError?.response?.status;
  const apiMessage =
    apiError?.response?.data?.errorMessage ??
    apiError?.response?.data?.responseMessage ??
    apiError?.response?.data?.message ??
    apiError?.message;

  /*
   * 이전 코드:
   * - 모든 401을 "아이디 또는 비밀번호가 올바르지 않습니다."로 고정 변환했습니다.
   *
   * 변경 이유:
   * - 회원가입, 문자 인증, 아이디 찾기 같은 화면의 401도 로그인 실패처럼 보여 혼란을 만들었습니다.
   * - 이제 401은 서버 메시지를 우선 사용하고, 없으면 각 화면의 fallback 문구를 사용합니다.
   */
  if (status === 401) {
    return apiMessage ?? fallbackMessage;
  }
  if (status === 403) {
    return '접근 권한이 없습니다.';
  }
  if (status === 500) {
    return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }

  return apiMessage ?? fallbackMessage;
};
