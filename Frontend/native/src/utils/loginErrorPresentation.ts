import { extractApiErrorMessage } from './error';

const LOGIN_ERROR_FALLBACK =
  '로그인 중 문제가 발생했어요. 아이디와 비밀번호를 다시 확인해 주세요.';
const SSAFY_ERROR_FALLBACK =
  'SSAFY 로그인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.';

export type LoginErrorMode = 'general' | 'ssafy';

export const buildLoginErrorPresentation = (
  error: unknown,
  mode: LoginErrorMode,
) => {
  const fallbackMessage = mode === 'general' ? LOGIN_ERROR_FALLBACK : SSAFY_ERROR_FALLBACK;
  const message = extractApiErrorMessage(error, fallbackMessage);
  const apiError = error as
    | {
        message?: string;
        response?: {
          status?: number;
          data?: {
            errorMessage?: string;
          };
        };
      }
    | undefined;

  const status = apiError?.response?.status;
  const serverMessage = apiError?.response?.data?.errorMessage ?? message;
  const normalizedMessage = serverMessage.toLowerCase();

  if (mode === 'general' && status === 401) {
    return {
      title: '로그인 실패',
      inlineMessage: '아이디 또는 비밀번호가 올바르지 않아요.',
      alertMessage: '아이디 또는 비밀번호가 올바르지 않아요.',
    };
  }

  if (mode === 'ssafy' && normalizedMessage.includes('cancel')) {
    return {
      title: 'SSAFY 로그인 취소',
      inlineMessage: 'SSAFY 로그인을 취소했어요.',
      alertMessage: 'SSAFY 로그인을 취소했어요. 다시 시도해 주세요.',
    };
  }

  if (mode === 'ssafy' && /ssafy|oauth|token/.test(normalizedMessage)) {
    return {
      title: 'SSAFY 로그인 오류',
      inlineMessage: 'SSAFY 인증 처리 중 문제가 발생했어요. 다시 시도해 주세요.',
      alertMessage: 'SSAFY 인증 처리 중 문제가 발생했어요. 다시 시도해 주세요.',
    };
  }

  if (status === 500) {
    return {
      title: mode === 'general' ? '로그인 오류' : 'SSAFY 로그인 오류',
      inlineMessage: '서버 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
      alertMessage: '서버 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',
    };
  }

  return {
    title: mode === 'general' ? '로그인 실패' : 'SSAFY 로그인 오류',
    inlineMessage: message,
    alertMessage: message,
  };
};
