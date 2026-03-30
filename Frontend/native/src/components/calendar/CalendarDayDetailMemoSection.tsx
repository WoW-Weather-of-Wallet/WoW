import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface CalendarDayDetailMemoSectionProps {
  memoValue: string;
  onChangeMemo: (value: string) => void;
  onSaveMemo: () => void;
}

export default function CalendarDayDetailMemoSection({
  memoValue,
  onChangeMemo,
  onSaveMemo,
}: CalendarDayDetailMemoSectionProps) {
  return (
    <>
      <View style={{ marginBottom: hp(18) }}>
        <Text
          style={{
            fontSize: fp(16),
            fontFamily: FONTS.bold,
            color: COLORS.textPrimary,
            marginBottom: hp(6),
          }}
        >
          {'\uD558\uB8E8 \uBA54\uBAA8'}
        </Text>
        <Text
          style={{
            marginBottom: hp(10),
            fontSize: fp(12),
            fontFamily: FONTS.medium,
            color: COLORS.textSecondary,
            lineHeight: fp(18),
          }}
        >
          {
            '\uD558\uB8E8 \uC9C0\uCD9C\uC744 \uBCF4\uBA70 \uB290\uB080 \uC810\uC774\uB098 \uB2E4\uC74C\uC5D0 \uAE30\uC5B5\uD560 \uB0B4\uC6A9\uC744 \uAE30\uB85D\uD574 \uBCF4\uC138\uC694.'
          }
        </Text>
        <TextInput
          value={memoValue}
          onChangeText={onChangeMemo}
          placeholder={
            '\uC624\uB298\uC758 \uC9C0\uCD9C\uC5D0 \uB300\uD55C \uBA54\uBAA8\uB97C \uC790\uC720\uB86D\uAC8C \uC801\uC5B4\uBCF4\uC138\uC694.'
          }
          placeholderTextColor={COLORS.textTertiary}
          className="text-left"
          style={{
            minHeight: hp(108),
            borderRadius: RADIUS.xl,
            borderWidth: 1,
            borderColor: COLORS.border,
            backgroundColor: COLORS.background,
            paddingHorizontal: wp(16),
            paddingVertical: hp(14),
            fontSize: fp(15),
            fontFamily: FONTS.medium,
            color: COLORS.textPrimary,
          }}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        className="items-center justify-center"
        style={{
          borderRadius: RADIUS.xl,
          backgroundColor: COLORS.primary,
          paddingVertical: hp(16),
        }}
        onPress={onSaveMemo}
      >
        <Text
          style={{
            fontSize: fp(16),
            fontFamily: FONTS.bold,
            color: COLORS.textInverse,
          }}
        >
          {'\uBA54\uBAA8 \uC800\uC7A5'}
        </Text>
      </TouchableOpacity>
    </>
  );
}
