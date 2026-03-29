import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  COLORS,
  FONTS,
  RADIUS,
  fp,
  hp,
  wp,
} from '../../constants/theme';

interface BottomSheetModalProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
  scrollable?: boolean;
  enableSwipeToClose?: boolean;
  showCloseButton?: boolean;
  swipeArea?: 'header' | 'sheet';
}

export default function BottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  showHandle = true,
  scrollable = true,
  enableSwipeToClose = true,
  showCloseButton = false,
  swipeArea = 'header',
  children,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const hiddenOffset = screenHeight;
  const translateY = useRef(new Animated.Value(hiddenOffset)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(hiddenOffset);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    }
  }, [hiddenOffset, translateY, visible]);

  const animateClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: hiddenOffset,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        translateY.setValue(hiddenOffset);
        onClose();
      }
    });
  }, [hiddenOffset, onClose, translateY]);

  const restorePosition = useCallback(() => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          enableSwipeToClose &&
          gestureState.dy > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          translateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > hp(12) || gestureState.vy > 1.15) {
            animateClose();
            return;
          }

          restorePosition();
        },
        onPanResponderTerminate: restorePosition,
      }),
    [animateClose, enableSwipeToClose, restorePosition, translateY],
  );

  const headerBlock = (
    <View
      style={{ paddingBottom: hp(4) }}
      {...(enableSwipeToClose && swipeArea === 'header' ? panResponder.panHandlers : {})}
    >
      {showHandle ? (
        <View
          className="self-center"
          style={{
            width: wp(42),
            height: hp(6),
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.modalHandle,
            marginBottom: hp(18),
          }}
        />
      ) : null}

      {title || subtitle ? (
        <View
          className="flex-row items-start justify-between"
          style={{ gap: wp(12), marginBottom: hp(18) }}
        >
          <View className="flex-1">
            {title ? (
              <Text
                style={{
                  fontSize: fp(24),
                  fontFamily: FONTS.bold,
                  color: COLORS.textPrimary,
                }}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={{
                  marginTop: hp(6),
                  fontSize: fp(14),
                  fontFamily: FONTS.medium,
                  color: COLORS.textSecondary,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          {showCloseButton ? (
            <TouchableOpacity
              activeOpacity={0.86}
              className="items-center justify-center"
              style={{
                width: wp(34),
                height: wp(34),
                borderRadius: wp(17),
                backgroundColor: COLORS.backgroundSecondary,
              }}
              onPress={animateClose}
              accessibilityRole="button"
              accessibilityLabel="바텀시트 닫기"
            >
              <Ionicons
                name="close"
                size={wp(18)}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : showCloseButton ? (
        <View className="items-end" style={{ marginBottom: hp(12) }}>
          <TouchableOpacity
            activeOpacity={0.86}
            className="items-center justify-center"
            style={{
              width: wp(34),
              height: wp(34),
              borderRadius: wp(17),
              backgroundColor: COLORS.backgroundSecondary,
            }}
            onPress={animateClose}
            accessibilityRole="button"
            accessibilityLabel="바텀시트 닫기"
          >
            <Ionicons
              name="close"
              size={wp(18)}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={animateClose}
      accessibilityViewIsModal
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: COLORS.modalOverlay }}
      >
        <Pressable
          className="w-full flex-1"
          onPress={animateClose}
          accessibilityRole="button"
          accessibilityLabel="바텀시트 배경 닫기"
        />
        <Animated.View
          {...(enableSwipeToClose && swipeArea === 'sheet' ? panResponder.panHandlers : {})}
          style={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: RADIUS.xxl,
            borderTopRightRadius: RADIUS.xxl,
            paddingHorizontal: wp(20),
            paddingTop: hp(18),
            paddingBottom: insets.bottom + hp(18),
            maxHeight: '88%',
            transform: [{ translateY }],
          }}
        >
          {headerBlock}

          {scrollable ? (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp(4) }}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
