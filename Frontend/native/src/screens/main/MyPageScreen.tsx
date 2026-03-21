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
import { fcmService } from '../../services/fcmService';
import {
  getProfile,
  logout as logoutRequest,
  type NativeUserProfileResponse,
} from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';

import { styles } from './MyPageScreen.styles';

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
      // [P1 Fix] 로그아웃 시 서버에 등록된 FCM 토큰을 먼저 제거합니다.
      try {
        await fcmService.unregisterFcmToken();
      } catch (fcmError) {
        console.warn('[MyPage] FCM 토큰 해제 실패:', fcmError);
      }

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
                  <Ionicons name="card-outline" size={wp(22)} color={COLORS.textInverse} />
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
