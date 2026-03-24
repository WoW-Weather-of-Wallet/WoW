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
          '재동의 완료',
          `선택한 약관 ${response.savedCount}건 동의 기록을 저장했어요.`,
        );
      } else {
        Alert.alert(
          '최신 동의 상태',
          '선택한 약관은 이미 동의 기록이 있어 추가 저장할 항목이 없었어요.',
        );
      }

      onClose();
    } catch (error) {
      Alert.alert(
        '약관 동의 실패',
        extractApiErrorMessage(error, '잠시 후 다시 시도해 주세요.'),
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
            <Text style={styles.title}>약관 확인 및 재동의</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            현재 약관 문서를 확인하고 필요한 경우 선택한 약관에 대해
            다시 동의 기록을 남길 수 있어요.
          </Text>

          <TouchableOpacity style={styles.toolbar} activeOpacity={0.8} onPress={toggleAll}>
            <Text style={styles.toolbarText}>표시된 약관 전체 선택</Text>
            <Text style={styles.toolbarLink}>
              {areAllSelected ? '전체 해제' : '전체 선택'}
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
                  약관 정보를 불러오는 중입니다.
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
                재동의는 버전 갱신이 있거나 다시 동의 기록을 남기고 싶을 때
                쓰는 기능이에요. 이미 같은 약관에 대한 동의 기록이 있으면
                추가 저장하지 않아요.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>닫기</Text>
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
                  선택 약관 재동의
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
            <Text style={styles.termDate}>{date || '시행 정보 없음'}</Text>
            {required ? (
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredBadgeText}>필수</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewBadge} activeOpacity={0.7} onPress={onPress}>
        <Text style={styles.viewText}>보기</Text>
        <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}
