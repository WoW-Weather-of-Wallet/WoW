import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import PermissionCard from '../../components/auth/PermissionCard';
import GradientButton from '../../components/common/GradientButton';
import { styles } from './AccessPermissionScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import { PermissionMeta } from '../../constants/auth/permissionConfig';
import { getPermissionItems } from '../../constants/auth/permissionConfig';
import { PermissionKey, useAppPermissions } from '../../hooks';
import { useAuthStore } from '../../store/authStore';

export default function AccessPermissionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    biometricLabel,
    isAndroidExpoGo,
    isRefreshing,
    isRequestingAll,
    permissionStates,
    refreshPermissionStates,
    requestAllPermissions,
    requestPermission,
  } = useAppPermissions();

  const rotation = useSharedValue(0);

  const permissionItems = useMemo(
    () => getPermissionItems(biometricLabel),
    [biometricLabel],
  );

  useEffect(() => {
    if (isRefreshing) {
      // 0도에서 360도로 한 바퀴만 정교하게 회전 (새로고침 딜레이 1.2초와 동기화)
      rotation.value = 0;
      rotation.value = withTiming(360, {
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
  }, [isRefreshing, rotation]);

  const animatedRotationStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleConfirm = () => {
    // 필수 권한 확인: 지문, 전화, 메시지 권한이 'granted'인지 체크
    const mandatoryKeys: PermissionKey[] = ['biometrics', 'phone', 'sms'];
    const missingPermissions = mandatoryKeys.filter(key => permissionStates[key] !== 'granted');

    if (missingPermissions.length > 0) {
      Alert.alert(
        '필수 권한 미허용',
        '금융 서비스 이용을 위해 필수 접근 권한(생체 인증, 전화, 메시지) 허용이 반드시 필요합니다. 모든 필수 항목을 허용해 주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
  };

  const handlePermissionPress = (permissionKey: PermissionKey) => {
    const state = permissionStates[permissionKey];
    const isMandatory = ['biometrics', 'phone', 'sms'].includes(permissionKey);

    // 1. 이미 허용된 권한인 경우: 시스템 정책상 취소는 설정에서만 가능
    if (state === 'granted') {
      // 시뮬레이션 권한(전화, 메시지, 파일 + Expo Go의 경우 알림)은 내부 상태이므로 여기서 바로 토글이 가능합니다.
      const simulatedKeys = ['phone', 'sms', 'files'];
      if (isAndroidExpoGo) simulatedKeys.push('notification');

      if (simulatedKeys.includes(permissionKey)) {
        void requestPermission(permissionKey);
        return;
      }

      Alert.alert(
        '권한 안내',
        '이미 허용된 권한입니다. 권한 취소는 기기의 [설정 > 애플리케이션 > WOW]에서 가능합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    // 2. 거부되었거나 아직 요청 전인 경우: 다시 요청 시도
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
          <Text style={styles.titleText}>편리한 서비스 이용을 위한</Text>
          <Text style={styles.titleText}>접근 권한을 확인해주세요</Text>
          <Text style={styles.subtitleText}>
            더 안전하고 편리한 금융 관리를 위해{"\n"}꼭 필요한 권한만 요청드립니다.
          </Text>
        </Animated.View>

        {/* 필수 권한 섹션 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>필수 접근 권한</Text>
          <View style={styles.listContainer}>
            {permissionItems
              .filter((item: PermissionMeta) => item.type === 'mandatory')
              .map((item: PermissionMeta, index: number) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(200 + index * 80)
                    .duration(400)
                    .springify()}
                >
                  <PermissionCard
                    item={item}
                    state={permissionStates[item.id as PermissionKey]}
                    onPress={handlePermissionPress}
                  />
                </Animated.View>
              ))}
          </View>
        </View>

        {/* 선택 권한 섹션 */}
        <View style={[styles.sectionContainer, styles.marginTop24]}>
          <Text style={styles.sectionHeader}>선택 접근 권한</Text>
          <View style={styles.listContainer}>
            {permissionItems
              .filter((item: PermissionMeta) => item.type === 'optional')
              .map((item: PermissionMeta, index: number) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(300 + index * 80)
                    .duration(400)
                    .springify()}
                >
                  <PermissionCard
                    item={item}
                    state={permissionStates[item.id as PermissionKey]}
                    onPress={handlePermissionPress}
                  />
                </Animated.View>
              ))}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.refreshRow}
            onPress={() => void refreshPermissionStates()}
            disabled={isRefreshing}
            activeOpacity={0.6}
          >
            <Animated.View style={animatedRotationStyles}>
              <Ionicons name="refresh-outline" size={wp(16)} color={COLORS.primary} />
            </Animated.View>
            <Text style={styles.refreshText}>권한 상태 업데이트</Text>
          </TouchableOpacity>

          <View style={styles.buttonGap}>
            <GradientButton
              title="금융 서비스 시작하기"
              onPress={handleConfirm}
            />
            {!isRefreshing && !isRequestingAll && (
              <TouchableOpacity
                onPress={() => void requestAllPermissions()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>권한 전체 허용 시도하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


