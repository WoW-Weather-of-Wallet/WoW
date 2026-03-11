import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

/**
 * CalendarScreen
 * 캘린더 화면이 아직 본격 구현 전이라, 탭 이동과 레이아웃 밸런스를 먼저 확인할 수 있는
 * 임시 플레이스홀더 화면으로 둡니다.
 * 이후 실제 일정/지출 달력 화면이 들어오면 이 파일을 그대로 교체하면 됩니다.
 */
export default function CalendarScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundSecondary} />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(16),
            paddingBottom: insets.bottom + hp(120),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrowText}>캘린더</Text>
          <Text style={styles.heroTitle}>월별 일정과 지출 흐름을{"\n"}여기서 정리할 예정이에요.</Text>
          <Text style={styles.heroDescription}>
            현재는 탭 구조와 하단 네비게이션 비율을 먼저 확인하기 위한 임시 화면입니다.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>준비 중인 영역</Text>
            <Ionicons name="calendar-outline" size={wp(18)} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionBody}>
            일간/주간/월간 탭, 고정 지출 일정, 소비 예보 카드가 이 화면에 들어올 예정입니다.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>예상 구성</Text>
            <Ionicons name="layers-outline" size={wp(18)} color={COLORS.primary} />
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>상단 기간 선택</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>캘린더 본문</Text>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>고정 지출 / 예보 요약</Text>
          </View>
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
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(22),
    borderWidth: 1,
    borderColor: '#E7EAFA',
  },
  eyebrowText: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: hp(8),
  },
  heroTitle: {
    fontSize: fp(26),
    lineHeight: fp(34),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(10),
  },
  heroDescription: {
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(18),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(12),
  },
  sectionTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sectionBody: {
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(10),
  },
  bulletDot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: COLORS.primary,
    marginRight: wp(10),
  },
  bulletText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
});
