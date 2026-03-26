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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import {
  TERM_DOCUMENT_KEYS,
  type TermDocumentKey,
} from '../../constants/terms';
import { useTermDocuments } from '../../hooks/useTermDocuments';
import type { RootNavigationProp } from '../../types';

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
    if (!visible) return;
    setAgreements(INITIAL_AGREEMENTS);
  }, [visible]);

  const visibleKeys = useMemo(
    () =>
      isRecovery
        ? (['privacy', 'telecom'] as TermDocumentKey[])
        : TERM_DOCUMENT_KEYS,
    [isRecovery]
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
        '약관을 불러올 수 없어요',
        '지금은 약관 상세 페이지를 열 수 없어요. 잠시 후 다시 시도해 주세요.'
      );
      return;
    }

    navigation.navigate('TermsPdf', {
      title: document.title,
      url: document.url,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: COLORS.modalOverlay }}
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-[24px] bg-white"
          style={{
            paddingHorizontal: wp(24),
            paddingTop: hp(24),
            paddingBottom: insets.bottom + hp(32),
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ marginBottom: hp(28) }}
          >
            <Text
              style={{
                fontSize: fp(20),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
              }}
            >
              {isRecovery ? '필수 약관 동의' : '회원가입 약관 동의'}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: wp(4) }}>
              <Ionicons
                name="close"
                size={wp(28)}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: fp(15),
              fontFamily: FONTS.medium,
              color: COLORS.textTertiary,
              marginBottom: hp(20),
            }}
          >
            {isRecovery
              ? '본인인증 및 계정 찾기를 위해 필요한 약관에 동의해 주세요.'
              : '서비스 이용을 위해 필요한 약관에 동의해 주세요.'}
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            style={{
              backgroundColor: COLORS.gray50,
              padding: wp(16),
              borderRadius: wp(12),
              marginBottom: hp(24),
            }}
            onPress={toggleAll}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle"
              size={wp(28)}
              color={areAllVisibleTermsAgreed ? COLORS.primary : COLORS.border}
            />
            <Text
              style={{
                fontSize: fp(16),
                fontFamily: FONTS.bold,
                color: COLORS.textPrimary,
                marginLeft: wp(12),
              }}
            >
              {isRecovery ? '필수 약관 전체 동의' : '회원가입 약관 전체 동의'}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              height: 1,
              backgroundColor: COLORS.gray200,
              marginBottom: hp(24),
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: hp(320), marginBottom: hp(24) }}
            contentContainerStyle={{
              gap: hp(20),
              paddingBottom: hp(12),
            }}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text
                    style={{
                      flex: 1,
                      marginLeft: wp(12),
                      fontSize: fp(15),
                      fontFamily: FONTS.medium,
                      color: COLORS.gray600,
                    }}
                  >
                    약관 정보를 불러오고 있어요.
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

          <View className="w-full" style={{ marginTop: hp(10) }}>
            <TouchableOpacity
              className="items-center rounded-full"
              style={{
                backgroundColor: areAllVisibleTermsAgreed
                  ? COLORS.primary
                  : COLORS.gray200,
                paddingVertical: hp(18),
              }}
              disabled={!areAllVisibleTermsAgreed}
              onPress={() => {
                onClose();
                setTimeout(() => onConfirm(true), 300);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontSize: fp(18),
                  fontFamily: FONTS.bold,
                  color: areAllVisibleTermsAgreed
                    ? COLORS.white
                    : COLORS.textTertiary,
                }}
              >
                {isRecovery
                  ? '동의하고 인증하기'
                  : '동의하고 회원가입 계속하기'}
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
    <View className="flex-row items-center justify-between">
      <TouchableOpacity
        className="flex-1 flex-row items-center"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name="checkmark-circle"
          size={wp(24)}
          color={checked ? COLORS.primary : COLORS.border}
          style={{ marginRight: wp(12) }}
        />

        <View className="flex-1">
          <Text
            style={{
              fontSize: fp(15),
              fontFamily: FONTS.medium,
              color: COLORS.gray600,
              flex: 1,
            }}
          >
            {title}
          </Text>
          {required ? (
            <Text
              style={{
                marginTop: hp(4),
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.gray400,
              }}
            >
              필수
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onViewPress}
        style={{ padding: wp(4), paddingLeft: wp(12) }}
      >
        <Text
          style={{
            fontSize: fp(14),
            fontFamily: FONTS.medium,
            color: COLORS.gray400,
            textDecorationLine: 'underline',
          }}
        >
          보기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
