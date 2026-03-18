import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { COLORS, FONTS, fp, hp, wp } from '../../constants/theme';

type TermsPdfRouteParams = {
  TermsPdf: {
    title: string;
    url: string;
  };
};

export default function TermsPdfScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<TermsPdfRouteParams, 'TermsPdf'>>();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  const { title, url } = route.params;
  const viewerUrl = useMemo(
    () => `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`,
    [url],
  );

  const handleOpenExternally = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('열기 실패', 'PDF 링크를 열지 못했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: hp(56) + insets.top }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(24)} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity style={styles.iconButton} onPress={() => void handleOpenExternally()}>
          <Ionicons name="open-outline" size={wp(22)} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <WebView
          source={{ uri: viewerUrl }}
          startInLoadingState
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>PDF를 불러오는 중입니다.</Text>
            </View>
          )}
          onError={() => {
            setIsLoading(false);
            Alert.alert(
              '미리보기 실패',
              '앱 내 미리보기에 실패했습니다. 우측 상단 버튼으로 외부에서 열 수 있습니다.',
            );
          }}
        />

        {isLoading ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>PDF를 불러오는 중입니다.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.background,
  },
  iconButton: {
    width: wp(36),
    height: wp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: wp(12),
    fontSize: fp(16),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: hp(10),
  },
  loadingText: {
    fontSize: fp(14),
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});
