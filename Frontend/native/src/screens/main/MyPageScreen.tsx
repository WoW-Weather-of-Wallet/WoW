import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientButton from '../../components/common/GradientButton';
import {
  mockMyAccounts,
  mockMyCards,
  mockProfileStats,
  mockUserShortcuts,
} from '../../mock/dashboard';
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import {
  getProfile,
  logout as logoutRequest,
  type NativeUserProfileResponse,
} from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

/**
 * MyPageScreen
 * 마이페이지는 설정 메뉴보다 사용자의 실자산(카드/계좌)을 먼저 보여주는 방향으로 재구성합니다.
 * 추후 상세 화면이 생기면 각 카드/계좌 항목을 눌렀을 때 이동시키는 방식으로 확장할 수 있습니다.
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  const sessionUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<NativeUserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);

    try {
      const response = await getProfile();
      setProfile(response);
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '내 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
      );

      setProfile(null);
      Alert.alert('프로필 조회 실패', message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const displayName = profile?.name ?? sessionUser?.name ?? '사용자';
  const displayInitial = displayName.slice(0, 1);
  const displayBadge = profile?.loginType === 'SSAFY' ? 'SSAFY 회원' : '일반 회원';
  const displayOnboardingStatus = profile?.phoneNumber ? '완료' : '진행 중';
  const displayLinkedAccounts = '준비중';

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutRequest();
    } catch (error) {
      const message = extractApiErrorMessage(
        error,
        '로그아웃 처리 중 문제가 있었어요. 다시 시도해주세요.',
      );

      Alert.alert('로그아웃 실패', message);
      setIsLoggingOut(false);
      return;
    }

    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

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
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{displayInitial}</Text>
            </View>
            <View style={styles.profileTextBlock}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{displayName}님 안녕하세요!</Text>
                <Ionicons name="chevron-forward" size={wp(20)} color={COLORS.textTertiary} />
              </View>
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>{displayBadge}</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileSummaryRow}>
            <View style={styles.profileSummaryItem}>
              <Text style={styles.profileSummaryLabel}>연결 계좌</Text>
              <Text style={styles.profileSummaryValue}>{displayLinkedAccounts}</Text>
            </View>
            <View style={styles.profileDivider} />
            <View style={styles.profileSummaryItem}>
              <Text style={styles.profileSummaryLabel}>온보딩</Text>
              <Text style={styles.profileSummaryValue}>{displayOnboardingStatus}</Text>
            </View>
          </View>

          {isLoadingProfile ? (
            <View style={styles.profileLoadingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.profileLoadingText}>프로필을 불러오는 중입니다.</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <View style={styles.statsRow}>
          {mockProfileStats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>보유 카드</Text>
            <Text style={styles.sectionAction}>전체 보기</Text>
          </View>

          {mockMyCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.85}
              onPress={() => console.log(`${card.id} 카드 상세 연결 예정`)}
            >
              <LinearGradient
                colors={[card.themeStart, card.themeEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.creditCard}
              >
                <View style={styles.creditCardTopRow}>
                  <View>
                    <Text style={styles.creditCardType}>{card.cardType}</Text>
                    <Text style={styles.creditCardName}>{card.cardName}</Text>
                  </View>
                  <Ionicons name="card-outline" size={wp(22)} color="#FFFFFF" />
                </View>

                <View style={styles.creditCardBottomRow}>
                  <View>
                    <Text style={styles.creditCardNumber}>**** **** **** {card.lastDigits}</Text>
                    <Text style={styles.creditCardOwner}>{card.ownerName}</Text>
                  </View>
                  <Text style={styles.creditCardBilling}>{card.billingDay}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>연결 계좌</Text>
            <Text style={styles.sectionAction}>잔액 보기</Text>
          </View>

          {mockMyAccounts.map((account) => {
            const toneStyle =
              account.tone === 'primary'
                ? styles.accountTonePrimary
                : account.tone === 'mint'
                  ? styles.accountToneMint
                  : styles.accountToneGold;

            return (
              <TouchableOpacity
                key={account.id}
                style={styles.accountRow}
                activeOpacity={0.82}
                onPress={() => console.log(`${account.id} 계좌 상세 연결 예정`)}
              >
                <View style={styles.accountLeft}>
                  <View style={[styles.accountIconCircle, toneStyle]}>
                    <Ionicons name="wallet-outline" size={wp(18)} color={COLORS.textPrimary} />
                  </View>
                  <View style={styles.accountTextBlock}>
                    <Text style={styles.accountBankName}>{account.bankName}</Text>
                    <Text style={styles.accountAlias}>{account.accountAlias}</Text>
                    <Text style={styles.accountNumber}>{account.accountNumberMasked}</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={styles.accountBalance}>{account.balance.toLocaleString()}원</Text>
                  <Text style={styles.accountBalanceLabel}>현재 잔액</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>설정 및 바로가기</Text>
            <Text style={styles.sectionAction}>관리</Text>
          </View>

          {mockUserShortcuts.map((shortcut) => (
            <TouchableOpacity
              key={shortcut.id}
              style={styles.shortcutRow}
              activeOpacity={0.8}
              onPress={() => console.log(`${shortcut.id} 메뉴 이동 예정`)}
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

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>계정 액션</Text>
          <View style={styles.actionButtonSpacing}>
            <GradientButton
              title="프로필 수정"
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
          <GradientButton
            title={isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            variant="outline"
            onPress={() => void handleLogout()}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
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
  profileLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  profileLoadingText: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
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
  creditCard: {
    borderRadius: RADIUS.xxl,
    paddingHorizontal: wp(18),
    paddingTop: hp(18),
    paddingBottom: hp(16),
    marginBottom: hp(12),
  },
  creditCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(32),
  },
  creditCardType: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#DAD6FF',
    marginBottom: hp(6),
  },
  creditCardName: {
    fontSize: fp(21),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  creditCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardNumber: {
    fontSize: fp(16),
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
    marginBottom: hp(6),
    letterSpacing: 0.6,
  },
  creditCardOwner: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: '#E6E1FF',
  },
  creditCardBilling: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: '#F4F2FF',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.xl,
    paddingHorizontal: wp(14),
    paddingVertical: hp(14),
    marginBottom: hp(10),
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: wp(10),
  },
  accountIconCircle: {
    width: wp(42),
    height: wp(42),
    borderRadius: wp(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(12),
  },
  accountTonePrimary: {
    backgroundColor: '#DCD8FF',
  },
  accountToneMint: {
    backgroundColor: '#D7F4E9',
  },
  accountToneGold: {
    backgroundColor: '#F9EAC5',
  },
  accountTextBlock: {
    flex: 1,
  },
  accountBankName: {
    fontSize: fp(15),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  accountAlias: {
    fontSize: fp(12),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    marginBottom: hp(4),
  },
  accountNumber: {
    fontSize: fp(12),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: hp(4),
  },
  accountBalanceLabel: {
    fontSize: fp(11),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
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
