import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface FixedExpensePaymentDayStepperProps {
  paymentDay: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export default function FixedExpensePaymentDayStepper({
  paymentDay,
  onDecrease,
  onIncrease,
}: FixedExpensePaymentDayStepperProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.backgroundSecondary,
        paddingHorizontal: wp(14),
        paddingVertical: hp(10),
        marginBottom: hp(24),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.86}
        className="items-center justify-center"
        style={{
          width: wp(40),
          height: wp(40),
          borderRadius: wp(14),
          backgroundColor: COLORS.stepperButtonBackground,
        }}
        onPress={onDecrease}
      >
        <Text
          style={{
            fontSize: fp(24),
            fontFamily: FONTS.bold,
            color: COLORS.primary,
          }}
        >
          -
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          fontSize: fp(24),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
        }}
      >
        {paymentDay}
      </Text>
      <TouchableOpacity
        activeOpacity={0.86}
        className="items-center justify-center"
        style={{
          width: wp(40),
          height: wp(40),
          borderRadius: wp(14),
          backgroundColor: COLORS.stepperButtonBackground,
        }}
        onPress={onIncrease}
      >
        <Text
          style={{
            fontSize: fp(24),
            fontFamily: FONTS.bold,
            color: COLORS.primary,
          }}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}
