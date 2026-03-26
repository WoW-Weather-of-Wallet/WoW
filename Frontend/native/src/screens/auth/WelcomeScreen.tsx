import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import KeyValueInfoCard from '../../components/common/KeyValueInfoCard';
import StepIndicator from '../../components/common/StepIndicator';
import { styles } from './WelcomeScreen.styles';
import { COLORS, wp, hp } from '../../constants/theme';
import { useWelcomeFlow, useWelcomeSummary } from '../../hooks';
import type { RootScreenProps } from '../../types';
import type { WelcomeRouteParams } from '../../types/auth';

export default function WelcomeScreen({
  route,
}: RootScreenProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const routeParams: WelcomeRouteParams = route.params ?? {};
  const { isConfirming, isSsafySignup, handleConfirm } = useWelcomeFlow(routeParams);
  const { title, subtitle, summaryItems } = useWelcomeSummary({
    routeParams,
    isSsafySignup,
  });

  return (
    <View style={styles.container}>
      <View style={styles.mainLayout}>
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={[
            styles.scrollContentContainer,
            { paddingTop: insets.top + hp(44) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={{ marginBottom: hp(16) }}>
              <StepIndicator currentStep={5} totalSteps={5} />
            </View>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={wp(84)} color={COLORS.primary} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.titleBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(280).duration(500)} style={styles.infoSection}>
            <KeyValueInfoCard
              items={summaryItems}
              containerStyle={styles.infoCard}
              rowStyle={styles.infoRow}
              labelStyle={styles.infoLabel}
              valueStyle={styles.infoValue}
            />
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(380).duration(500)}
          style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, hp(24)) }]}
        >
          <TouchableOpacity
            style={[styles.confirmButton, isConfirming && styles.confirmButtonDisabled]}
            onPress={() => void handleConfirm()}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color={COLORS.textInverse} />
            ) : (
              <Text style={styles.confirmButtonText}>시작하기</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
