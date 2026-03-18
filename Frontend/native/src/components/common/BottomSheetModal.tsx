import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { COLORS, wp, hp } from '../../constants/theme';
import { styles } from './BottomSheetModal.styles';

interface BottomSheetModalProps extends PropsWithChildren {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
  scrollable?: boolean;
  enableSwipeToClose?: boolean;
  showCloseButton?: boolean;
}

/**
 * BottomSheetModal
 * 메인/캘린더에서 반복되는 하단 시트 레이아웃을 공통화합니다.
 * 닫기 버튼과 핸들, 기본 패딩을 맞춰 모달 경험을 통일합니다.
 */
export default function BottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  showHandle = true,
  scrollable = true,
  enableSwipeToClose = true,
  showCloseButton = true,
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
      style={styles.dragArea}
      {...(enableSwipeToClose ? panResponder.panHandlers : {})}
    >
      {showHandle ? <View style={styles.handle} /> : null}

      {title || subtitle ? (
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {showCloseButton ? (
            <TouchableOpacity activeOpacity={0.86} style={styles.closeButton} onPress={animateClose}>
              <Ionicons name="close" size={wp(18)} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : showCloseButton ? (
        <View style={styles.closeOnlyRow}>
          <TouchableOpacity activeOpacity={0.86} style={styles.closeButton} onPress={animateClose}>
            <Ionicons name="close" size={wp(18)} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={animateClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={animateClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + hp(18),
              transform: [{ translateY }],
            },
          ]}
        >
          {headerBlock}

          {scrollable ? (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
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


