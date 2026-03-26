import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPageProfileInfoModalProps {
  visible: boolean;
  name: string;
  gender: string;
  birthDate: string;
  onClose: () => void;
}

export default function MyPageProfileInfoModal({
  visible,
  name,
  gender,
  birthDate,
  onClose,
}: MyPageProfileInfoModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center bg-[rgba(15,23,42,0.45)]"
        style={{ paddingHorizontal: wp(20) }}
        onPress={onClose}
      >
        <View
          className="bg-[#F8FAFC]"
          style={{
            borderRadius: RADIUS.xl,
            padding: wp(20),
            gap: hp(12),
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
            프로필 정보
          </Text>

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
            * 가입 시 본인인증으로 확인한 정보입니다.
          </Text>

          <View className="flex-row justify-end" style={{ gap: wp(10), marginTop: hp(8) }}>
            <TouchableOpacity
              onPress={onClose}
              className="items-center justify-center bg-[#4D74FF]"
              style={{
                flex: 1,
                paddingVertical: hp(14),
                borderRadius: RADIUS.md,
              }}
            >
              <Text
                style={{
                  fontSize: fp(15),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textInverse,
                }}
              >
                닫기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-row items-center justify-between bg-[#EEF2F7]"
      style={{
        borderRadius: RADIUS.md,
        paddingHorizontal: wp(14),
        paddingVertical: hp(12),
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: hp(4),
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
