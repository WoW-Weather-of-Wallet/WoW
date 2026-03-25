import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { hp } from '../../constants/theme';
import AuthScreenLayout from '../../components/auth/AuthScreenLayout';
import AuthIntroBlock from '../../components/auth/AuthIntroBlock';
import IdentityVerificationForm, { IdentityData } from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { sendSmsCode } from '../../services/auth';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';

export default function FindIdScreen() {
  const navigation = useNavigation<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingData, setPendingData] = useState<IdentityData | null>(null);

  const handleComplete = (data: IdentityData) => {
    setPendingData(data);
    setTermsVisible(true);
  };

  const handleTermsConfirm = async () => {
    if (!pendingData) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 인증번호 발송은 아이디 찾기 API 호출 전에 공통으로 필요한 단계입니다.
      await sendSmsCode({ phoneNumber: pendingData.phone });

      // 다음 화면에서 본인확인 정보를 그대로 사용하므로 함께 전달합니다.
      navigation.navigate('VerifyCode', {
        ...pendingData,
        flow: 'FindId',
      });
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: '인증번호 발송에 실패했어요. 다시 시도해 주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthScreenLayout title="아이디 찾기">
        <AuthIntroBlock
          title="본인 확인 후 아이디를 찾을 수 있어요."
          description="입력한 정보는 다음 단계의 계정 조회에 사용돼요."
          marginBottom={hp(40)}
        />
          <IdentityVerificationForm
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
      </AuthScreenLayout>

      <TermsBottomSheet
        visible={termsVisible}
        flow="FindId"
        onClose={() => setTermsVisible(false)}
        onConfirm={handleTermsConfirm}
      />
    </>
  );
}

