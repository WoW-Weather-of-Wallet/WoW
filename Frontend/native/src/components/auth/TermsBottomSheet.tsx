import React, { useEffect, useMemo, useState } from 'react';
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
import { TERM_DOCUMENT_KEYS, type TermDocumentKey } from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
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
  const navigation = useNavigation<any>();
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
        '\uBB38\uC11C \uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328',
        '\uC57D\uAD00 \uBB38\uC11C\uB97C \uC544\uC9C1 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.',
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
                ? '\uBCF8\uC778\uD655\uC778 \uC57D\uAD00 \uB3D9\uC758'
                : '\uD544\uC218 \uC57D\uAD00 \uB3D9\uC758'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.rowText, { color: COLORS.textTertiary, marginBottom: hp(20) }]}>
            {isRecovery
              ? '\uBCF8\uC778\uD655\uC778\uACFC \uACC4\uC815 \uCC3E\uAE30 \uC9C4\uD589\uC744 \uC704\uD574 \uD544\uC694\uD55C \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD574 \uC8FC\uC138\uC694.'
              : '\uC778\uC99D\uBC88\uD638 \uC694\uCCAD \uC804\uC5D0 \uD544\uC218 \uC57D\uAD00 \uC804\uCCB4 \uB3D9\uC758\uAC00 \uD544\uC694\uD574\uC694.'}
          </Text>

          <TouchableOpacity style={styles.allAgreeContainer} onPress={toggleAll} activeOpacity={0.7}>
            <Ionicons
              name="checkmark-circle"
              size={wp(28)}
              color={areAllVisibleTermsAgreed ? COLORS.primary : COLORS.border}
            />
            <Text style={styles.allAgreeText}>
              {isRecovery
                ? '\uD45C\uC2DC\uB41C \uC57D\uAD00 \uC804\uCCB4 \uB3D9\uC758'
                : '\uD544\uC218 \uC57D\uAD00 \uC804\uCCB4 \uB3D9\uC758'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.agreementsList}>
            {isLoading ? (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.rowText}>
                    \uC57D\uAD00 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.
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
          </View>

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
                  ? '\uB3D9\uC758\uD558\uACE0 \uC778\uC99D \uACC4\uC18D\uD558\uAE30'
                  : '\uD544\uC218 \uC57D\uAD00\uC5D0 \uB3D9\uC758\uD558\uACE0 \uACC4\uC18D\uD558\uAE30'}
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
              \uD544\uC218
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} onPress={onViewPress}>
        <Text style={styles.viewText}>\uBCF4\uAE30</Text>
      </TouchableOpacity>
    </View>
  );
}
