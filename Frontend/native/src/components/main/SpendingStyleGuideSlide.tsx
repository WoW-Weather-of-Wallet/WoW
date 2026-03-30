import React from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import type { SpendingStyle } from '../../constants/main/spendingStyle';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

type SpendingStyleGuideSlideProps = {
  styleItem: SpendingStyle;
};

const CARD_WIDTH = Dimensions.get('window').width - wp(40);

export default function SpendingStyleGuideSlide({
  styleItem,
}: SpendingStyleGuideSlideProps) {
  const iconWrapStyle = {
    width: wp(110),
    height: wp(110),
    borderRadius: RADIUS.xl,
    backgroundColor: `${styleItem.color}15`,
    marginBottom: hp(24),
    overflow: 'hidden' as const,
  } as const;

  const titleStyle = {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(12),
  } as const;

  const descriptionStyle = {
    width: '100%' as const,
    paddingHorizontal: wp(10),
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    lineHeight: fp(24),
  } as const;

  const tagContainerStyle = {
    gap: hp(8),
  } as const;

  const tagRowStyle = {
    gap: wp(8),
  } as const;

  const tagBadgeStyle = {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
  } as const;

  const tagTextStyle = {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
  } as const;

  return (
    <View
      className="items-center"
      style={{ width: CARD_WIDTH, paddingHorizontal: wp(24), paddingBottom: hp(12) }}
    >
      <View className="items-center justify-center" style={iconWrapStyle}>
        {styleItem.imageSource ? (
          <Image
            source={styleItem.imageSource}
            resizeMode="contain"
            style={{
              width: wp(92),
              height: wp(92),
            }}
          />
        ) : (
          <>
            {styleItem.iconType === 'MaterialCommunityIcons' ? (
              <MaterialCommunityIcons
                name={styleItem.iconName as never}
                size={wp(64)}
                color={styleItem.color}
              />
            ) : (
              <Ionicons
                name={styleItem.iconName as never}
                size={wp(64)}
                color={styleItem.color}
              />
            )}
          </>
        )}
      </View>

      <Text className="text-center" style={titleStyle}>
        {styleItem.title}
      </Text>

      {styleItem.description ? (
        <Text style={descriptionStyle}>{styleItem.description}</Text>
      ) : (
        <View className="w-full items-center" style={tagContainerStyle}>
          <View className="flex-row justify-center" style={tagRowStyle}>
            {styleItem.hashtags?.slice(0, 2).map((tag, idx) => (
              <View key={`${styleItem.id}-${idx}`} style={tagBadgeStyle}>
                <Text style={[tagTextStyle, { color: styleItem.color }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-center" style={tagRowStyle}>
            {styleItem.hashtags?.slice(2, 3).map((tag, idx) => (
              <View key={`${styleItem.id}-tail-${idx}`} style={tagBadgeStyle}>
                <Text style={[tagTextStyle, { color: styleItem.color }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
