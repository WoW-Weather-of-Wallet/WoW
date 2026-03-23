import './src/styles/global.css';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';

// 폰트 로딩 완료 전까지 네이티브 스플래시 유지
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('./assets/fonts/Pretendard/public/static/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('./assets/fonts/Pretendard/public/static/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('./assets/fonts/Pretendard/public/static/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard/public/static/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('./assets/fonts/Pretendard/public/static/Pretendard-ExtraBold.otf'),
    'Pretendard-Black': require('./assets/fonts/Pretendard/public/static/Pretendard-Black.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
