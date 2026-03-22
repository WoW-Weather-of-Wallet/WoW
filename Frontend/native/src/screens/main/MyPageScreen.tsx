import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, hp, wp } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { fcmService } from '../../services/fcmService';
import {
  getProfile,
  logout as logoutRequest,
  type NativeUserProfileResponse,
} from '../../services/auth';
import { clearPersistedAuthSession } from '../../services/sessionStorage';
import { extractApiErrorMessage } from '../../utils/error';

import { styles } from './MyPageScreen.styles';

const LIVE_SHORTCUTS = [
  {
    id: 'profile-settings',
    title: '내 정보 설정',
    description: '이름, 휴대폰 번호, 비밀번호를 바로 관리합니다.',
    icon: 'person-circle-outline' as const,
    action: 'settings',
  },
  {
    id: 'push-settings',
    title: '알림 설정 확인',
    description: '현재 계정 알림 사용 여부를 설정 화면에서 확인합니다.',
    icon: 'notifications-outline' as const,
    action: 'settings',
  },
] as const;

/**
 * MyPageScreen
 * 마이페이지는 설정 메뉴보다 사용자의 실자산(카드/계좌)을 먼저 보여주는 방향으로 재구성합니다.
 * 추후 상세 화면이 생기면 각 카드/계좌 항목을 눌렀을 때 이동시키는 방식으로 확장할 수 있습니다.
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
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
  const profileInfoCards = [
    {
      id: 'login-type',
      label: '가입 유형',
      value: displayBadge,
    },
    {
      id: 'phone',
      label: '휴대폰',
      value: profile?.phoneNumber ? '연결됨' : '미등록',
    },
    {
      id: 'alarm',
      label: '알림',
      value: profile?.alarmEnabled ? '사용 중' : '꺼짐',
    },
  ] as const;

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

    await clearPersistedAuthSession();
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: insets.top + hp(12),
            paddingBottom: tabBarHeight + hp(30),
          },
        ]}
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
                <Text style={styles.profileName}>
                  <Text style={styles.profileNameHighlight}>{displayName}</Text>님 안녕하세요!
                </Text>
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
          {/*
            이전 코드:
            - 연결 계좌 수, 카드 수, 리포트 상태를 mock 데이터로 보여주고 있었습니다.

            변경 이유:
            - 사용자관리 영역은 이제 실데이터만 사용해야 하므로,
              프로필 API에서 바로 확인 가능한 값만 요약 카드로 노출합니다.
          */}
          {profileInfoCards.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>보유 카드</Text>
            <Text style={styles.sectionAction}>실연동 대기</Text>
          </View>
          <View style={styles.emptyStateCard}>
            <Ionicons name="card-outline" size={wp(24)} color={COLORS.primary} />
            <Text style={styles.emptyStateTitle}>연결된 카드 데이터가 아직 없습니다.</Text>
            <Text style={styles.emptyStateDescription}>
              사용자관리에서는 더 이상 mock 카드를 보여주지 않고, 실연동 API가 준비되면 여기에 표시합니다.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>연결 계좌</Text>
            <Text style={styles.sectionAction}>실연동 대기</Text>
          </View>
          <View style={styles.emptyStateCard}>
            <Ionicons name="wallet-outline" size={wp(24)} color={COLORS.primary} />
            <Text style={styles.emptyStateTitle}>연결된 계좌 데이터가 아직 없습니다.</Text>
            <Text style={styles.emptyStateDescription}>
              계좌 연동 API가 열리기 전까지는 가짜 잔액을 노출하지 않고 빈 상태로 유지합니다.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>설정 및 바로가기</Text>
            <Text style={styles.sectionAction}>관리</Text>
          </View>

          {LIVE_SHORTCUTS.map((shortcut) => (
            <TouchableOpacity
              key={shortcut.id}
              style={styles.shortcutRow}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings')}
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
