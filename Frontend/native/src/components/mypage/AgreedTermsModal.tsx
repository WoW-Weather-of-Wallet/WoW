import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, wp } from '../../constants/theme';
import { TERM_DOCUMENT_KEYS, type TermDocumentKey } from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
import { agreeTerms } from '../../services/terms';
import { extractApiErrorMessage } from '../../utils/error';
import { styles } from './AgreedTermsModal.styles';

interface AgreedTermsModalProps {
  visible: boolean;
  onClose: () => void;
}

type SelectionState = Record<TermDocumentKey, boolean>;

const INITIAL_SELECTION: SelectionState = {
  service: true,
  privacy: true,
  telecom: true,
};

export default function AgreedTermsModal({ visible, onClose }: AgreedTermsModalProps) {
  const navigation = useNavigation<any>();
  const { termList, isLoading } = useTermDocuments(visible);
  const [selectedKeys, setSelectedKeys] = useState<SelectionState>(INITIAL_SELECTION);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSelectedKeys(INITIAL_SELECTION);
  }, [visible]);

  const selectedTerms = useMemo(
    () => termList.filter((term) => selectedKeys[term.key] && term.termId != null),
    [selectedKeys, termList],
  );

  const areAllSelected = TERM_DOCUMENT_KEYS.every((key) => selectedKeys[key]);

  const handleViewDocument = (key: TermDocumentKey) => {
    const document = termList.find((term) => term.key === key);

    if (!document?.url) {
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

  const toggleAll = () => {
    const nextValue = !areAllSelected;

    setSelectedKeys({
      service: nextValue,
      privacy: nextValue,
      telecom: nextValue,
    });
  };

  const toggleSelection = (key: TermDocumentKey) => {
    setSelectedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAgreeTerms = async () => {
    if (selectedTerms.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await agreeTerms({
        agreements: selectedTerms.map((term) => ({
          termId: term.termId!,
          agreed: true,
        })),
      });

      if (response.savedCount > 0) {
        Alert.alert(
          '\uC7AC\uB3D9\uC758 \uC644\uB8CC',
          `\uC120\uD0DD\uD55C \uC57D\uAD00 ${response.savedCount}\uAC74 \uB3D9\uC758 \uAE30\uB85D\uC744 \uC800\uC7A5\uD588\uC5B4\uC694.`,
        );
      } else {
        Alert.alert(
          '\uCD5C\uC2E0 \uB3D9\uC758 \uC0C1\uD0DC',
          '\uC120\uD0DD\uD55C \uC57D\uAD00\uC740 \uC774\uBBF8 \uB3D9\uC758 \uAE30\uB85D\uC774 \uC788\uC5B4 \uCD94\uAC00 \uC800\uC7A5\uD560 \uD56D\uBAA9\uC774 \uC5C6\uC5C8\uC5B4\uC694.',
        );
      }

      onClose();
    } catch (error) {
      Alert.alert(
        '\uC57D\uAD00 \uB3D9\uC758 \uC2E4\uD328',
        extractApiErrorMessage(error, '\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>\uC57D\uAD00 \uD655\uC778 \uBC0F \uC7AC\uB3D9\uC758</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            \uD604\uC7AC \uC57D\uAD00 \uBB38\uC11C\uB97C \uD655\uC778\uD558\uACE0 \uD544\uC694\uD55C \uACBD\uC6B0 \uC120\uD0DD\uD55C \uC57D\uAD00\uC5D0 \uB300\uD574
            \uB2E4\uC2DC \uB3D9\uC758 \uAE30\uB85D\uC744 \uB0A8\uAE38 \uC218 \uC788\uC5B4\uC694.
          </Text>

          <TouchableOpacity style={styles.toolbar} activeOpacity={0.8} onPress={toggleAll}>
            <Text style={styles.toolbarText}>\uD45C\uC2DC\uB41C \uC57D\uAD00 \uC804\uCCB4 \uC120\uD0DD</Text>
            <Text style={styles.toolbarLink}>
              {areAllSelected ? '\uC804\uCCB4 \uD574\uC81C' : '\uC804\uCCB4 \uC120\uD0DD'}
            </Text>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {isLoading ? (
              <View style={styles.noticeBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.noticeText}>
                  \uC57D\uAD00 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.
                </Text>
              </View>
            ) : null}

            {termList.map((term) => (
              <TermItem
                key={term.key}
                title={term.title}
                date={term.effectiveDate}
                required={term.required}
                selected={selectedKeys[term.key]}
                onToggle={() => toggleSelection(term.key)}
                onPress={() => handleViewDocument(term.key)}
              />
            ))}

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                \uC7AC\uB3D9\uC758\uB294 \uBC84\uC804 \uAC31\uC2E0\uC774 \uC788\uAC70\uB098 \uB2E4\uC2DC \uB3D9\uC758 \uAE30\uB85D\uC744 \uB0A8\uAE30\uACE0 \uC2F6\uC744 \uB54C
                \uC4F0\uB294 \uAE30\uB2A5\uC774\uC5D0\uC694. \uC774\uBBF8 \uAC19\uC740 \uC57D\uAD00\uC5D0 \uB300\uD55C \uB3D9\uC758 \uAE30\uB85D\uC774 \uC788\uC73C\uBA74
                \uCD94\uAC00 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC544\uC694.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>\uB2EB\uAE30</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (selectedTerms.length === 0 || isSubmitting) && styles.disabledButton,
              ]}
              disabled={selectedTerms.length === 0 || isSubmitting}
              onPress={handleAgreeTerms}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    selectedTerms.length === 0 && styles.disabledButtonText,
                  ]}
                >
                  \uC120\uD0DD \uC57D\uAD00 \uC7AC\uB3D9\uC758
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TermItem({
  title,
  date,
  required,
  selected,
  onToggle,
  onPress,
}: {
  title: string;
  date: string;
  required: boolean;
  selected: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  return (
    <View style={styles.termItem}>
      <TouchableOpacity style={styles.termLeft} activeOpacity={0.7} onPress={onToggle}>
        <Ionicons
          name="checkmark-circle"
          size={wp(24)}
          color={selected ? COLORS.primary : COLORS.border}
        />
        <View style={styles.termInfo}>
          <Text style={styles.termTitle}>{title}</Text>
          <View style={styles.termMetaRow}>
            <Text style={styles.termDate}>{date || '\uC2DC\uD589 \uC815\uBCF4 \uC5C6\uC74C'}</Text>
            {required ? (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredBadgeText}>\uD544\uC218</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewBadge} activeOpacity={0.7} onPress={onPress}>
        <Text style={styles.viewText}>\uBCF4\uAE30</Text>
        <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}
