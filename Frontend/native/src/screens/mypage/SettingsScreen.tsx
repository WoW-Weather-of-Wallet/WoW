import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { mockUserProfile } from '../../mock/dashboard';
import ProfileEditHeader from '../../components/mypage/ProfileEditHeader';
import SettingSection from '../../components/mypage/SettingSection';
import SettingItem from '../../components/mypage/SettingItem';

/**
 * SettingsScreen
 * 사용자 프로필 수정, 계정 관리, 알림 설정 등을 한 곳에서 관리하는 페이지입니다.
 * 모든 변경 액션은 추후 API 연결을 위해 주석으로 처리되어 있습니다.
 */
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);

  // 알림 상태 관리 (추후 useAppPermissions의 상태와 동기화 가능)
  const [isPushEnabled, setIsPushEnabled] = useState(true);

  // 프로필 사진 변경 핸들러
  const handleEditProfilePhoto = () => {
    Alert.alert('프로필 사진 변경', '갤러리 또는 카메라에서 사진을 선택할 수 있는 기능을 연결 예정입니다.');
    /* TODO: expo-image-picker 연결
       1. 권한 확인
       2. 이미지 선택
       3. 서버 업로드 API 호출 (POST /user/profile-image)
    */
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  // 회원 탈퇴 핸들러
  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴', 
      '주의: 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다. 계속하시겠습니까?', 
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '탈퇴하기', 
          style: 'destructive', 
          onPress: () => console.log('회원 탈퇴 API 호출 예정') 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* 커스텀 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용자 설정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 프로필 섹션 */}
        <ProfileEditHeader 
          name={mockUserProfile.name} 
          onEditPress={handleEditProfilePhoto}
        />

        {/* 계정 정보 섹션 */}
        <SettingSection title="계정 정보">
          <SettingItem 
            label="아이디 변경" 
            onPress={() => console.log('아이디 변경 페이지 이동')} 
          />
          <SettingItem 
            label="비밀번호 변경" 
            onPress={() => console.log('비밀번호 변경 페이지 이동')} 
          />
          <SettingItem 
            label="휴대폰 번호" 
            value="010-****-5678"
            onPress={() => console.log('휴대폰 번호 수정 페이지 이동')}
          />
        </SettingSection>

        {/* 서비스 설정 섹션 */}
        <SettingSection title="서비스 설정">
          <SettingItem 
            label="푸시 알림" 
            type="toggle" 
            isToggled={isPushEnabled}
            onToggle={(val) => setIsPushEnabled(val)}
          />
        </SettingSection>

        {/* 이용 안내 섹션 */}
        <SettingSection title="이용 안내">
          <SettingItem 
            label="약관 및 정책" 
            onPress={() => console.log('약관 및 정책 페이지 이동')} 
          />
          <SettingItem 
            label="개인정보 처리방침" 
            onPress={() => console.log('개인정보 처리방침 페이지 이동')} 
          />
          <SettingItem 
            label="현재 버전" 
            value="1.0.4"
            type="text"
          />
        </SettingSection>

        {/* 계정 액션 섹션 */}
        <SettingSection>
          <SettingItem 
            label="로그아웃" 
            onPress={handleLogout} 
          />
          <SettingItem 
            label="회원 탈퇴" 
            isDanger 
            onPress={handleDeleteAccount}
          />
        </SettingSection>
        
        <View style={{ height: hp(40) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56) + 20, // inset 고려
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  backButton: {
    padding: wp(4),
  },
  headerTitle: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: wp(32),
  },
  scrollContent: {
    paddingBottom: hp(20),
  },
});
