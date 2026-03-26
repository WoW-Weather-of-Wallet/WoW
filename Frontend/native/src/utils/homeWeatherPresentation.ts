import type { ComponentType } from 'react';

import CloudyIcon from '../../assets/imgs/weather/CloudyIcon';
import HeavyRainIcon from '../../assets/imgs/weather/HeavyRainIcon';
import OvercastIcon from '../../assets/imgs/weather/OvercastIcon';
import RainIcon from '../../assets/imgs/weather/RainIcon';
import SunnyIcon from '../../assets/imgs/weather/SunnyIcon';

type WeatherIconComponent = ComponentType<{ size?: number; color?: string }>;

export interface HomeWeatherGuideItem {
  type: string;
  detail: string;
  icon: WeatherIconComponent;
  color: string;
}

export interface HomeWeatherVisual {
  type: string;
  hint: string;
  icon: WeatherIconComponent;
  color: string;
}

export const HOME_WEATHER_GUIDE: HomeWeatherGuideItem[] = [
  { type: '맑음', detail: '최근 평균 대비 10% 이하', icon: SunnyIcon, color: '#F59E0B' },
  { type: '구름', detail: '최근 평균 대비 10~20%', icon: CloudyIcon, color: '#FFFFFF' },
  { type: '흐림', detail: '최근 평균 대비 20~30%', icon: OvercastIcon, color: '#64748B' },
  { type: '비', detail: '최근 평균 대비 30~50%', icon: RainIcon, color: '#1AABFF' },
  { type: '폭우', detail: '최근 평균 대비 50% 초과', icon: HeavyRainIcon, color: '#1E3A8A' },
];

export const buildHomeWeatherVisual = ({
  weatherName,
  description,
  iconCode,
  isLoading,
}: {
  weatherName?: string | null;
  description?: string | null;
  iconCode?: string | null;
  isLoading?: boolean;
}): HomeWeatherVisual => {
  if (isLoading) {
    return {
      type: '불러오는 중',
      hint: '오늘 소비 흐름을 확인하고 있어요.',
      icon: CloudyIcon,
      color: '#FFFFFF',
    };
  }

  return (
    resolveWeatherVisual(iconCode, weatherName, description) ?? {
      type: '-',
      hint: '-',
      icon: CloudyIcon,
      color: '#FFFFFF',
    }
  );
};

function resolveWeatherVisual(
  iconCode?: string | null,
  weatherName?: string | null,
  description?: string | null,
): HomeWeatherVisual | null {
  if (!iconCode && !weatherName && !description) {
    return null;
  }

  const normalizedCode = iconCode?.toLowerCase() ?? '';
  const normalizedName = weatherName?.trim() ?? '';
  const hint = description?.trim() || '-';

  if (normalizedCode.includes('heavy') || normalizedName.includes('폭우')) {
    return {
      type: normalizedName || '폭우',
      hint,
      icon: HeavyRainIcon,
      color: '#1E3A8A',
    };
  }

  if (normalizedCode.includes('rain') || normalizedName.includes('비')) {
    return {
      type: normalizedName || '비',
      hint,
      icon: RainIcon,
      color: '#1AABFF',
    };
  }

  if (
    normalizedCode.includes('overcast') ||
    normalizedCode.includes('gray') ||
    normalizedName.includes('흐림')
  ) {
    return {
      type: normalizedName || '흐림',
      hint,
      icon: OvercastIcon,
      color: '#64748B',
    };
  }

  if (normalizedCode.includes('cloud') || normalizedName.includes('구름')) {
    return {
      type: normalizedName || '구름',
      hint,
      icon: CloudyIcon,
      color: '#FFFFFF',
    };
  }

  if (
    normalizedCode.includes('sun') ||
    normalizedCode.includes('clear') ||
    normalizedName.includes('맑음')
  ) {
    return {
      type: normalizedName || '맑음',
      hint,
      icon: SunnyIcon,
      color: '#F59E0B',
    };
  }

  return {
    type: normalizedName || '소비 날씨',
    hint,
    icon: CloudyIcon,
    color: '#FFFFFF',
  };
}
