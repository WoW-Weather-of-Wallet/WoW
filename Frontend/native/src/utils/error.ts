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
          data?: ApiErrorData;
        };
      }
    | undefined;

  return (
    apiError?.response?.data?.errorMessage ??
    apiError?.response?.data?.responseMessage ??
    apiError?.response?.data?.message ??
    apiError?.message ??
    fallbackMessage
  );
};
