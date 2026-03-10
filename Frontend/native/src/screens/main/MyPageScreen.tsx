import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientButton from '../../components/common/GradientButton';
import {
  mockProfileStats,
  mockUserProfile,
  mockUserShortcuts,
} from '../../mock/dashboard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';

/**
 * MyPageScreen
 * 사용자 정보와 설정 진입점을 모아 둔 화면입니다.
 * 설정/계좌/보안 같은 하위 메뉴를 API와 무관하게 먼저 정리해 두면
 * 실제 연결 시 화면 구조를 거의 건드리지 않고 기능만 덧붙일 수 있습니다.
 */
export default function MyPageScreen() {
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
        {/* 프로필 카드: 사용자 식별 정보와 온보딩 상태를 함께 보여줍니다. */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{mockUserProfile.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.profileTextBlock}>
              <Text style={styles.profileName}>{mockUserProfile.name}</Text>
              <Text style={styles.profileEmail}>{mockUserProfile.email}</Text>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>{mockUserProfile.badge}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileSummaryRow}>
            <View style={styles.profileSummaryItem}>
              <Text style={styles.profileSummaryLabel}>연결 계좌</Text>
              <Text style={styles.profileSummaryValue}>{mockUserProfile.linkedAccounts}개</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileSummaryItem}>
              <Text style={styles.profileSummaryLabel}>온보딩</Text>
              <Text style={styles.profileSummaryValue}>
                {mockUserProfile.onboardingCompleted ? '완료' : '진행 중'}
              </Text>
            </View>
          </View>
        </View>

        {/* 요약 수치 카드: 마이페이지 상단에서 빠르게 내 상태를 읽을 수 있게 합니다. */}
        <View style={styles.statsRow}>
          {mockProfileStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 빠른 설정 메뉴: 실제 기능 연결 전까지는 버튼 클릭 로그만 남겨도 충분합니다. */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>자주 쓰는 메뉴</Text>
            <Text style={styles.sectionAction}>설정</Text>
          </View>

          {mockUserShortcuts.map((shortcut) => (
            <TouchableOpacity
              key={shortcut.id}
              style={styles.shortcutRow}
              activeOpacity={0.8}
              onPress={() => {
                // 화면만 먼저 완성하는 단계이므로 추후 navigation/API 연결 지점을 로그로 남깁니다.
                console.log(`${shortcut.id} 메뉴 이동 예정`);
              }}
            >
              <View style={styles.shortcutLeft}>
                <View style={styles.shortcutIconCircle}>
                  <Ionicons
                    name={shortcut.icon as keyof typeof Ionicons.glyphMap}
                    size={wp(20)}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.shortcutTextBlock}>
                  <Text style={styles.shortcutTitle}>{shortcut.title}</Text>
                  <Text style={styles.shortcutDescription}>{shortcut.description}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={wp(18)} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 하단 액션: 나중에 로그아웃/프로필 편집/문의 연결로 치환 가능한 자리입니다. */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>계정 액션</Text>
          <View style={styles.actionButtonSpacing}>
            <GradientButton
              title="프로필 수정"
              onPress={() => console.log('프로필 수정 연결 예정')}
            />
          </View>
          <GradientButton
            title="로그아웃"
            variant="outline"
            onPress={() => console.log('로그아웃 연결 예정')}
          />
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
  profileCard: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xxl,
    padding: wp(20),
    gap: hp(18),
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: wp(68),
    height: wp(68),
    borderRadius: wp(34),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(16),
  },
  avatarText: {
    fontSize: fp(28),
    fontFamily: FONTS.bold,
    color: COLORS.textInverse,
  },
  profileTextBlock: {
    flex: 1,
  },
  profileName: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  profileEmail: {
    fontSize: fp(13),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(10),
  },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary50,
    borderRadius: RADIUS.full,
    paddingHorizontal: wp(10),
    paddingVertical: hp(6),
  },
  profileBadgeText: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingVertical: hp(14),
    paddingHorizontal: wp(18),
  },
  profileSummaryItem: {
    flex: 1,
  },
  profileSummaryLabel: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: hp(6),
  },
  profileSummaryValue: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  profileDivider: {
    width: 1,
    height: hp(34),
    backgroundColor: COLORS.border,
    marginHorizontal: wp(16),
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(10),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingVertical: hp(18),
    paddingHorizontal: wp(14),
  },
  statValue: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(6),
  },
  statLabel: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  sectionCard: {
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
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(6),
  },
  shortcutLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: wp(12),
  },
  shortcutIconCircle: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(22),
    backgroundColor: COLORS.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  shortcutTextBlock: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: fp(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  shortcutDescription: {
    fontSize: fp(12),
    lineHeight: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  actionButtonSpacing: {
    marginBottom: hp(10),
  },
});
