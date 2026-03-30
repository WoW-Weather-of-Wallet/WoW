// 소비 유형 8가지
export const SPENDING_TYPES = {
  FOOD_EXPLORER: {
    id: 1,
    name: '미식 탐험가형',
    icon: '🍽️',
    description: '식비가 전체의 35% 이상, 경험과 맛에 투자하는 라이프스타일',
  },
  SAVER: {
    id: 2,
    name: '절약 수호자형',
    icon: '🐷',
    description: '지출 변동성이 낮고 계획적으로 소비하는 유형',
  },
  EXPERIENCE: {
    id: 3,
    name: '경험 수집가형',
    icon: '🎭',
    description: '문화/여가 비중이 높고 새로운 경험을 추구하는 유형',
  },
  PLANNER: {
    id: 4,
    name: '계획 설계자형',
    icon: '📋',
    description: '정기지출 비율이 높고 체계적으로 관리하는 유형',
  },
  IMPULSE: {
    id: 5,
    name: '충동 소비형',
    icon: '⚡',
    description: '즉시소비지수가 높고 감정 소비 빈도가 잦은 유형',
  },
  SUBSCRIPTION: {
    id: 6,
    name: '구독 마니아형',
    icon: '📺',
    description: '구독 서비스 비중이 높은 유형',
  },
  FASHION: {
    id: 7,
    name: '패션 리더형',
    icon: '👗',
    description: '쇼핑 비중이 높고 트렌드에 민감한 유형',
  },
  BALANCED: {
    id: 8,
    name: '균형 관리형',
    icon: '⚖️',
    description: '전반적으로 고른 소비 패턴을 보이는 유형',
  },
} as const

export type SpendingTypeKey = keyof typeof SPENDING_TYPES
