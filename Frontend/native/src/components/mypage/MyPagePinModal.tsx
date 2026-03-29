import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import SecureKeypad from '../common/SecureKeypad';
import { COLORS, FONTS, fp, hp, RADIUS, wp } from '../../constants/theme';

interface MyPagePinModalProps {
  visible: boolean;
  title: string;
  description: string;
  pinInput: string;
  pinError: string;
  onClose: () => void;
  onPressNumber: (digit: string) => void;
  onPressDelete: () => void;
}

export default function MyPagePinModal({
  visible,
  title,
  description,
  pinInput,
  pinError,
  onClose,
  onPressNumber,
  onPressDelete,
}: MyPagePinModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center"
        style={{ paddingHorizontal: wp(20), backgroundColor: COLORS.modalOverlaySoft }}
        onPress={onClose}
      >
        <Pressable
          style={{
            borderRadius: RADIUS.xl,
            padding: wp(20),
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
              marginBottom: hp(6),
            }}
          >
            {title}
          </Text>

          <Text
            className="text-center"
            style={{
              fontSize: fp(13),
              fontFamily: FONTS.medium,
              color: COLORS.textSecondary,
            }}
          >
            {description}
          </Text>

          <View
            className="flex-row justify-center"
            style={{ gap: wp(10), marginVertical: hp(10) }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={`mypage-pin-dot-${index}`}
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
              className="text-center"
              style={{
                fontSize: fp(13),
                fontFamily: FONTS.medium,
                color: COLORS.error,
              }}
            >
              {pinError}
            </Text>
          ) : null}

          <SecureKeypad onPressNumber={onPressNumber} onPressDelete={onPressDelete} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
