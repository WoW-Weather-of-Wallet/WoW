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
import { COLORS, FONTS, RADIUS, fp, hp, wp } from '../../constants/theme';
import { TERM_DOCUMENT_KEYS, type TermDocumentKey } from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
import { agreeTerms } from '../../services/terms';
import type { RootNavigationProp } from '../../types';
import { extractApiErrorMessage } from '../../utils/error';

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
  const navigation = useNavigation<RootNavigationProp>();
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
        '아직 문서를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
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
          '동의 완료',
          `선택한 약관 ${response.savedCount}건의 동의 기록을 저장했어요.`,
        );
      } else {
        Alert.alert(
          '최신 동의 상태',
          '선택한 약관은 이미 최신 버전 기준으로 동의 기록이 있어 추가 저장하지 않았어요.',
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
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: COLORS.modalOverlaySoft }}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
            paddingHorizontal: wp(24),
            paddingTop: hp(24),
            paddingBottom: hp(40),
            maxHeight: '88%',
            backgroundColor: COLORS.backgroundSecondary,
          }}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ marginBottom: hp(16) }}
          >
            <Text
              style={{
                fontSize: fp(22),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
              }}
            >
              약관 확인 및 동의
            </Text>

            <TouchableOpacity onPress={onClose} style={{ padding: wp(4) }}>
              <Ionicons name="close" size={wp(28)} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: fp(14),
              fontFamily: FONTS.medium,
              color: COLORS.textTertiary,
              lineHeight: fp(22),
              marginBottom: hp(18),
            }}
          >
            현재 약관 문서를 확인하고 필요한 경우 선택한 약관에 대해 다시 동의 기록을
            남길 수 있어요.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleAll}
            className="flex-row items-center justify-between"
            style={{
              borderRadius: RADIUS.md,
              paddingHorizontal: wp(16),
              paddingVertical: hp(14),
              marginBottom: hp(12),
              backgroundColor: COLORS.primary50,
            }}
          >
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.semiBold,
                color: COLORS.textPrimary,
              }}
            >
              표시된 약관 전체 선택
            </Text>
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.bold,
                color: COLORS.primary,
              }}
            >
              {areAllSelected ? '전체 해제' : '전체 선택'}
            </Text>
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: hp(16) }}
          >
            {isLoading ? (
              <View
                style={{
                  borderRadius: RADIUS.md,
                  padding: wp(16),
                  marginTop: hp(8),
                  backgroundColor: COLORS.primary50,
                }}
              >
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text
                  style={{
                    fontSize: fp(13),
                    fontFamily: FONTS.medium,
                    color: COLORS.textTertiary,
                    lineHeight: fp(20),
                    marginTop: hp(10),
                  }}
                >
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

            <View
              style={{
                borderRadius: RADIUS.md,
                padding: wp(16),
                marginTop: hp(8),
                backgroundColor: COLORS.primary50,
              }}
            >
              <Text
                style={{
                  fontSize: fp(13),
                  fontFamily: FONTS.medium,
                  color: COLORS.textTertiary,
                  lineHeight: fp(20),
                }}
              >
                동의는 버전 갱신 등으로 다시 동의 기록이 필요할 때 사용하는 기능이에요.
                이미 같은 약관 버전에 대한 동의 기록이 있으면 추가 저장하지 않아요.
              </Text>
            </View>
          </ScrollView>

          <View className="flex-row" style={{ gap: wp(12), marginTop: hp(24) }}>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 items-center"
              style={{
                borderRadius: RADIUS.full,
                paddingVertical: hp(18),
                backgroundColor: COLORS.gray100,
              }}
            >
              <Text
                style={{
                  fontSize: fp(18),
                  fontFamily: FONTS.bold,
                  color: COLORS.textPrimary,
                }}
              >
                닫기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={selectedTerms.length === 0 || isSubmitting}
              onPress={handleAgreeTerms}
              className="items-center"
              style={{
                flex: 1.4,
                borderRadius: RADIUS.full,
                paddingVertical: hp(18),
                backgroundColor:
                  selectedTerms.length === 0 || isSubmitting
                    ? COLORS.gray200
                    : COLORS.primary,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text
                  style={{
                    fontSize: fp(18),
                    fontFamily: FONTS.bold,
                    color:
                      selectedTerms.length === 0 ? COLORS.textSecondary : COLORS.white,
                  }}
                >
                  선택 약관 동의
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
    <View
      className="flex-row items-center justify-between"
      style={{
        paddingVertical: hp(16),
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separatorBorder,
        gap: wp(12),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        className="flex-1 flex-row items-center"
        style={{ gap: wp(12) }}
      >
        <Ionicons
          name="checkmark-circle"
          size={wp(24)}
          color={selected ? COLORS.primary : COLORS.border}
        />

        <View className="flex-1" style={{ gap: hp(4) }}>
          <Text
            style={{
              fontSize: fp(16),
              fontFamily: FONTS.semiBold,
              color: COLORS.textPrimary,
            }}
          >
            {title}
          </Text>

          <View className="flex-row items-center" style={{ gap: wp(8) }}>
            <Text
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.medium,
                color: COLORS.textTertiary,
              }}
            >
              {date || '시행 정보 없음'}
            </Text>

            {required ? (
              <View
                style={{
                  paddingHorizontal: wp(8),
                  paddingVertical: hp(3),
                  borderRadius: RADIUS.sm,
                  backgroundColor: COLORS.primarySoft,
                }}
              >
                <Text
                  style={{
                    fontSize: fp(11),
                    fontFamily: FONTS.bold,
                    color: COLORS.primary,
                  }}
                >
                  필수
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row items-center"
        style={{
          gap: wp(4),
          paddingHorizontal: wp(10),
          paddingVertical: hp(6),
          borderRadius: RADIUS.sm,
          backgroundColor: COLORS.gray200,
        }}
      >
        <Text
          style={{
            fontSize: fp(12),
            fontFamily: FONTS.semiBold,
            color: COLORS.textSecondary,
          }}
        >
          보기
        </Text>
        <Ionicons name="chevron-forward" size={wp(14)} color={COLORS.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}
