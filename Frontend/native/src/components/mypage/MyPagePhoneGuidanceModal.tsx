import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPagePhoneGuidanceModalProps {
  visible: boolean;
  phoneNumber: string;
  onClose: () => void;
  onStartVerification: () => void;
}

export default function MyPagePhoneGuidanceModal({
  visible,
  phoneNumber,
  onClose,
  onStartVerification,
}: MyPagePhoneGuidanceModalProps) {
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
            휴대폰 번호 변경
          </Text>

          <Text
            style={{
              fontSize: fp(13),
              lineHeight: fp(20),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
              marginBottom: hp(2),
            }}
          >
            현재 등록된 번호를 확인한 뒤, 새 휴대폰 번호로 바로 변경을 진행해 주세요.
          </Text>

          <View
            className="flex-row items-center justify-between"
            style={{
              borderRadius: RADIUS.md,
              paddingHorizontal: wp(14),
              paddingVertical: hp(12),
              borderWidth: 1,
              borderColor: COLORS.border,
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
              현재 번호
            </Text>
            <Text
              style={{
                fontSize: fp(15),
                fontFamily: FONTS.medium,
                color: COLORS.textPrimary,
              }}
            >
              {phoneNumber}
            </Text>
          </View>

          <View
            style={{
              marginTop: hp(12),
              padding: wp(12),
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: `${COLORS.primary}30`,
              backgroundColor: COLORS.primarySoft,
            }}
          >
            <Text
              style={{
                fontSize: fp(13),
                lineHeight: fp(20),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
                textAlign: 'left',
              }}
            >
              새 휴대폰 번호로 인증을 진행하면 번호를 바로 변경할 수 있어요.
            </Text>
            <Text
              style={{
                fontSize: fp(12),
                fontFamily: FONTS.medium,
                color: COLORS.textTertiary,
                marginTop: hp(8),
                paddingHorizontal: wp(4),
                textAlign: 'left',
              }}
            >
              이름, 생년월일, 성별 정보는 가입 시 본인인증 기준으로 고정됩니다.
            </Text>
          </View>

          <View className="flex-row justify-end" style={{ gap: wp(10), marginTop: hp(8) }}>
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
              onPress={onStartVerification}
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
                휴대폰 번호 변경
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
