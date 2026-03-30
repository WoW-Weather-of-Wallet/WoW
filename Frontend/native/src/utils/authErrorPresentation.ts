import { extractApiErrorMessage } from './error';

export type AuthErrorFlow =
  | 'sms-send'
  | 'sms-verify'
  | 'signup'
  | 'password-reset'
  | 'phone-update'
  | 'generic';

export type AuthErrorPresentation = {
  title: string;
  inlineMessage: string;
  alertMessage: string;
};

type AuthErrorInput = {
  flow: AuthErrorFlow;
  fallbackMessage: string;
};

const defaultTitles: Record<AuthErrorFlow, string> = {
  'sms-send': '인증번호 발송 실패',
  'sms-verify': '인증 오류',
  signup: '회원가입 실패',
  'password-reset': '비밀번호 변경 실패',
  'phone-update': '휴대폰 인증 오류',
  generic: '오류',
};

export const buildAuthErrorPresentation = (
  error: unknown,
  input: AuthErrorInput,
): AuthErrorPresentation => {
  const message = extractApiErrorMessage(error, input.fallbackMessage);
  const apiError = error as
    | {
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

  // 수정 전 코드:
  // - SMS 관련 화면마다 같은 예외를 각자 다른 문구로 처리했습니다.
  //
  // 변경 이유:
  // - 로컬 Solapi 설정 문제, 재인증 필요, 인증번호 오류/만료를
  //   어떤 화면에서든 같은 기준으로 보여줘야 사용자가 다음 액션을 이해할 수 있습니다.
  if (serverMessage.includes('SMS 인증이 필요합니다')) {
    return {
      title: '문자 인증 필요',
      inlineMessage: '문자 인증이 만료되었어요. 인증을 다시 완료한 뒤 다시 시도해주세요.',
      alertMessage: '문자 인증이 만료되었어요. 인증번호 확인 단계부터 다시 진행해주세요.',
    };
  }

  if (serverMessage.includes('공인 IP')) {
    return {
      title: '로컬 SMS 설정 필요',
      inlineMessage: '현재 로컬 서버 IP가 Solapi에 등록되지 않아 문자 기능을 사용할 수 없어요.',
      alertMessage:
        '현재 로컬 서버 공인 IP가 Solapi 허용 IP에 등록되지 않았습니다. 백엔드 로컬 SMS 설정을 확인해주세요.',
    };
  }

  if (serverMessage.includes('발신번호')) {
    return {
      title: 'SMS 발신 설정 오류',
      inlineMessage: '문자 발신번호 설정 문제로 현재 기능을 진행할 수 없어요.',
      alertMessage: 'SMS 발신번호가 Solapi에 등록되어 있지 않습니다. 백엔드 설정을 확인해주세요.',
    };
  }

  if (serverMessage.includes('API 인증 정보')) {
    return {
      title: 'SMS API 설정 오류',
      inlineMessage: '문자 서비스 인증 설정 문제로 현재 기능을 진행할 수 없어요.',
      alertMessage: 'SMS API 인증 정보가 올바르지 않습니다. 백엔드 환경변수를 확인해주세요.',
    };
  }

  if (serverMessage.includes('인증번호가 없거나 만료되었습니다')) {
    return {
      title: '인증번호 만료',
      inlineMessage: '인증번호가 만료되었어요. 인증번호를 다시 발송해 주세요.',
      alertMessage: '인증번호가 만료되었어요. 새 인증번호를 발송한 뒤 다시 입력해주세요.',
    };
  }

  if (serverMessage.includes('인증번호가 올바르지 않습니다')) {
    return {
      title: '인증번호 불일치',
      inlineMessage: '입력한 인증번호가 올바르지 않아요. 다시 확인해주세요.',
      alertMessage: '입력한 인증번호가 올바르지 않아요. 다시 확인해주세요.',
    };
  }

  if (serverMessage.includes('인증번호 입력 횟수를 초과했습니다')) {
    return {
      title: '인증번호 입력 제한',
      inlineMessage: '인증번호 입력 횟수를 초과했어요. 인증번호를 다시 요청해주세요.',
      alertMessage: '인증번호 입력 횟수를 초과했어요. 새 인증번호를 요청한 뒤 다시 시도해주세요.',
    };
  }

  if (serverMessage.includes('1분 뒤에 다시 요청')) {
    return {
      title: '재요청 제한',
      inlineMessage: '인증번호는 1분 뒤에 다시 요청할 수 있어요.',
      alertMessage: '인증번호는 1분 뒤에 다시 요청할 수 있어요.',
    };
  }

  if (status === 500 && input.flow === 'signup') {
    return {
      title: '회원가입 저장 실패',
      inlineMessage: '회원 정보 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      alertMessage: '회원 정보 저장 중 문제가 발생했어요. 같은 문제가 반복되면 서버 로그를 확인해주세요.',
    };
  }

  if (status === 500 && input.flow === 'password-reset') {
    return {
      title: '비밀번호 저장 실패',
      inlineMessage: '새 비밀번호 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      alertMessage: '새 비밀번호 저장 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    };
  }

  return {
    title: defaultTitles[input.flow],
    inlineMessage: message,
    alertMessage: message,
  };
};
