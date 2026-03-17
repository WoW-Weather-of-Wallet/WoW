import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import { TERM_DOCUMENTS, TermDocumentKey } from '../../constants/terms';

interface TermsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (termsAgreed: boolean) => void;
  flow?: 'FindId' | 'FindPw' | string;
}

export default function TermsBottomSheet({
  visible,
  onClose,
  onConfirm,
  flow,
}: TermsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [allAgreed, setAllAgreed] = useState(false);
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    telecom: false,
  });

  const isRecovery = flow === 'FindId' || flow === 'FindPw';
  const isAllRequiredAgreed = isRecovery
    ? agreements.privacy && agreements.telecom
    : agreements.service && agreements.privacy && agreements.telecom;

  useEffect(() => {
    setAllAgreed(isAllRequiredAgreed);
  }, [agreements, isAllRequiredAgreed]);

  const toggleAll = () => {
    const newValue = !allAgreed;
    setAllAgreed(newValue);
    setAgreements({
      service: isRecovery ? false : newValue,
      privacy: newValue,
      telecom: newValue,
    });
  };

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleViewDocument = (key: TermDocumentKey) => {
    const document = TERM_DOCUMENTS[key];

    if (!document.url) {
      Alert.alert('준비 중', '이 약관의 PDF 링크는 아직 연결되지 않았습니다.');
      return;
    }

    navigation.navigate('TermsPdf', {
      title: document.title,
      url: document.url,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { paddingBottom: insets.bottom + hp(32) }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>약관 동의</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.allAgreeContainer} onPress={toggleAll} activeOpacity={0.7}>
            <Ionicons
              name="checkmark-circle"
              size={wp(28)}
              color={allAgreed ? COLORS.primary : COLORS.border}
            />
            <Text style={styles.allAgreeText}>전체 동의하기</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.agreementsList}>
            {!isRecovery ? (
              <AgreementRow
                title={TERM_DOCUMENTS.service.title}
                checked={agreements.service}
                onToggle={() => toggleAgreement('service')}
                onViewPress={() => handleViewDocument('service')}
              />
            ) : null}

            <AgreementRow
              title={TERM_DOCUMENTS.privacy.title}
              checked={agreements.privacy}
              onToggle={() => toggleAgreement('privacy')}
              onViewPress={() => handleViewDocument('privacy')}
            />

            <AgreementRow
              title={TERM_DOCUMENTS.telecom.title}
              checked={agreements.telecom}
              onToggle={() => toggleAgreement('telecom')}
              onViewPress={() => handleViewDocument('telecom')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.confirmButton, isAllRequiredAgreed && styles.activeButton]}
              disabled={!isAllRequiredAgreed}
              onPress={() => {
                onClose();
                setTimeout(() => onConfirm(true), 300);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isAllRequiredAgreed && styles.activeButtonText,
                ]}
              >
                동의하고 계속하기
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AgreementRow({
  title,
  checked,
  onToggle,
  onViewPress,
}: {
  title: string;
  checked: boolean;
  onToggle: () => void;
  onViewPress: () => void;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowLeft} onPress={onToggle} activeOpacity={0.7}>
        <Ionicons
          name="checkmark"
          size={wp(24)}
          color={checked ? COLORS.primary : COLORS.border}
          style={styles.checkIcon}
        />
        <Text style={styles.rowText}>{title}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} onPress={onViewPress}>
        <Text style={styles.viewText}>보기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(24),
    borderTopRightRadius: wp(24),
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(28),
  },
  title: {
    fontSize: fp(22),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  closeButton: {
    padding: wp(4),
  },
  allAgreeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: wp(16),
    borderRadius: wp(12),
    marginBottom: hp(24),
  },
  allAgreeText: {
    fontSize: fp(18),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
    marginLeft: wp(12),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: hp(24),
  },
  agreementsList: {
    gap: hp(20),
    marginBottom: hp(40),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: wp(12),
  },
  rowText: {
    fontSize: fp(16),
    fontFamily: FONTS.medium,
    color: '#4B5563',
    flex: 1,
  },
  viewButton: {
    padding: wp(4),
    paddingLeft: wp(12),
  },
  viewText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    width: '100%',
    marginTop: hp(10),
  },
  confirmButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: wp(30),
    paddingVertical: hp(18),
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonText: {
    fontSize: fp(20),
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});
