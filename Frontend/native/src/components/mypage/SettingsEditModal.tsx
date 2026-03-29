import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';
import { validatePassword } from '../../utils/validation';

type EditMode = 'profile' | 'password' | null;

interface SettingsEditModalProps {
  visible: boolean;
  editMode: EditMode;
  isSubmitting: boolean;
  name: string;
  gender: string;
  birthDate: string;
  currentPw: string;
  newPw: string;
  confirmPw: string;
  userId?: string | null;
  isCurrentPwVisible: boolean;
  isNewPwVisible: boolean;
  isConfirmPwVisible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChangeCurrentPw: (value: string) => void;
  onChangeNewPw: (value: string) => void;
  onChangeConfirmPw: (value: string) => void;
  onToggleCurrentPwVisible: () => void;
  onToggleNewPwVisible: () => void;
  onToggleConfirmPwVisible: () => void;
}

export default function SettingsEditModal({
  visible,
  editMode,
  isSubmitting,
  name,
  gender,
  birthDate,
  currentPw,
  newPw,
  confirmPw,
  userId,
  isCurrentPwVisible,
  isNewPwVisible,
  isConfirmPwVisible,
  onClose,
  onSubmit,
  onChangeCurrentPw,
  onChangeNewPw,
  onChangeConfirmPw,
  onToggleCurrentPwVisible,
  onToggleNewPwVisible,
  onToggleConfirmPwVisible,
}: SettingsEditModalProps) {
  const passwordValidation = validatePassword(newPw, userId || undefined);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center"
        style={{ paddingHorizontal: wp(20), backgroundColor: COLORS.modalOverlaySoft }}
        onPress={onClose}
      >
        <Pressable
          style={{
            borderRadius: RADIUS.xl,
            padding: wp(20),
            gap: hp(12),
            backgroundColor: COLORS.backgroundSecondary,
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              marginBottom: hp(4),
            }}
          >
            {editMode === 'profile' ? '프로필 정보 확인' : '비밀번호 변경'}
          </Text>

          {editMode === 'profile' ? (
            <>
              <InfoRow label="이름" value={name} />
              <InfoRow label="성별" value={gender === 'M' ? '남성' : gender === 'F' ? '여성' : '-'} />
              <InfoRow label="생년월일" value={birthDate} />
              <Text
                style={{
                  fontSize: fp(12),
                  fontFamily: FONTS.medium,
                  color: COLORS.textTertiary,
                  marginTop: hp(4),
                  paddingHorizontal: wp(4),
                }}
              >
                * 프로필 정보는 가입 시 본인인증 기준이라 앱에서 직접 수정할 수 없어요.
              </Text>
            </>
          ) : null}

          {editMode === 'password' ? (
            <>
              <PasswordField
                value={currentPw}
                onChangeText={onChangeCurrentPw}
                placeholder="현재 비밀번호"
                visible={isCurrentPwVisible}
                onToggleVisible={onToggleCurrentPwVisible}
              />

              <PasswordField
                value={newPw}
                onChangeText={onChangeNewPw}
                placeholder="새 비밀번호 (8~20자 영문/숫자/특수문자)"
                visible={isNewPwVisible}
                onToggleVisible={onToggleNewPwVisible}
              />

              {newPw.length > 0 ? (
                <Text
                  style={{
                    fontSize: fp(12),
                    fontFamily: FONTS.medium,
                    color: passwordValidation.isValid ? COLORS.success : COLORS.error,
                    marginTop: 0,
                    marginBottom: hp(8),
                  }}
                >
                  * {passwordValidation.message}
                </Text>
              ) : null}

              <PasswordField
                value={confirmPw}
                onChangeText={onChangeConfirmPw}
                placeholder="새 비밀번호 확인"
                visible={isConfirmPwVisible}
                onToggleVisible={onToggleConfirmPwVisible}
              />
            </>
          ) : null}

          <View className="flex-row justify-end" style={{ gap: wp(10), marginTop: hp(8) }}>
            <TouchableOpacity
              onPress={onClose}
              className="items-center justify-center"
              style={{
                paddingHorizontal: wp(14),
                paddingVertical: hp(10),
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.gray200,
              }}
            >
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textPrimary,
                }}
              >
                취소
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              className="items-center justify-center"
              style={{
                paddingHorizontal: wp(14),
                paddingVertical: hp(10),
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.primary,
              }}
            >
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textInverse,
                }}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        borderRadius: RADIUS.md,
        paddingHorizontal: wp(14),
        paddingVertical: hp(12),
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: hp(4),
        backgroundColor: COLORS.primary50,
      }}
    >
      <Text
        style={{
          fontSize: fp(14),
          fontFamily: FONTS.semiBold,
          color: COLORS.textTertiary,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: fp(15),
          fontFamily: FONTS.medium,
          color: COLORS.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function PasswordField({
  value,
  onChangeText,
  placeholder,
  visible,
  onToggleVisible,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <View className="relative flex-row items-center">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        secureTextEntry={!visible}
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: RADIUS.md,
          paddingHorizontal: wp(14),
          paddingVertical: hp(12),
          fontSize: fp(15),
          fontFamily: FONTS.medium,
          color: COLORS.textPrimary,
          backgroundColor: COLORS.background,
        }}
      />
      <TouchableOpacity
        onPress={onToggleVisible}
        style={{ position: 'absolute', right: wp(12), padding: wp(4) }}
      >
        <Ionicons
          name={visible ? 'eye-outline' : 'eye-off-outline'}
          size={wp(22)}
          color={COLORS.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}
