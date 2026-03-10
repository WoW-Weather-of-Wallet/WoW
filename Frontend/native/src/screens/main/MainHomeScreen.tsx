import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  mockHomeInsights,
  mockHomeSummary,
  mockScheduleItems,
  mockSpendingCategories,
} from '../../mock/dashboard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

/**
 * MainHomeScreen
 * 앱에 들어오자마자 가장 먼저 확인하는 요약 대시보드입니다.
 * 현재는 목 데이터로 구성했지만, 카드 단위로 API 응답을 교체하기 쉽게
 * 섹션을 명확히 분리해 두었습니다.
 */
export default function MainHomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: insets.bottom + hp(130),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 환영 영역: 이름/이번 달 예산 요약을 한 번에 보여줍니다. */}
        <LinearGradient
          colors={['#FAFBFF', '#EEF1FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={styles.eyebrowText}>{mockHomeSummary.monthLabel} 소비 리포트</Text>
              <Text style={styles.heroTitle}>
                {mockHomeSummary.userName}님,{"\n"}이번 달 흐름은 안정적이에요.
              </Text>
            </View>
            <View style={styles.badgeChip}>
              <Ionicons name="sparkles-outline" size={wp(14)} color={COLORS.primary} />
              <Text style={styles.badgeChipText}>AI 요약</Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>남은 예산</Text>
              <Text style={styles.amountValue}>
                {mockHomeSummary.remainingBudget.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.usageChip}>
              <Text style={styles.usageChipText}>{mockHomeSummary.budgetUsageRate}% 사용</Text>
            </View>
          </View>

          {/* 예산 사용량 바: API 연결 전에도 화면 밸런스를 확인하기 좋습니다. */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${mockHomeSummary.budgetUsageRate}%` },
              ]}
            />
          </View>

          <View style={styles.heroFooterRow}>
            <Text style={styles.heroHelperText}>
              누적 지출 {mockHomeSummary.spentAmount.toLocaleString()}원 / 총 예산{' '}
              {mockHomeSummary.totalBudget.toLocaleString()}원
            </Text>
            <Text style={styles.heroForecastText}>{mockHomeSummary.forecastText}</Text>
          </View>
        </LinearGradient>

        {/* 핵심 인사이트 카드: 메인에서 가장 먼저 확인할 숫자만 추립니다. */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>이번 주 핵심 포인트</Text>
            <Text style={styles.sectionAction}>업데이트됨</Text>
          </View>

          {mockHomeInsights.map((item) => {
            const toneStyle =
              item.tone === 'positive'
                ? styles.positiveTone
                : item.tone === 'warning'
                  ? styles.warningTone
                  : styles.neutralTone;

            return (
              <View key={item.id} style={styles.infoCard}>
                <View style={styles.infoCardTopRow}>
                  <Text style={styles.infoCardLabel}>{item.label}</Text>
                  <View style={[styles.toneDot, toneStyle]} />
                </View>
                <Text style={styles.infoCardValue}>{item.value}</Text>
                <Text style={styles.infoCardChange}>{item.changeText}</Text>
              </View>
            );
          })}
        </View>

        {/* 카테고리 소비 현황: 향후 shared 타입과 백엔드 응답을 연결할 후보 영역입니다. */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>카테고리별 소비</Text>
            <Text style={styles.sectionAction}>더보기</Text>
          </View>

          {mockSpendingCategories.map((category) => (
            <View key={category.id} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <View style={[styles.iconBadge, { backgroundColor: `${category.color}18` }]}>
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={wp(18)}
                    color={category.color}
                  />
                </View>
                <View style={styles.categoryTextBlock}>
                  <Text style={styles.categoryTitle}>{category.label}</Text>
                  <Text style={styles.categoryAmount}>{category.amount.toLocaleString()}원</Text>
                </View>
              </View>

              <View style={styles.categoryBarTrack}>
                <View
                  style={[
                    styles.categoryBarFill,
                    {
                      width: `${Math.round(category.ratio * 100)}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 결제 예정/완료 섹션: 나중에 고정 지출 API와 연결하기 좋은 자리입니다. */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>다가오는 결제 일정</Text>
            <Text style={styles.sectionAction}>3건</Text>
          </View>

          {mockScheduleItems.map((item) => (
            <View key={item.id} style={styles.scheduleCard}>
              <View style={styles.scheduleTextBlock}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleSubtitle}>{item.dueLabel}</Text>
              </View>
              <View style={styles.scheduleAmountBlock}>
                <Text style={styles.scheduleAmount}>{item.amount}</Text>
                <Text
                  style={[
                    styles.scheduleStatus,
                    item.status === 'paid' ? styles.schedulePaid : styles.scheduleUpcoming,
                  ]}
                >
                  {item.status === 'paid' ? '완료' : '예정'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  contentContainer: {
    paddingHorizontal: wp(20),
    gap: hp(18),
  },
  heroCard: {
    borderRadius: RADIUS.xxl,
    padding: wp(22),
    borderWidth: 1,
    borderColor: '#E7EAFA',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: hp(18),
  },
  eyebrowText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  heroTitle: {
    fontSize: fp(27),
    lineHeight: fp(35),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    backgroundColor: '#FFFFFFCC',
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  },
  badgeChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(14),
  },
  amountLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  },
  amountValue: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  usageChip: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(12),
    paddingVertical: hp(8),
  },
  usageChipText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.textInverse,
  },
  progressTrack: {
    width: '100%',
    height: hp(10),
    borderRadius: RADIUS.full,
    backgroundColor: '#DDE2FF',
    overflow: 'hidden',
    marginBottom: hp(14),
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  heroFooterRow: {
    gap: hp(8),
  },
  heroHelperText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  heroForecastText: {
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  sectionContainer: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(18),
    gap: hp(14),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    padding: wp(16),
  },
  infoCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(10),
  },
  infoCardLabel: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  toneDot: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
  },
  positiveTone: {
    backgroundColor: COLORS.success,
  },
  neutralTone: {
    backgroundColor: COLORS.primary,
  },
  warningTone: {
    backgroundColor: COLORS.warning,
  },
  infoCardValue: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  infoCardChange: {
    fontSize: fp(13),
    lineHeight: fp(19),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  categoryRow: {
    gap: hp(10),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  iconBadge: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextBlock: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  categoryAmount: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  categoryBarTrack: {
    width: '100%',
    height: hp(8),
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(4),
  },
  scheduleTextBlock: {
    flex: 1,
    paddingRight: wp(12),
  },
  scheduleTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  scheduleSubtitle: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  scheduleAmountBlock: {
    alignItems: 'flex-end',
    gap: hp(4),
  },
  scheduleAmount: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  scheduleStatus: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
  },
  scheduleUpcoming: {
    color: COLORS.warning,
  },
  schedulePaid: {
    color: COLORS.success,
  },
});
