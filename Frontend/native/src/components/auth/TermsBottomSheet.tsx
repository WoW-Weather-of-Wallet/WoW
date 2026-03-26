import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, hp, wp } from '../../constants/theme';
import { TERM_DOCUMENT_KEYS, type TermDocumentKey } from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
import type { RootNavigationProp } from '../../types';
import { styles } from './TermsBottomSheet.styles';

interface TermsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (termsAgreed: boolean) => void;
  flow?: 'FindId' | 'FindPw' | string;
}

type AgreementsState = Record<TermDocumentKey, boolean>;

const INITIAL_AGREEMENTS: AgreementsState = {
  service: false,
  privacy: false,
  telecom: false,
};

export default function TermsBottomSheet({
  visible,
  onClose,
  onConfirm,
  flow,
}: TermsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { documents, isLoading } = useTermDocuments(visible);
  const [agreements, setAgreements] = useState<AgreementsState>(INITIAL_AGREEMENTS);

  const isRecovery = flow === 'FindId' || flow === 'FindPw';

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAgreements(INITIAL_AGREEMENTS);
  }, [visible]);

  const visibleKeys = useMemo(
    () => (isRecovery ? (['privacy', 'telecom'] as TermDocumentKey[]) : TERM_DOCUMENT_KEYS),
    [isRecovery],
  );

  const areAllVisibleTermsAgreed = visibleKeys.every((key) => agreements[key]);

  const toggleAll = () => {
    const nextValue = !areAllVisibleTermsAgreed;
    setAgreements((prev) => ({
      ...prev,
      ...Object.fromEntries(visibleKeys.map((key) => [key, nextValue])),
    }));
  };

  const toggleAgreement = (key: TermDocumentKey) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleViewDocument = (key: TermDocumentKey) => {
    const document = documents[key];

    if (!document.url) {
      Alert.alert(
        '문서 불러오기 실패',
        '약관 문서를 아직 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
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
            <Text style={styles.title}>
              {isRecovery
                ? '본인확인 약관 동의'
                : '필수 약관 동의'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.rowText, { color: COLORS.textTertiary, marginBottom: hp(20) }]}>
            {isRecovery
              ? '본인확인과 계정 찾기 진행을 위해 필요한 약관에 동의해 주세요.'
              : '인증번호 요청 전에 필수 약관 전체 동의가 필요해요.'}
          </Text>

          <TouchableOpacity style={styles.allAgreeContainer} onPress={toggleAll} activeOpacity={0.7}>
            <Ionicons
              name="checkmark-circle"
              size={wp(28)}
              color={areAllVisibleTermsAgreed ? COLORS.primary : COLORS.border}
            />
            <Text style={styles.allAgreeText}>
              {isRecovery
                ? '표시된 약관 전체 동의'
                : '필수 약관 전체 동의'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <ScrollView
            style={styles.agreementsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.agreementsListContent}
          >
            {isLoading ? (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.rowText}>
                    약관 정보를 불러오는 중입니다.
                  </Text>
                </View>
              </View>
            ) : null}

            {visibleKeys.map((key) => (
              <AgreementRow
                key={key}
                title={documents[key].title}
                checked={agreements[key]}
                required={documents[key].required}
                onToggle={() => toggleAgreement(key)}
                onViewPress={() => handleViewDocument(key)}
              />
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.confirmButton, areAllVisibleTermsAgreed && styles.activeButton]}
              disabled={!areAllVisibleTermsAgreed}
              onPress={() => {
                onClose();
                setTimeout(() => onConfirm(true), 300);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  areAllVisibleTermsAgreed && styles.activeButtonText,
                ]}
              >
                {isRecovery
                  ? '동의하고 인증 계속하기'
                  : '필수 약관에 동의하고 인증 계속하기'}
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
  required,
  onToggle,
  onViewPress,
}: {
  title: string;
  checked: boolean;
  required: boolean;
  onToggle: () => void;
  onViewPress: () => void;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowLeft} onPress={onToggle} activeOpacity={0.7}>
        <Ionicons
          name="checkmark-circle"
          size={wp(24)}
          color={checked ? COLORS.primary : COLORS.border}
          style={styles.checkIcon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowText}>{title}</Text>
          {required ? (
            <Text style={[styles.viewText, { textDecorationLine: 'none', marginTop: hp(4) }]}>
              필수
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} onPress={onViewPress}>
        <Text style={styles.viewText}>보기</Text>
      </TouchableOpacity>
    </View>
  );
}
