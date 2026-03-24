import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DevShortcutButton from '../../components/common/DevShortcutButton';
import { useAuthStore } from '../../store/authStore';

export default function WelcomeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const loginWithDevBypass = useAuthStore((state) => state.loginWithDevBypass);
  
  const { name = '고객', ssnFront = '', ssnBack = '', id = '' } = route.params || {};

  let birthDate = '정보 없음';
  let gender = '정보 없음';

  if (ssnFront.length === 6 && ssnBack.length >= 1) {
    const century = (ssnBack.charAt(0) === '1' || ssnBack.charAt(0) === '2') ? '19' : '20';
    const year = ssnFront.slice(0, 2);
    const month = ssnFront.slice(2, 4);
    const day = ssnFront.slice(4, 6);
    birthDate = `${century}${year}-${month}-${day}`;
    
    gender = (ssnBack.charAt(0) === '1' || ssnBack.charAt(0) === '3') ? '남성' : '여성';
  }

  const iconScale = useSharedValue(0.3);
  const [retryModalVisible, setRetryModalVisible] = useState(false);
  
  useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 90 }));
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleNext = () => {
    // 직업 선택/온보딩 정책이 아직 확정되지 않아 현재는 메인 탭으로 바로 보냅니다.
    // 관련 화면은 삭제하지 않고 보존해 두고, 정책이 확정되면 다시 Welcome -> JobSelection 흐름을 복구합니다.
    loginWithDevBypass({ userId: id || 'welcome-user', name });
    navigation.replace('MainTabs');
  };

  const handleConfirmRetry = () => {
    setRetryModalVisible(false);
    navigation.replace('PhoneAuth'); 
  };

  return (
    <View style={styles.container}>
      {/* 화면 전체를 flex로 구성하여 스크롤 없이 한 화면에 패킹 */}
      <View style={[styles.mainLayout, { paddingTop: insets.top + hp(40), paddingBottom: Math.max(insets.bottom, hp(24)) }]}>
        
        {/* 상단 둥둥 뜨는 아이콘 및 타이틀 구역 */}
        <View style={styles.headerSection}>
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <Ionicons name="checkmark-circle" size={wp(80)} color={COLORS.primary} />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.titleWrapper}>
            <Text style={styles.title}>{name}님의 가입을{'\n'}환영합니다!</Text>
            <Text style={styles.subtitle}>기입한 정보를 확인해주세요.</Text>
          </Animated.View>
        </View>

        {/* 중앙 가입 정보 표시 구역 */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이름</Text>
              <Text style={styles.infoValue}>{name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>아이디</Text>
              <Text style={styles.infoValue}>{id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>성별</Text>
              <Text style={styles.infoValue}>{gender}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>생년월일</Text>
              <Text style={styles.infoValue}>{birthDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>푸시 알림</Text>
              <Text style={styles.infoValue}>허용</Text>
            </View>
          </View>
        </Animated.View>

        {/* 하단 메인 액션 및 롤백 구역 */}
        <Animated.View entering={FadeInDown.delay(1200).duration(500)} style={styles.bottomContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={() => setRetryModalVisible(true)}>
            <Text style={styles.retryButtonText}>잘못 입력하셨나요?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>

          <DevShortcutButton
            label="TEST: 메인 화면 바로 이동"
            description="온보딩 정책이 확정되기 전까지 Welcome 화면에서 바로 MainTabs 로 넘어갑니다."
            onPress={() => {
              loginWithDevBypass({ userId: id || 'welcome-user', name });
              navigation.replace('MainTabs');
            }}
            style={styles.devShortcut}
          />
        </Animated.View>
      </View>

      {/* 정보 수정 재시도 확인 모달창 */}
      <Modal visible={retryModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>정보 수정</Text>
            </View>
            <Text style={styles.modalDesc}>
              수정하시려면 처음 단계부터{'\n'}다시 진행하셔야 합니다.{'\n\n'}정말 다시 입력하시겠습니까?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRetryModalVisible(false)}>
                <Text style={styles.modalCancelText}>아니요, 올바르게 입력했습니다</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmRetry}>
                <Text style={styles.modalConfirmText}>네, 다시 입력하겠습니다</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  mainLayout: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    paddingHorizontal: wp(28),
    alignItems: 'center',
    marginBottom: hp(24),
  },
  iconContainer: {
    marginBottom: hp(24),
  },
  titleWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: fp(32),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(46),
    textAlign: 'center',
    marginBottom: hp(12),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fp(18),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    flex: 1, // 스크롤 없이 남은 공간을 차지하며 중앙 정렬되게 함
    justifyContent: 'center',
    paddingHorizontal: wp(28),
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    paddingVertical: hp(20),
    paddingHorizontal: wp(20),
    backgroundColor: '#F9FAFB',
    borderRadius: wp(16),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: hp(10),
  },
  infoLabel: {
    width: wp(100),
    fontSize: fp(20),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
  },
  infoValue: {
    flex: 1,
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  bottomContainer: {
    paddingHorizontal: wp(28),
    justifyContent: 'flex-end',
    paddingTop: hp(10),
  },
  retryButton: {
    paddingVertical: hp(10),
    marginBottom: hp(16),
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    textDecorationLine: 'underline',
  },
  confirmButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: wp(30),
    paddingVertical: hp(16),
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  devShortcut: {
    marginTop: hp(14),
  },

  // 모달 스타일
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(28),
  },
  modalContent: { 
    width: '100%',
    backgroundColor: '#FFFFFF', 
    borderRadius: wp(16), 
    paddingHorizontal: wp(24), 
    paddingTop: hp(24), 
    paddingBottom: hp(20),
  },
  modalHeader: { 
    marginBottom: hp(16), 
    alignItems: 'center',
  },
  modalTitle: { 
    fontSize: fp(20), 
    fontFamily: FONTS.bold, 
    color: '#1A1A1A',
  },
  modalDesc: { 
    fontSize: fp(16), 
    fontFamily: FONTS.medium, 
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: fp(24),
    marginBottom: hp(24),
  },
  modalButtons: {
    flexDirection: 'column',
    gap: hp(10),
  },
  modalCancelBtn: {
    paddingVertical: hp(14),
    borderRadius: wp(12),
    backgroundColor: '#1A1A1A', // 무거운 액션을 막는 주 색상
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  modalConfirmBtn: {
    paddingVertical: hp(14),
    borderRadius: wp(12),
    backgroundColor: '#F3F4F6', // 초기화해버리는 리스크 큰 버튼은 얌전하게
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
