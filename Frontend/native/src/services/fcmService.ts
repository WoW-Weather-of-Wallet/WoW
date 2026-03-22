import * as Notifications from 'expo-notifications'; import { Platform } from 'react-native';
import Constants from 'expo-constants'; import { nativeApi } from './auth';
import { useAuthStore } from '../store/authStore';

// Android Expo Go 환경 여부 확인 (SDK 53/54 이후 알림 기능 미지원 대응)
const IS_ANDROID_EXPO_GO = Platform.OS === 'android' && Constants.executionEnvironment ===
  'storeClient';

// 알림이 도착했을 때의 기본 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * fcmService
 * FCM 토큰 관리 및 알림 권한 처리를 담당합니다.
 */
export const fcmService = {
  /**
   * 알림 권한 요청 및 FCM 토큰 획득
   */
  async registerFcmToken(): Promise<string | null> {
    try {
      // 1. 권한 확인 및 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[FCM] 알림 권한 거부됨');
        return null;
      }

      // [P1 Fix] Android Expo Go 환경에서는 네이티브 푸시 기능을 건너뜁니다.
      if (IS_ANDROID_EXPO_GO) {
        console.log('[FCM] Android Expo Go 환경: 네이티브 푸시 등록을 건너뜁니다.');

        try {
          const expoToken = await Notifications.getExpoPushTokenAsync();
          console.log('--- 테스트용 엑스포 토큰 ---');
          console.log(expoToken.data);
        } catch (e) {
          console.log('[FCM] Expo Push Token 획득 불가');
        }
        return null;
      }

      // 2. 네이티브 FCM 토큰 가져오기
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const token = tokenData.data;

      console.log('[FCM] Native Token:', token);

      // 3. 서버에 토큰 등록
      await this.sendTokenToServer(token, 'POST');

      return token;
    } catch (error) {
      console.error('[FCM] 토큰 등록 실패:', error);
      return null;
    }
  },

  /**
   * 서버에 토큰 전송 (POST: 등록/갱신, DELETE: 삭제)
   */
  async sendTokenToServer(token: string, method: 'POST' | 'DELETE') {
    try {
      const url = '/api/v1/fcm/token';
      const accessToken = useAuthStore.getState().accessToken;

      const payload = {
        token: token,
        deviceType: Platform.OS as 'android' | 'ios', // 'android' 또는 'ios' (소문자)      
      };

      const config = accessToken ? {
        headers: { Authorization: `Bearer ${accessToken}` }
      } : {};

      if (method === 'POST') {
        await nativeApi.post(url, payload, config);
      } else {
        await nativeApi.delete(url, { data: payload, ...config });
      }

      console.log(`[FCM] 서버 토큰 ${method === 'POST' ? '등록' : '삭제'} 완료
  (${payload.deviceType})`);
    } catch (error) {
      console.error(`[FCM] 서버 통신 실패 (${method}):`, error);
    }
  },

  /**
   * 로그아웃 시 토큰 삭제
   */
  async unregisterFcmToken() {
    if (IS_ANDROID_EXPO_GO) return;

    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      await this.sendTokenToServer(tokenData.data, 'DELETE');
    } catch (error) {
      console.error('[FCM] 토큰 해제 실패:', error);
    }
  }
};