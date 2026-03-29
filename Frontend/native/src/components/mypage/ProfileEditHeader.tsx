import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

interface ProfileEditHeaderProps {
  name: string;
  onEditPress?: () => void;
}

export default function ProfileEditHeader({ name, onEditPress }: ProfileEditHeaderProps) {
  return (
    <View
      className="items-center"
      style={{ paddingVertical: hp(24), backgroundColor: COLORS.background }}
    >
      <View style={{ position: 'relative', marginBottom: hp(16) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(86),
            height: wp(86),
            borderRadius: wp(43),
            backgroundColor: COLORS.primary50,
          }}
        >
          <Text
            style={{
              fontSize: fp(34),
              fontFamily: FONTS.bold,
              color: COLORS.primary,
            }}
          >
            {name.slice(0, 1)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEditPress}
          className="items-center justify-center"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: wp(28),
            height: wp(28),
            borderRadius: wp(14),
            borderWidth: 2,
            borderColor: COLORS.white,
            backgroundColor: COLORS.primary,
          }}
        >
          <Ionicons name="camera" size={wp(14)} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontSize: fp(20),
          fontFamily: FONTS.bold,
          color: COLORS.textPrimary,
          marginBottom: hp(4),
        }}
      >
        {name}님
      </Text>

      <Text
        className="text-center"
        style={{
          fontSize: fp(13),
          fontFamily: FONTS.medium,
          color: COLORS.textTertiary,
        }}
      >
        개인정보와 서비스 설정을 관리해요
      </Text>
    </View>
  );
}
