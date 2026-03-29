import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { sendSmsCode, verifySmsCode, normalizePhoneNumber } from '../../services/auth';
import { buildAuthErrorPresentation } from '../../utils/authErrorPresentation';
import { maskPhoneNumber } from '../../utils/phoneFormat';

interface WithdrawConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  phoneNumber: string;
}

export default function WithdrawConfirmationModal({
  visible,
  onClose,
  onConfirm,
  phoneNumber = '',
}: WithdrawConfirmationModalProps) {
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const maskedPhone = maskPhoneNumber(phoneNumber);

  const handleClose = () => {
    setCode('');
    setIsCodeSent(false);
    setIsVerified(false);
    setIsSending(false);
    setIsVerifying(false);
    onClose();
  };

  const handleSendCode = async () => {
    if (isSending) return;

    setIsSending(true);
    try {
      await sendSmsCode({ phoneNumber: normalizePhoneNumber(phoneNumber) });
      setIsCodeSent(true);
      setIsVerified(false);
      setCode('');
      Alert.alert('인증번호 발송', `${maskedPhone}로 인증번호를 전송했어요.`);
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-send',
        fallbackMessage: '인증번호를 보내지 못했어요. 다시 시도해 주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (isVerifying || code.trim().length !== 6) return;

    setIsVerifying(true);
    try {
      await verifySmsCode({
        phoneNumber: normalizePhoneNumber(phoneNumber),
        code: code.trim(),
      });
      setIsVerified(true);
    } catch (error) {
      const presentation = buildAuthErrorPresentation(error, {
        flow: 'sms-verify',
        fallbackMessage: '인증번호가 올바르지 않아요. 다시 확인해 주세요.',
      });
      Alert.alert(presentation.title, presentation.alertMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirm = () => {
    if (!isVerified) return;
    onConfirm();
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        className="flex-1 justify-center"
        onPress={handleClose}
        style={{ paddingHorizontal: wp(24), backgroundColor: COLORS.modalOverlaySoft }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full items-center"
        >
          <Pressable
            className="w-full"
            onPress={(event) => event.stopPropagation()}
            style={{
              borderRadius: RADIUS.xl,
              padding: wp(24),
              gap: hp(24),
              backgroundColor: COLORS.backgroundSecondary,
            }}
          >
            <View className="items-center" style={{ gap: hp(12) }}>
              <View
                className="items-center justify-center"
                style={{
                  width: wp(64),
                  height: wp(64),
                  borderRadius: wp(32),
                  marginBottom: hp(4),
                  backgroundColor: COLORS.errorBackground,
                }}
              >
                <Ionicons name="warning" size={wp(32)} color={COLORS.error} />
              </View>

              <Text
                className="text-center"
                style={{
                  fontSize: fp(22),
                  fontFamily: FONTS.bold,
                  color: COLORS.textPrimary,
                }}
              >
                정말 탈퇴하시나요?
              </Text>

              <Text
                className="text-center"
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.medium,
                  color: COLORS.textSecondary,
                  lineHeight: fp(22),
                }}
              >
                계정을 삭제하면 모든 자산 정보, 거래 내역, 설정이 즉시 삭제되고
                복구할 수 없어요.
              </Text>
            </View>

            <View style={{ gap: hp(12) }}>
              <Text
                className="text-center"
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.medium,
                  color: COLORS.textPrimary,
                }}
              >
                등록된 번호 <Text style={{ fontFamily: FONTS.bold, color: COLORS.error }}>{maskedPhone}</Text>
                {'\n'}로 인증번호를 발송해 본인 확인을 진행합니다.
              </Text>

              <TouchableOpacity
                disabled={isSending}
                onPress={() => void handleSendCode()}
                className="items-center"
                style={{
                  paddingVertical: hp(14),
                  borderRadius: RADIUS.full,
                  backgroundColor: isSending ? COLORS.switchTrackFalse : COLORS.primary,
                }}
              >
                {isSending ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text
                    style={{
                      fontSize: fp(15),
                      fontFamily: FONTS.bold,
                      color: COLORS.white,
                    }}
                  >
                    {isCodeSent ? '인증번호 다시 발송' : '인증번호 발송'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {isCodeSent ? (
              <View style={{ gap: hp(12) }}>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isVerified}
                  placeholder="인증번호 6자리를 입력해 주세요"
                  placeholderTextColor={COLORS.textTertiary}
                  className="text-center"
                  style={{
                    backgroundColor: isVerified
                      ? COLORS.dangerBackground
                      : COLORS.noticeBoxBackground,
                    borderWidth: 1,
                    borderColor: isVerified ? COLORS.error : COLORS.border,
                    borderRadius: RADIUS.md,
                    paddingVertical: hp(14),
                    paddingHorizontal: wp(16),
                    fontSize: fp(16),
                    fontFamily: FONTS.semiBold,
                    color: COLORS.textPrimary,
                  }}
                />

                {isVerified ? (
                  <Text
                    className="text-center"
                    style={{
                      fontSize: fp(13),
                      fontFamily: FONTS.medium,
                      color: COLORS.success,
                      marginTop: hp(4),
                    }}
                  >
                    본인 확인이 완료되었습니다.
                  </Text>
                ) : (
                  <TouchableOpacity
                    disabled={code.length !== 6 || isVerifying}
                    onPress={() => void handleVerifyCode()}
                    className="items-center"
                    style={{
                      backgroundColor:
                        code.length !== 6 || isVerifying ? COLORS.switchTrackFalse : COLORS.error,
                      paddingVertical: hp(16),
                      borderRadius: RADIUS.full,
                    }}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text
                        style={{
                          fontSize: fp(16),
                          fontFamily: FONTS.bold,
                          color: COLORS.white,
                        }}
                      >
                        인증번호 확인
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <View className="flex-row" style={{ gap: wp(12) }}>
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 items-center"
                style={{
                  paddingVertical: hp(16),
                  borderRadius: RADIUS.full,
                  backgroundColor: COLORS.gray100,
                }}
              >
                <Text
                  style={{
                    fontSize: fp(16),
                    fontFamily: FONTS.bold,
                    color: COLORS.textPrimary,
                  }}
                >
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!isVerified}
                onPress={handleConfirm}
                className="flex-1 items-center"
                style={{
                  backgroundColor: isVerified ? COLORS.error : COLORS.switchTrackFalse,
                  paddingVertical: hp(16),
                  borderRadius: RADIUS.full,
                }}
              >
                <Text
                  style={{
                    fontSize: fp(16),
                    fontFamily: FONTS.bold,
                    color: COLORS.white,
                  }}
                >
                  탈퇴하기
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
