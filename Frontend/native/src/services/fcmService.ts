import * as Notifications from 'expo-notifications'; 
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants'; 
import { nativeApi } from './auth';
import { navigationRef } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';

// Android Expo Go 환경 여부 확인 (SDK 53/54 이후 알림 기능 미지원 대응)
const IS_ANDROID_EXPO_GO = Platform.OS === 'android' && Constants.executionEnvironment ===
  'storeClient';

// 알림이 도착했을 때의 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // [UX 개선] 앱이 포그라운드(실행 중)일 때는 시스템 알림 팝업을 띄우지 않습니다.
    // 대신 UI(토스트, 배너 등)를 통해 알림 내용을 처리하도록 유도합니다.
    // (사용자가 의도적으로 앱을 사용 중일 때 알림이 화면을 가리는 현상을 방지)
    return {
      shouldShowAlert: true,  // 시스템 알림 팝업 허용
      shouldPlaySound: true,  // 소리 재생 (진동 포함)
      shouldSetBadge: true,
      shouldShowBanner: true, // 상단 배너 표시
      shouldShowList: true,   // 알림 센터 목록 표시
    };
  },
});

/**
 * fcmService
 * FCM 토큰 관리 및 알림 권한 처리를 담당합니다.
 */
export const fcmService = {
  /**
   * [P2] 알림 채널 생성 (Android 전용)
   * 소리, 진동, 팝업 알림을 위해 시스템에 채널을 등록합니다.
   */
  async createNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-reminder', {
        name: '일일 지출 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        showBadge: true,
      });
    }
  },

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
        console.log('[FCM] Android Expo Go 환경: 네이티브 푸시 등록을 건너뜜');
        return null;
      }

      // 2. 네이티브 FCM 토큰 가져오기
      const tokenData = await Notifications.getDevicePushTokenAsync();
      const token = tokenData.data;

      // 3. 서버에 토큰 등록
      await this.sendTokenToServer(token, 'POST');

      // 4. 알림 채널 생성
      await this.createNotificationChannels();

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
   * [P2] 알림 관련 전방(Foreground) 리스너 초기화
   * 앱 실행 중 알림 수신 및 토큰 갱신 이벤트를 감시합니다.
   */
  initForegroundListeners() {
    // 1. 알림 수신 리스너 (앱 실행 중 알림 도착 시)
    Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;
      const action = data?.action;

      console.log('[FCM] Foreground notification received:', action);

      // A. AI 분석 완료 알림인 경우
      // 프리미엄 애니메이션 배너(AiNotification)를 띄우기 위해 저장소 상태만 변경합니다.
      if (action === 'ai_feedback') {
        const { setSuccess } = require('../store/aiStore').useAiStore.getState();
        setSuccess({ completedAt: new Date().toISOString(), fromPush: true });
      }
      
      // B. 그 외 주요 알림 (지출 추가, 캘린더 이동 등)
      // 시스템 알림(shouldShowAlert: true)을 통해 사용자에게 이미 노출되므로,
      // 별도의 앱 내 Alert(모달) 호출은 일관성을 위해 제거합니다.
    });

    // 2. 토큰 갱신 리스너 (구글이 기기 토큰을 강제로 변경했을 때)
    // 서비스 런타임에 토큰이 바뀌어도 서버가 즉시 알 수 있도록 업데이트합니다.
    Notifications.addPushTokenListener(tokenData => {
      const newToken = tokenData.data;
      this.sendTokenToServer(newToken, 'POST');
    });
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
  },
};