import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AccountRecoveryEntryScreen.styles';
import { COLORS, wp, hp } from '../../constants/theme';
import { getSsafyLoginUrl } from '../../services/auth';
import RecoveryOption from '../../components/auth/RecoveryOption';
import SsafyRecoveryNotice from '../../components/auth/SsafyRecoveryNotice';

export default function AccountRecoveryEntryScreen() {
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
      Alert.alert('오류', 'SSAFY 로그인 페이지를 열지 못했어요.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
          <Text style={styles.introTitle}>찾고 싶은 항목을 선택해주세요.</Text>
          <Text style={styles.introSub}>아이디 찾기 또는 비밀번호 찾기부터 시작할 수 있어요.</Text>
        </View>

        <View style={styles.optionsContainer}>
          <RecoveryOption
            title="아이디 찾기"
            description="일반 계정의 로그인 아이디를 확인해요."
            icon="person-outline"
            onPress={handleFindId}
          />
          <RecoveryOption
            title="비밀번호 찾기"
            description="본인 확인 후 새 비밀번호를 설정해요."
            icon="lock-closed-outline"
            onPress={handleFindPassword}
          />
        </View>

        <SsafyRecoveryNotice onLinkPress={handleSsafyLink} />
        <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
      </ScrollView>
    </View>
  );
}


