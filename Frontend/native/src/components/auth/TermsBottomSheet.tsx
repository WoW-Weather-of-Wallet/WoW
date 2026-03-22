import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, hp, wp } from '../../constants/theme';
import { TermDocumentKey } from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
import { styles } from './TermsBottomSheet.styles';

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
  const { documents, isLoading } = useTermDocuments(visible);
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
    const document = documents[key];

    if (!document.url) {
      Alert.alert('불러오기 실패', '약관 문서를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
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
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
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
            {isLoading ? (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.rowText}>약관 정보를 불러오는 중입니다.</Text>
                </View>
              </View>
            ) : null}

            {!isRecovery ? (
              <AgreementRow
                title={documents.service.title}
                checked={agreements.service}
                onToggle={() => toggleAgreement('service')}
                onViewPress={() => handleViewDocument('service')}
              />
            ) : null}

            <AgreementRow
              title={documents.privacy.title}
              checked={agreements.privacy}
              onToggle={() => toggleAgreement('privacy')}
              onViewPress={() => handleViewDocument('privacy')}
            />

            <AgreementRow
              title={documents.telecom.title}
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
