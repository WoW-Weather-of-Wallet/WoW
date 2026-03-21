import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

/**
 * useNotificationObserver
 * 앱 실행 중 알림 클릭을 감지하고 해당 페이지로 이동시킵니다.
 */
export const useNotificationObserver = () => {
  const navigation = useNavigation<any>();

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
    
    // 알림 페이로드에 'action': 'add_record'가 포함된 경우 캘린더 화면으로 이동
    if (data?.action === 'add_record' || (data as any)?.body?.action === 'add_record') {
      // 캘린더 메인 탭으로 이동하고, 'add_record' 액션 파라미터를 함께 넘깁니다.
      navigation.navigate('MainTabs', {
        screen: 'Calendar',
        params: { action: 'add_record' }
      });
    }
  };
};
