import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../types';

/**
 * useNotificationObserver
 * 앱 실행 중 알림 클릭을 감지하고 해당 페이지로 이동시킵니다.
 */
export const useNotificationObserver = () => {
  const navigation = useNavigation<RootNavigationProp>();

  useEffect(() => {
    // 1. 앱이 꺼져 있을 때 알림을 눌러서 실행된 경우 처리
    const getInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        handleNotificationResponse(response);
      }
    };

    getInitialNotification();

    // 2. 앱 실행 중(포그라운드/백그라운드) 알림을 눌렀을 때 처리
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => subscription.remove();
  }, []);

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    const action = data?.action || (data as any)?.body?.action;

    if (!action) return;

    switch (action) {
      case 'add_record':
        // 캘린더 메인 탭으로 이동하고, 'add_record' 액션 파라미터를 함께 넘깁니다.
        navigation.navigate('MainTabs', {
          screen: 'Calendar',
          params: { action: 'add_record' }
        });
        break;

      case 'calendar_main':
        // 단순 캘린더 이동
        navigation.navigate('MainTabs', {
          screen: 'Calendar'
        });
        break;

      case 'ai_feedback':
        // AI 피드백 탭으로 이동
        // Match the in-app toast behavior so both entry points land on the
        // completed monthly report instead of the intermediate home screen.
        navigation.navigate('MainTabs', {
          screen: 'AiFeedback',
          params: { screen: 'AiResult' }
        });
        break;

      default:
        console.log('[FCM] 정의되지 않은 액션:', action);
        break;
    }
  };
};
