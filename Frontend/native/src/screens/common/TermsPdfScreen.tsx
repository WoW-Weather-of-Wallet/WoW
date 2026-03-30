import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import SafeAreaHeaderLayout from '../../components/common/SafeAreaHeaderLayout';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';
import type { RootNavigationProp, RootRouteProp } from '../../types';

export default function TermsPdfScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<'TermsPdf'>>();
  const [isLoading, setIsLoading] = useState(true);

  const { title, url } = route.params;
  const viewerUrl = useMemo(
    () =>
      `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`,
    [url]
  );

  const handleOpenExternally = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        '문서를 열 수 없어요',
        'PDF를 외부 브라우저에서 열지 못했어요.'
      );
    }
  };

  return (
    <SafeAreaHeaderLayout
      containerStyle={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
      headerDockStyle={{
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
        backgroundColor: COLORS.background,
      }}
      headerContent={
        <View
          className="flex-row items-center justify-between"
          style={{
            paddingHorizontal: wp(12),
            height: hp(56),
          }}
        >
          <TouchableOpacity
            className="items-center justify-center"
            style={{ width: wp(36), height: wp(36) }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={wp(24)}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              marginHorizontal: wp(12),
              fontSize: fp(16),
              fontFamily: FONTS.bold,
              color: COLORS.textPrimary,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>

          <TouchableOpacity
            className="items-center justify-center"
            style={{ width: wp(36), height: wp(36) }}
            onPress={() => void handleOpenExternally()}
          >
            <Ionicons
              name="open-outline"
              size={wp(22)}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View
        className="flex-1"
        style={{ backgroundColor: COLORS.background }}
      >
        <WebView
          source={{ uri: viewerUrl }}
          startInLoadingState
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          renderLoading={() => (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{
                backgroundColor: COLORS.background,
                gap: hp(10),
              }}
            >
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text
                style={{
                  fontSize: fp(14),
                  fontFamily: FONTS.medium,
                  color: COLORS.textSecondary,
                }}
              >
                PDF 문서를 불러오고 있어요.
              </Text>
            </View>
          )}
          onError={() => {
            setIsLoading(false);
            Alert.alert(
              '문서를 불러올 수 없어요',
              'PDF 문서를 표시하지 못했어요. 잠시 후 다시 시도하거나 외부 브라우저로 열어 주세요.'
            );
          }}
        />

        {isLoading ? (
          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center"
            style={{
              backgroundColor: COLORS.background,
              gap: hp(10),
            }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text
              style={{
                fontSize: fp(14),
                fontFamily: FONTS.medium,
                color: COLORS.textSecondary,
              }}
            >
              PDF 문서를 불러오고 있어요.
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaHeaderLayout>
  );
}
