import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { styles } from './TermsPdfScreen.styles';
import SafeAreaHeaderLayout from '../../components/common/SafeAreaHeaderLayout';
import { COLORS, wp } from '../../constants/theme';
import type { RootNavigationProp, RootRouteProp } from '../../types';

export default function TermsPdfScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<RootRouteProp<'TermsPdf'>>();
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
    <SafeAreaHeaderLayout
      containerStyle={styles.container}
      headerDockStyle={styles.headerDock}
      headerContent={
        <View style={styles.header}>
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
      }
    >

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
    </SafeAreaHeaderLayout>
  );
}


