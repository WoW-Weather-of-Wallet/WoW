import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';
import { BASE_URL, nativeApi } from './auth';
import { useAuthStore } from '../store/authStore';

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

      // [테스트용] 엑스포 고(Expo Go) 환경에서 알림 도구 사용을 위한 토큰 출력
      const expoToken = await Notifications.getExpoPushTokenAsync();
      console.log('--- 테스트용 엑스포 토큰 시작 ---');
      console.log(expoToken.data);
      console.log('--- 테스트용 엑스포 토큰 끝 ---');


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
      
      if (method === 'POST') {
        await nativeApi.post(url, { fcmToken: token });
      } else {
        await nativeApi.delete(url, { data: { fcmToken: token } });
      }

      console.log(`[FCM] 서버 토큰 ${method === 'POST' ? '등록' : '삭제'} 완료`);
    } catch (error) {
      console.error(`[FCM] 서버 통신 실패 (${method}):`, error);
    }
  },

  /**
   * [테스트 전용] 즉시 로컬 알림을 발생시켜 캘린더 이동 로직을 확인합니다.
   */
  async testLocalNotification() {
    console.log('[fcmService] Triggering local notification for testing...');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ 가계부 작성 알림 (테스트)",
        body: "오늘의 내역을 추가하려면 클릭하세요!",
        data: { action: 'add_record' }, 
      },
      trigger: null, // 즉시 발송
    });
  },

  /**
   * 로그아웃 시 토큰 삭제
   */
  async unregisterFcmToken() {
    try {
      const tokenData = await Notifications.getDevicePushTokenAsync();
      await this.sendTokenToServer(tokenData.data, 'DELETE');
    } catch (error) {
      console.error('[FCM] 토큰 해제 실패:', error);
    }
  }
};
