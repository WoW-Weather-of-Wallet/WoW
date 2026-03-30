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

interface MyPagePasswordModalProps {
  visible: boolean;
  isSubmitting: boolean;
  currentPw: string;
  newPw: string;
  confirmPw: string;
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

export default function MyPagePasswordModal({
  visible,
  isSubmitting,
  currentPw,
  newPw,
  confirmPw,
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
}: MyPagePasswordModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center"
        style={{ paddingHorizontal: wp(20), backgroundColor: COLORS.modalOverlaySoft }}
        onPress={onClose}
      >
        <View
          style={{
            borderRadius: RADIUS.xl,
            padding: wp(20),
            gap: hp(12),
            backgroundColor: COLORS.backgroundSecondary,
          }}
        >
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              marginBottom: hp(6),
            }}
          >
            비밀번호 변경
          </Text>

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
            placeholder="새 비밀번호 (8자 이상)"
            visible={isNewPwVisible}
            onToggleVisible={onToggleNewPwVisible}
          />

          <PasswordField
            value={confirmPw}
            onChangeText={onChangeConfirmPw}
            placeholder="새 비밀번호 확인"
            visible={isConfirmPwVisible}
            onToggleVisible={onToggleConfirmPwVisible}
          />

          <View className="flex-row justify-end" style={{ gap: wp(8), marginTop: hp(8) }}>
            <TouchableOpacity
              onPress={onClose}
              className="items-center justify-center"
              style={{
                flex: 1,
                paddingVertical: hp(14),
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.gray200,
              }}
            >
              <Text
                style={{
                  fontSize: fp(15),
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
                flex: 1,
                paddingVertical: hp(14),
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.primary,
              }}
            >
              <Text
                style={{
                  fontSize: fp(15),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textInverse,
                }}
              >
                {isSubmitting ? '변경 중...' : '변경하기'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
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
          size={wp(20)}
          color={COLORS.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}
