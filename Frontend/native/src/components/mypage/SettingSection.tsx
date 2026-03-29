import React from 'react';
import { Text, View } from 'react-native';
import { COLORS, fp, hp, wp } from '../../constants/theme';

interface SettingSectionProps {
  title?: string;
  children: React.ReactNode;
}

/**
 * 설정 항목들을 논리적인 그룹으로 묶어주는 섹션 컴포넌트입니다.
 */
export default function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View>
      {title ? (
        <Text
          className="font-sans-bold uppercase text-text-tertiary"
          style={{ fontSize: fp(15), marginLeft: wp(18), marginBottom: hp(10) }}
        >
          {title}
        </Text>
      ) : null}
      <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.separatorBorder }}>
        {children}
      </View>
    </View>
  );
}
