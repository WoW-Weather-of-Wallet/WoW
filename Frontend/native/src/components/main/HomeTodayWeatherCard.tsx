import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp } from '../../constants/theme';
import SunnyIcon from '../../../assets/imgs/weather/SunnyIcon';
import CloudyIcon from '../../../assets/imgs/weather/CloudyIcon';
import OvercastIcon from '../../../assets/imgs/weather/OvercastIcon';
import RainIcon from '../../../assets/imgs/weather/RainIcon';
import HeavyRainIcon from '../../../assets/imgs/weather/HeavyRainIcon';

/**
 * 오늘의 소비날씨를 보여주는 카드 컴포넌트입니다.
 * NativeWind를 사용하여 스타일링하며, 스토어 등에서 받아오는 데이터 대신 5개의 날씨를 랜덤으로 보여줍니다.
 */
export default function HomeTodayWeatherCard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    // 5가지 소비 날씨 조건 정의 (임시 랜덤 표출)
    const weathers = [
      { type: '맑음', hint: '지출 관리의 정석! 맑은 날씨가 계속될 거예요.', icon: SunnyIcon },
      { type: '구름', hint: '구름 낀 날씨네요. 조금만 더 신경 쓰면 맑아질 거예요.', icon: CloudyIcon },
      { type: '흐림', hint: '흐린 날씨예요. 불필요한 지출이 없는지 확인해 보세요.', icon: OvercastIcon },
      { type: '비', hint: '비가 내리고 있어요! 꼭 필요한 지출만 하는 것이 좋겠어요.', icon: RainIcon },
      { type: '폭우', hint: '폭우 경보! 우산(비상금)이 젖기 전에 지출을 멈춰주세요!', icon: HeavyRainIcon },
    ];
    const randomIndex = Math.floor(Math.random() * weathers.length);
    setWeatherData(weathers[randomIndex]);
  }, []);

  // 오늘 날짜 및 요일 구하기
  const today = new Date();
  const dateString = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayString = `${dayNames[today.getDay()]}요일`;

  if (!weatherData) return null;

  const WeatherIcon = weatherData.icon;

  return (
    <View className="mb-4 overflow-hidden rounded-3xl bg-primary shadow-sm">
      {/* 카드 내부 배경 (그라데이션 느낌을 위한 불투명도 조절) */}
      <View className="bg-primary-light/10 p-5">
        <View className="flex-row items-center">
          {/* 소비 날씨 이미지 커스텀 아이콘 (왼쪽 배치) */}
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <WeatherIcon size={wp(36)} color="#FFFFFF" />
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-white/80">오늘의 소비날씨</Text>
              <Text className="text-sm font-semibold text-white/70">{dateString} {dayString}</Text>
            </View>
            <View className="mt-1 flex-row items-baseline">
              <Text className="text-3xl font-bold text-white">
                {weatherData.type}
              </Text>
            </View>
          </View>
        </View>

        {/* 하단 힌트 영역 */}
        <View className="mt-4 flex-row items-center rounded-xl bg-white/10 p-3">
          <TouchableOpacity 
            onPress={() => setModalVisible(true)} 
            className="p-1 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={wp(18)} color="white" />
          </TouchableOpacity>
          <Text className="ml-2 flex-1 text-sm text-white/90" numberOfLines={2}>
            {weatherData.hint}
          </Text>
        </View>
      </View>

      {/* 정보 제공용 모달 추가 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 items-center justify-center bg-black/50 p-6"
          onPress={() => setModalVisible(false)}
        >
          <Pressable className="w-full rounded-3xl bg-white p-6 shadow-lg">
            <Text className="text-xl font-bold text-gray-800 mb-2">소비날씨란?</Text>
            <Text className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
              최근 3개월 지출 평균과 이번 달의 실시간 지출을 비교하여 하루의 날씨로 표현합니다!
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 items-center justify-center"><SunnyIcon size={24} color="#F59E0B" /></View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-800 text-base">맑음</Text>
                  <Text className="text-xs text-gray-400">최근 평균 대비 <Text className="text-gray-600 font-semibold">10% 이하</Text></Text>
                </View>
              </View>
              <View className="flex-row items-center mb-3">
                <View className="w-10 items-center justify-center"><CloudyIcon size={24} color="#94A3B8" /></View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-800 text-base">구름</Text>
                  <Text className="text-xs text-gray-400">최근 평균 대비 <Text className="text-gray-600 font-semibold">10~20%</Text></Text>
                </View>
              </View>
              <View className="flex-row items-center mb-3">
                <View className="w-10 items-center justify-center"><OvercastIcon size={24} color="#64748B" /></View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-800 text-base">흐림</Text>
                  <Text className="text-xs text-gray-400">최근 평균 대비 <Text className="text-gray-600 font-semibold">20~30%</Text></Text>
                </View>
              </View>
              <View className="flex-row items-center mb-3">
                <View className="w-10 items-center justify-center"><RainIcon size={24} color="#3B82F6" /></View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-800 text-base">비</Text>
                  <Text className="text-xs text-gray-400">최근 평균 대비 <Text className="text-gray-600 font-semibold">30~50%</Text></Text>
                </View>
              </View>
              <View className="flex-row items-center mb-3">
                <View className="w-10 items-center justify-center"><HeavyRainIcon size={24} color="#1E3A8A" /></View>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-gray-800 text-base">폭우</Text>
                  <Text className="text-xs text-gray-400">최근 평균 대비 <Text className="text-gray-600 font-semibold">50% 초과</Text></Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              className="mt-6 rounded-xl bg-primary py-4 items-center"
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text className="font-bold text-white text-base">확인</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
