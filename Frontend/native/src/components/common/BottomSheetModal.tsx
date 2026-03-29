import React, { PropsWithChildren, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
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
  const shouldPropagateSwipe = scrollable || swipeArea === 'sheet';
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

  return (
    <Modal
      isVisible={visible}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      backdropOpacity={0.5}
      backdropColor={COLORS.black}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={enableSwipeToClose ? onClose : undefined}
      swipeDirection={enableSwipeToClose ? ['down'] : undefined}
      swipeThreshold={hp(18)}
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
          paddingHorizontal: wp(20),
          paddingTop: hp(18),
          paddingBottom: insets.bottom + hp(18),
          maxHeight: '88%',
        }}
      >
        <View style={{ paddingBottom: hp(4) }}>
          {showHandle ? (
            <View
              className="self-center items-center justify-center"
              style={{
                paddingHorizontal: wp(18),
                paddingVertical: hp(10),
                marginBottom: hp(8),
              }}
            >
              <View
                style={{
                  width: wp(42),
                  height: hp(6),
                  borderRadius: RADIUS.full,
                  backgroundColor: COLORS.modalHandle,
                }}
              />
            </View>
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
                  onPress={onClose}
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
                onPress={onClose}
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

        {scrollable ? (
          <ScrollView
            ref={scrollViewRef}
            bounces={false}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
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
            contentContainerStyle={{ paddingBottom: hp(4) }}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </View>
    </Modal>
  );
}
