type ApiErrorData = {
  message?: string;
  errorMessage?: string;
  responseMessage?: string;
};

/**
 * extractApiErrorMessage
 * EAS Build 는 native 폴더만 아카이브하기 때문에, shared 폴더 헬퍼를 직접 참조하지 않습니다.
 * 네이티브 화면에서 공통 에러 문구 우선순위는 이 파일 하나로 통일해 중복 분기를 줄입니다.
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

  /**
   * [Defense-Log] 백엔드 감사 결과(P2)에 따라 요청값 검증이 서버측에서 부족할 수 있고,
   * 예외 처리가 좁아(GlobalExceptionHandler) 401, 500 에러가 생으로 노출될 수 있음.
   * 프론트엔드에서 상태 코드를 가로채어 친절한 한국어 문구로 치환합니다.
   */
  const status = apiError?.response?.status;
  if (status === 401) {
    return '아이디 또는 비밀번호가 올바르지 않습니다.';
  }
  if (status === 403) {
    return '접근 권한이 없습니다.';
  }
  if (status === 500) {
    return '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  return (
    apiError?.response?.data?.errorMessage ??
    apiError?.response?.data?.responseMessage ??
    apiError?.response?.data?.message ??
    apiError?.message ??
    fallbackMessage
  );
};
