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
      Alert.alert('Error', 'Failed to open the SSAFY sign-in page.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Recovery</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introContainer}>
          <Text style={styles.introTitle}>Choose what you want to recover.</Text>
          <Text style={styles.introSub}>
            Start with either your user ID or your password.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <RecoveryOption
            title="Find ID"
            description="Recover the login ID for a regular account."
            icon="person-outline"
            onPress={handleFindId}
          />
          <RecoveryOption
            title="Find Password"
            description="Verify your identity and set a new password."
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
    paddingBottom: hp(24),
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
