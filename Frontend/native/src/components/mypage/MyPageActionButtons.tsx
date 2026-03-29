import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPageActionButtonsProps {
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function MyPageActionButtons({
  onLogout,
  onDeleteAccount,
}: MyPageActionButtonsProps) {
  return (
    <>
      <TouchableOpacity
        onPress={onLogout}
        className="flex-row items-center justify-between"
        style={{
          borderRadius: RADIUS.md,
          paddingHorizontal: wp(14),
          paddingVertical: hp(12),
          borderWidth: 1,
          borderColor: COLORS.border,
          backgroundColor: COLORS.gray50,
        }}
      >
        <Text
          style={{
            fontSize: fp(14),
            fontFamily: FONTS.semiBold,
            color: COLORS.textPrimary,
          }}
        >
          로그아웃
        </Text>
        <Ionicons name="log-out-outline" size={wp(20)} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDeleteAccount}
        className="flex-row items-center justify-between"
        style={{
          marginTop: hp(10),
          borderRadius: RADIUS.md,
          paddingHorizontal: wp(14),
          paddingVertical: hp(12),
          borderWidth: 1,
          borderColor: `${COLORS.error}30`,
          backgroundColor: COLORS.gray50,
        }}
      >
        <Text
          style={{
            fontSize: fp(14),
            fontFamily: FONTS.semiBold,
            color: COLORS.error,
          }}
        >
          회원 탈퇴
        </Text>
        <Ionicons name="exit-outline" size={wp(20)} color={COLORS.error} />
      </TouchableOpacity>
    </>
  );
}
