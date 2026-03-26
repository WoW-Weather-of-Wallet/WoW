import React from 'react';
import { hp } from '../../constants/theme';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import IdentityVerificationForm from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { useRecoverySmsFlow } from '../../hooks';

export default function FindIdScreen() {
  const {
    isSubmitting,
    termsVisible,
    handleIdentityComplete,
    handleTermsClose,
    handleTermsConfirm,
  } = useRecoverySmsFlow({
    flow: 'FindId',
    fallbackMessage: '인증번호 발송에 실패했어요. 다시 시도해 주세요.',
  });

  return (
    <>
      <AuthScreenLayout title="아이디 찾기">
        <AuthIntroBlock
          title="본인 확인 후 아이디를 찾을 수 있어요."
          description="입력한 정보는 다음 단계의 계정 조회에 사용돼요."
          marginBottom={hp(40)}
        />
        <IdentityVerificationForm
          onComplete={handleIdentityComplete}
          isSubmitting={isSubmitting}
        />
      </AuthScreenLayout>

      <TermsBottomSheet
        visible={termsVisible}
        flow="FindId"
        onClose={handleTermsClose}
        onConfirm={handleTermsConfirm}
      />
    </>
  );
}

