import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SurfaceCard from '../common/SurfaceCard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

interface HomeSpendingTypeCardProps {
  onPress: () => void;
}

/**
 * 메인 홈 상단의 AI 소비 유형 요약 카드입니다.
 * 사용자가 카드를 누르면 상세 분석 바텀시트가 열립니다.
 */
export default function HomeSpendingTypeCard({ onPress }: HomeSpendingTypeCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.94} onPress={onPress}>
      <SurfaceCard>
        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <Text style={styles.eyebrow}>AI 소비 유형 분석</Text>
            <View style={styles.titleRow}>
              <View style={styles.iconBadge}>
                <Ionicons
                  name="restaurant-outline"
                  size={wp(18)}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.mainTitle}>미식 탐험가형</Text>
            </View>
          </View>
          <View style={styles.aiBadge}>
            <Ionicons
              name="sparkles-outline"
              size={wp(14)}
              color={COLORS.primary}
            />
            <Text style={styles.aiBadgeText}>AI 리포트</Text>
          </View>
        </View>

        <Text style={styles.description}>
          식비 비중이 가장 높고 새로운 맛과 경험에 적극적으로 투자하는 소비
          패턴이에요.
        </Text>
      </SurfaceCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  flex1: { flex: 1 },
  eyebrow: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: wp(10) },
  iconBadge: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFEEFF',
  },
  mainTitle: {
    fontSize: fp(24),
    lineHeight: fp(31),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    alignSelf: 'flex-start',
    backgroundColor: '#EFEEFF',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(7),
  },
  aiBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  description: {
    marginTop: hp(14),
    fontSize: fp(14),
    lineHeight: fp(22),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
