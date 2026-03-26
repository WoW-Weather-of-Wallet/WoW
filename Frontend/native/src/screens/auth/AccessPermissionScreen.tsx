import React from 'react';
import {
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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import PermissionCard from '../../components/auth/PermissionCard';
import GradientButton from '../../components/common/GradientButton';
import { styles } from './AccessPermissionScreen.styles';
import { COLORS, hp, wp } from '../../constants/theme';
import { useAccessPermissionFlow } from '../../hooks';

export default function AccessPermissionScreen() {
  const insets = useSafeAreaInsets();
  const {
    isRefreshing,
    refreshPermissionStates,
    requestAllPermissions,
    handleConfirm,
    handlePermissionPress,
    mandatoryPermissionCards,
    optionalPermissionCards,
    animatedRotationStyles,
    shouldShowRequestAllButton,
  } = useAccessPermissionFlow();

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
            {mandatoryPermissionCards.map(({ item, delay, state }) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(delay)
                    .duration(400)
                    .springify()}
                >
                  <PermissionCard
                    item={item}
                    state={state}
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
            {optionalPermissionCards.map(({ item, delay, state }) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(delay)
                    .duration(400)
                    .springify()}
                >
                  <PermissionCard
                    item={item}
                    state={state}
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
            {shouldShowRequestAllButton && (
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


