import React, { PropsWithChildren, useMemo, useRef, useState } from 'react';
import { PanResponder, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  COLORS,
  FONTS,
  LAYOUT,
  RADIUS,
  fp,
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
  const shouldPropagateSwipe = scrollable || swipeArea === 'sheet';
  const shouldUseSheetSwipe = enableSwipeToClose && swipeArea === 'sheet';
  const shouldUseHeaderSwipe = enableSwipeToClose && swipeArea === 'header';
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollOffsetMax, setScrollOffsetMax] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const handleScrollTo = useMemo(
    () => (params: { x?: number; y?: number; animated?: boolean }) => {
      scrollViewRef.current?.scrollTo(params);
    },
    [],
  );
  const headerPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          shouldUseHeaderSwipe
          && gestureState.dy > 6
          && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.2,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 28 || (gestureState.dy > 16 && gestureState.vy > 0.35)) {
            onClose();
          }
        },
      }),
    [onClose, shouldUseHeaderSwipe],
  );

  return (
    <Modal
      isVisible={visible}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      backdropOpacity={0.5}
      backdropColor={COLORS.black}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={shouldUseSheetSwipe ? onClose : undefined}
      swipeDirection={shouldUseSheetSwipe ? ['down'] : undefined}
      swipeThreshold={18}
      scrollTo={scrollable ? handleScrollTo : undefined}
      scrollOffset={scrollable ? scrollOffset : 0}
      scrollOffsetMax={scrollable ? scrollOffsetMax : 0}
      propagateSwipe={shouldPropagateSwipe}
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      avoidKeyboard
    >
      <View
        style={{
          backgroundColor: COLORS.background,
          borderTopLeftRadius: RADIUS.xxl,
          borderTopRightRadius: RADIUS.xxl,
          paddingHorizontal: LAYOUT.bottomSheetHorizontal,
          paddingTop: LAYOUT.bottomSheetTopPadding,
          paddingBottom: insets.bottom + LAYOUT.bottomSheetBottomPadding,
          maxHeight: '88%',
        }}
      >
        <View
          style={{ paddingBottom: LAYOUT.topDockBottomPadding }}
          {...(shouldUseHeaderSwipe ? headerPanResponder.panHandlers : {})}
        >
          {showHandle ? (
            <View
              className="self-center items-center justify-center"
              style={{
                paddingHorizontal: LAYOUT.bottomSheetHandlePaddingHorizontal,
                paddingVertical: LAYOUT.bottomSheetHandlePaddingVertical,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: LAYOUT.bottomSheetHandleWidth,
                  height: LAYOUT.bottomSheetHandleHeight,
                  borderRadius: RADIUS.full,
                  backgroundColor: COLORS.modalHandle,
                }}
              />
            </View>
          ) : null}

          {title || subtitle ? (
            <View
              className="flex-row items-start justify-between"
              style={{ gap: 12, marginBottom: LAYOUT.bottomSheetHeaderGap }}
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
                      marginTop: 6,
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
                    width: LAYOUT.bottomSheetCloseButtonSize,
                    height: LAYOUT.bottomSheetCloseButtonSize,
                    borderRadius: LAYOUT.bottomSheetCloseButtonSize / 2,
                    backgroundColor: COLORS.backgroundSecondary,
                  }}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="바텀시트 닫기"
                >
                  <Ionicons
                    name="close"
                    size={LAYOUT.bottomSheetCloseIconSize}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          ) : showCloseButton ? (
            <View className="items-end" style={{ marginBottom: 12 }}>
              <TouchableOpacity
                activeOpacity={0.86}
                className="items-center justify-center"
                style={{
                  width: LAYOUT.bottomSheetCloseButtonSize,
                  height: LAYOUT.bottomSheetCloseButtonSize,
                  borderRadius: LAYOUT.bottomSheetCloseButtonSize / 2,
                  backgroundColor: COLORS.backgroundSecondary,
                }}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="바텀시트 닫기"
              >
                <Ionicons
                  name="close"
                  size={LAYOUT.bottomSheetCloseIconSize}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {scrollable ? (
          <View style={{ flexShrink: 1, maxHeight: '100%' }}>
            <ScrollView
              ref={scrollViewRef}
              bounces={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ flexGrow: 0, flexShrink: 1 }}
              onLayout={(event) => {
                setScrollViewHeight(event.nativeEvent.layout.height);
              }}
              onContentSizeChange={(_, contentHeight) => {
                setScrollOffsetMax(Math.max(0, contentHeight - scrollViewHeight));
              }}
              onScroll={(event) => {
                setScrollOffset(event.nativeEvent.contentOffset.y);
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              {children}
            </ScrollView>
          </View>
        ) : (
          children
        )}
      </View>
    </Modal>
  );
}
