import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import GradientButton from '../../components/common/GradientButton';

const PERMISSIONS = [
  { id: 'notification', title: '알림', icon: 'notifications-outline' as const },
  { id: 'camera', title: '카메라', icon: 'camera-outline' as const },
  { id: 'photo', title: '사진', icon: 'image-outline' as const },
  { id: 'biometrics', title: '지문인식', icon: 'finger-print-outline' as const },
];

export default function AccessPermissionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleConfirm = () => {
    // 확인 후 로그인(또는 다음 온보딩) 화면으로 전환
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + hp(24) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* 타이틀 영역 */}
      <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={styles.titleContainer}>
        <Text style={styles.titleText}>앱 사용을 위한</Text>
        <Text style={styles.titleText}>접근 권한을</Text>
        <Text style={styles.titleText}>허용해주세요.</Text>
      </Animated.View>

      {/* 권한 리스트 영역 */}
      <View style={styles.listContainer}>
        {PERMISSIONS.map((item, index) => (
          <Animated.View 
            key={item.id}
            entering={FadeInRight.delay(300 + index * 150).duration(500).springify()}
            style={styles.permissionItem}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={wp(24)} color={COLORS.primary} />
            </View>
            <Text style={styles.permissionText}>{item.title}</Text>
          </Animated.View>
        ))}
      </View>

      {/* 여백 (버튼을 최하단으로 밀기 위해) */}
      <View style={{ flex: 1 }} />

      {/* 확인 버튼 */}
      <Animated.View entering={FadeInDown.delay(900).duration(600).springify()} style={styles.buttonContainer}>
        <GradientButton title="확인" onPress={handleConfirm} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(28),
  },
  titleContainer: {
    marginTop: hp(40),
    marginBottom: hp(60),
    paddingTop: hp(20),
  },
  titleText: {
    fontSize: fp(30),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    lineHeight: fp(44),
    letterSpacing: -0.5,
  },
  listContainer: {
    gap: hp(28),
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: wp(52),
    height: wp(52),
    borderRadius: wp(26),
    backgroundColor: `${COLORS.primary}15`, // 투명도 15% (헥스)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(18),
  },
  permissionText: {
    fontSize: fp(18),
    fontFamily: FONTS.semiBold,
    color: '#333333',
    letterSpacing: -0.3,
  },
  buttonContainer: {
    width: '100%',
  },
});
