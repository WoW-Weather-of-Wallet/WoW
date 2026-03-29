import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

type DataSourceNoticeType = 'mock' | 'mixed';

interface DataSourceNoticeProps {
  type: DataSourceNoticeType;
  description: string;
  style?: ViewStyle;
}

const NOTICE_META: Record<
  DataSourceNoticeType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    badgeLabel: string;
    title: string;
    backgroundColor: string;
    borderColor: string;
    badgeColor: string;
  }
> = {
  mock: {
    icon: 'flask-outline',
    badgeLabel: '안내',
    title: '일부 정보는 준비된 예시 데이터로 보여드리고 있어요.',
    backgroundColor: '#FFF7E8',
    borderColor: '#F4D38A',
    badgeColor: '#8A5A00',
  },
  mixed: {
    icon: 'layers-outline',
    badgeLabel: '참고',
    title: '실시간 정보와 준비된 데이터가 함께 표시되고 있어요.',
    backgroundColor: '#EEF5FF',
    borderColor: '#BBD1F8',
    badgeColor: '#2F5FA8',
  },
};

export default function DataSourceNotice({
  type,
  description,
  style,
}: DataSourceNoticeProps) {
  const meta = NOTICE_META[type];

  return (
    <View
      style={[
        {
          borderWidth: 1,
          borderRadius: RADIUS.xl,
          paddingHorizontal: wp(14),
          paddingVertical: hp(12),
          backgroundColor: meta.backgroundColor,
          borderColor: meta.borderColor,
        },
        style,
      ]}
    >
      <View className="flex-row items-start" style={{ gap: wp(10) }}>
        <View
          className="items-center justify-center"
          style={{
            width: wp(24),
            height: wp(24),
            borderRadius: wp(12),
            backgroundColor: meta.badgeColor,
            marginTop: hp(2),
          }}
        >
          <Ionicons name={meta.icon} size={wp(13)} color={COLORS.white} />
        </View>
        <View className="flex-1" style={{ gap: hp(4) }}>
          <View className="flex-row items-center justify-between" style={{ gap: wp(8) }}>
            <Text
              style={{
                flex: 1,
                fontSize: fp(13),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
              }}
            >
              {meta.title}
            </Text>
            <View
              style={{
                borderRadius: RADIUS.full,
                paddingHorizontal: wp(8),
                paddingVertical: hp(4),
                backgroundColor: meta.badgeColor,
              }}
            >
              <Text
                style={{
                  fontSize: fp(10),
                  fontFamily: FONTS.bold,
                  color: COLORS.white,
                }}
              >
                {meta.badgeLabel}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: fp(12),
              fontFamily: FONTS.regular,
              color: COLORS.textSecondary,
              lineHeight: fp(18),
            }}
          >
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}
