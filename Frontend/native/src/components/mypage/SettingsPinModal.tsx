import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import SecureKeypad from '../../components/common/SecureKeypad';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface SettingsPinModalProps {
  visible: boolean;
  title: string;
  description: string;
  pinInput: string;
  pinError: string;
  onClose: () => void;
  onPressNumber: (digit: string) => void;
  onPressDelete: () => void;
}

export default function SettingsPinModal({
  visible,
  title,
  description,
  pinInput,
  pinError,
  onClose,
  onPressNumber,
  onPressDelete,
}: SettingsPinModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center"
        style={{ paddingHorizontal: wp(20), backgroundColor: COLORS.modalOverlaySoft }}
        onPress={onClose}
      >
        <Pressable
          style={{
            borderRadius: RADIUS.xl,
            paddingHorizontal: wp(20),
            paddingVertical: hp(20),
            gap: hp(14),
            backgroundColor: COLORS.backgroundSecondary,
          }}
          onPress={(event) => event.stopPropagation()}
        >
          <Text
            style={{
              fontSize: fp(18),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              marginBottom: hp(4),
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: fp(13),
              lineHeight: fp(19),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            {description}
          </Text>

          <View className="flex-row justify-center" style={{ gap: wp(10), marginTop: hp(4) }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={`settings-pin-dot-${index}`}
                style={{
                  width: wp(12),
                  height: wp(12),
                  borderRadius: wp(6),
                  backgroundColor: index < pinInput.length ? COLORS.primary : COLORS.gray100,
                }}
              />
            ))}
          </View>

          {pinError ? (
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.error,
                marginTop: hp(8),
              }}
            >
              {pinError}
            </Text>
          ) : null}

          <SecureKeypad onPressNumber={onPressNumber} onPressDelete={onPressDelete} />

          <View className="flex-row justify-end" style={{ gap: wp(10), marginTop: hp(8) }}>
            <TouchableOpacity
              onPress={onClose}
              className="items-center justify-center"
              style={{
                paddingHorizontal: wp(14),
                paddingVertical: hp(10),
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.gray200,
              }}
            >
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.textPrimary,
                }}
              >
                취소
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
