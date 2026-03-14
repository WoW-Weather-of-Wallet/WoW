import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import PermissionCard from '../../components/auth/PermissionCard';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { getPermissionItems } from '../../constants/auth/permissionConfig';
import { PermissionKey, useAppPermissions } from '../../hooks';
import { useAuthStore } from '../../store/authStore';

// 권한 화면은 렌더링과 사용자 액션 연결만 담당하고,
// 실제 권한 조회와 요청은 useAppPermissions 훅으로 넘깁니다.
export default function AccessPermissionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    biometricLabel,
    isAndroidExpoGo,
    isRefreshing,
    isRequestingAll,
    permissionStates,
    platformLabel,
    refreshPermissionStates,
    requestAllPermissions,
    requestPermission,
  } = useAppPermissions();

  const permissionItems = useMemo(
    () => getPermissionItems(biometricLabel, isAndroidExpoGo),
    [biometricLabel, isAndroidExpoGo],
  );

  const handleConfirm = () => {
    navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  // 설정 화면으로 보내야 하는 상태와 직접 요청 가능한 상태를 여기서 나눕니다.
  const handlePermissionPress = (permissionKey: PermissionKey) => {
    const state = permissionStates[permissionKey];

    if (state === 'blocked' || state === 'system') {
      openSettings();
      return;
    }

    void requestPermission(permissionKey);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + hp(24) },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).duration(600).springify()}
          style={styles.titleContainer}
        >
          <Text style={styles.titleText}>{platformLabel} 사용에 필요한 권한을</Text>
          <Text style={styles.titleText}>한 번에 확인하고 정리해보세요.</Text>
          <Text style={styles.subtitleText}>
            필요한 권한만 요청하고, 지원하지 않는 권한은 현재 앱 기준으로
            안내해드릴게요.
          </Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {permissionItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(220 + index * 90).duration(420).springify()}
            >
              <PermissionCard
                item={item}
                state={permissionStates[item.id]}
                onPress={handlePermissionPress}
              />
            </Animated.View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.refreshRow}
            onPress={() => void refreshPermissionStates()}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Ionicons name="refresh" size={18} color={COLORS.primary} />
            )}
            <Text style={styles.refreshText}>권한 상태 다시 확인</Text>
          </TouchableOpacity>

          <GradientButton
            title={isRequestingAll ? '권한 확인 중...' : '필요한 권한 한 번에 요청'}
            onPress={() => void requestAllPermissions()}
          />

          <View style={styles.skipButton}>
            <GradientButton
              title="다음으로 이동"
              onPress={handleConfirm}
              variant="outline"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(24),
  },
  scrollContent: {
    paddingBottom: hp(24),
  },
  titleContainer: {
    marginTop: hp(20),
    marginBottom: hp(20),
  },
  titleText: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(34),
    letterSpacing: -0.5,
  },
  subtitleText: {
    marginTop: hp(10),
    fontSize: fp(14),
    lineHeight: fp(21),
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
  listContainer: {
    gap: hp(10),
  },
  footer: {
    paddingTop: hp(18),
  },
  refreshRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(8),
    marginBottom: hp(14),
  },
  refreshText: {
    fontSize: fp(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  skipButton: {
    marginTop: hp(12),
  },
});
