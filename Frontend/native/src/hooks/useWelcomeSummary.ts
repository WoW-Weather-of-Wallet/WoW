import { useMemo } from 'react';
import type { KeyValueInfoItem } from '../components/common/KeyValueInfoCard';
import type { WelcomeRouteParams } from '../types/auth';

const EMPTY_VALUE = '-';

function buildGenderLabel(gender?: WelcomeRouteParams['gender']) {
  if (gender === 'M') {
    return '남성';
  }

  if (gender === 'F') {
    return '여성';
  }

  return EMPTY_VALUE;
}

export function useWelcomeSummary({
  routeParams,
  isSsafySignup,
}: {
  routeParams: WelcomeRouteParams;
  isSsafySignup: boolean;
}) {
  const title = '회원가입이 완료되었어요';
  const subtitle = routeParams.name
    ? `${routeParams.name}님, 반가워요.`
    : '가입 정보를 확인해 주세요.';

  const summaryItems = useMemo<KeyValueInfoItem[]>(
    () => [
      {
        key: 'signup-mode',
        label: isSsafySignup ? '가입 방식' : '아이디',
        value: isSsafySignup ? 'SSAFY' : routeParams.userId ?? EMPTY_VALUE,
      },
      {
        key: 'name',
        label: '이름',
        value: routeParams.name ?? EMPTY_VALUE,
      },
      {
        key: 'birth-date',
        label: '생년월일',
        value: routeParams.birthDate ?? EMPTY_VALUE,
      },
      {
        key: 'gender',
        label: '성별',
        value: buildGenderLabel(routeParams.gender),
      },
      {
        key: 'phone-number',
        label: '휴대폰 번호',
        value: routeParams.phoneNumber ?? EMPTY_VALUE,
      },
      {
        key: 'terms-agreed',
        label: '약관 동의',
        value: routeParams.termsAgreed ? '동의' : '미동의',
      },
      {
        key: 'alarm-enabled',
        label: '알림 수신',
        value: routeParams.alarmEnabled ? '사용' : '미사용',
      },
    ],
    [
      isSsafySignup,
      routeParams.alarmEnabled,
      routeParams.birthDate,
      routeParams.gender,
      routeParams.name,
      routeParams.phoneNumber,
      routeParams.termsAgreed,
      routeParams.userId,
    ],
  );

  return {
    title,
    subtitle,
    summaryItems,
  };
}
