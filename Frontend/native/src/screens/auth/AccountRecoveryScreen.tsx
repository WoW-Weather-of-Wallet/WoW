import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, wp, hp, fp } from '../../constants/theme';
import { getSsafyLoginUrl } from '../../services/auth';
import RecoveryOption from '../../components/auth/RecoveryOption';
import SsafyRecoveryNotice from '../../components/auth/SsafyRecoveryNotice';

/**
 * AccountRecoveryScreen
 * 아이디 찾기와 비밀번호 찾기 중 선택하는 화면입니다.
 * SSAFY 계정 사용자를 위한 별도 안내도 포함합니다.
 */
export default function AccountRecoveryScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleFindId = () => {
    navigation.navigate('FindId');
  };

  const handleFindPassword = () => {
    navigation.navigate('FindPw');
  };

  const handleSsafyLink = async () => {
    try {
      const url = getSsafyLoginUrl();
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('오류', 'SSAFY 페이지를 여는 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* 헤더 영역 */}
      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 찾기</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>아이디/비밀번호를{"\n"}잊으셨나요?</Text>
          <Text style={styles.introSub}>원하시는 항목을 선택하여 계정을 찾아보세요.</Text>
        </View>

        {/* 옵션 카드 섹션 */}
        <View style={styles.optionsContainer}>
          <RecoveryOption 
            title="아이디 찾기"
            description="가입 시 등록한 정보로 아이디를 확인합니다."
            icon="person-outline"
            onPress={handleFindId}
          />
          <RecoveryOption 
            title="비밀번호 찾기"
            description="본인인증 후 비밀번호를 재설정합니다."
            icon="lock-closed-outline"
            onPress={handleFindPassword}
          />
        </View>

        {/* SSAFY 사용자 안내 */}
        <SsafyRecoveryNotice onLinkPress={handleSsafyLink} />

        {/* [Premium-UI] 네비게이션 바와의 겹침 방지를 위해 동적 여백 추가 */}
        <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(16),
    height: hp(56),
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
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(24), // 기본 여백을 줄이고 동적 여백으로 처리
  },
  introContainer: {
    marginBottom: hp(32),
  },
  introTitle: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: fp(34),
    marginBottom: hp(8),
  },
  introSub: {
    fontSize: fp(15),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  optionsContainer: {
    gap: hp(8),
  },
});
