import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, FONTS, wp, hp, fp, RADIUS } from '../../constants/theme';
import IdentityVerificationForm, { IdentityData } from '../../components/auth/IdentityVerificationForm';
import TermsBottomSheet from '../../components/auth/TermsBottomSheet';
import { sendSmsCode } from '../../services/auth';
import { extractApiErrorMessage } from '../../utils/error';
import { validateId } from '../../utils/validation';

export default function FindPwScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState(route.params?.prefilledId || '');
  const [showVerification, setShowVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [pendingData, setPendingData] = useState<IdentityData | null>(null);

  React.useEffect(() => {
    if (route.params?.prefilledId) {
      setUserId(route.params.prefilledId);
    }
  }, [route.params?.prefilledId]);

  const handleIdSubmit = () => {
    const validation = validateId(userId.trim());
    if (validation.isValid) {
      setShowVerification(true);
      return;
    }

    Alert.alert('Error', validation.message);
  };

  const handleComplete = (data: IdentityData) => {
    setPendingData(data);
    setTermsVisible(true);
  };

  const handleTermsConfirm = async () => {
    if (!pendingData) {
      return;
    }

    setIsSubmitting(true);
    try {
      // SMS verification must complete before the reset screen can submit a new password.
      await sendSmsCode({ phoneNumber: pendingData.phone });

      // Keep the login id and identity data together for the verify screen.
      navigation.navigate('VerifyCode', {
        ...pendingData,
        userId: userId.trim(),
        flow: 'FindPw',
      });
    } catch (error: any) {
      const message = extractApiErrorMessage(
        error,
        'Failed to send the verification code. Please try again.',
      );
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserIdChange = (text: string) => {
    const filtered = text.replace(/[^a-zA-Z0-9]/g, '');
    setUserId(filtered);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Password</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(20) : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.introContainer}>
            <Text style={styles.introTitle}>Confirm the account to reset its password.</Text>
            <Text style={styles.introSub}>
              {showVerification
                ? 'Finish identity verification to set a new password.'
                : 'Enter your login ID first.'}
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>User ID</Text>
            <View style={styles.underlineContainer}>
              <TextInput
                style={[styles.bareInput, { letterSpacing: userId.length > 0 ? 1 : 0 }]}
                value={userId}
                onChangeText={handleUserIdChange}
                placeholder="Enter your login ID"
                placeholderTextColor={COLORS.textTertiary}
                onSubmitEditing={handleIdSubmit}
                returnKeyType="next"
                autoFocus={!showVerification}
                editable={!showVerification}
                autoCapitalize="none"
              />
            </View>
            {!showVerification && (
              <>
                <Text style={styles.helperText}>* 4 to 20 letters or numbers</Text>
                <TouchableOpacity
                  style={[
                    styles.idNextButton,
                    userId.trim().length >= 4 && userId.trim().length <= 20 && styles.activeIdNextButton,
                  ]}
                  onPress={handleIdSubmit}
                  disabled={userId.trim().length < 4 || userId.trim().length > 20}
                >
                  <Text
                    style={[
                      styles.idNextButtonText,
                      userId.trim().length >= 4 && userId.trim().length <= 20 && styles.activeIdNextButtonText,
                    ]}
                  >
                    Next
                  </Text>
                </TouchableOpacity>

                <View style={{ height: Math.max(insets.bottom, hp(20)) }} />
              </>
            )}
          </View>

          {showVerification && (
            <Animated.View entering={FadeInDown.duration(500)} style={styles.formWrapper}>
              <View style={styles.divider} />
              <IdentityVerificationForm
                onComplete={handleComplete}
                isSubmitting={isSubmitting}
              />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsBottomSheet
        visible={termsVisible}
        flow="FindPw"
        onClose={() => setTermsVisible(false)}
        onConfirm={handleTermsConfirm}
      />
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(32),
    paddingBottom: hp(40),
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
  inputSection: {
    marginBottom: hp(24),
  },
  inputLabel: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textTertiary,
    marginBottom: hp(10),
    marginLeft: wp(4),
  },
  underlineContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1A1A1A',
    paddingVertical: hp(8),
    minHeight: hp(50),
    justifyContent: 'center',
  },
  bareInput: {
    fontSize: fp(24),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    padding: 0,
    margin: 0,
  },
  helperText: {
    fontSize: fp(12),
    color: COLORS.textTertiary,
    marginTop: hp(6),
    marginLeft: wp(4),
  },
  idNextButton: {
    marginTop: hp(16),
    backgroundColor: '#F3F4F6',
    paddingVertical: hp(14),
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  activeIdNextButton: {
    backgroundColor: COLORS.primary50,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
  },
  idNextButtonText: {
    fontSize: fp(14),
    fontFamily: FONTS.bold,
    color: COLORS.textTertiary,
  },
  activeIdNextButtonText: {
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: hp(24),
  },
  formWrapper: {
    flex: 1,
  },
});
