type ApiErrorData = {
  message?: string;
  errorMessage?: string;
  responseMessage?: string;
};

/**
 * extractApiErrorMessage
 * 현재 auth 관련 화면들은 message / errorMessage / responseMessage 를 혼용해서 받고 있습니다.
 * 백엔드 응답이 완전히 통일되기 전까지는 이 헬퍼 하나로 우선순위를 정해 화면 문구를 일관되게 맞춥니다.
 */
export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  const axiosError = error as
    | {
        message?: string;
        response?: {
          data?: ApiErrorData;
        };
      }
    | undefined;

  return (
    axiosError?.response?.data?.errorMessage ??
    axiosError?.response?.data?.responseMessage ??
    axiosError?.response?.data?.message ??
    axiosError?.message ??
    fallbackMessage
  );
};
