export interface SpendingStyle {
  id: number;
  title: string;
  hashtags?: string[];
  description?: string;
  iconName: string;
  iconType?: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
}

export const SPENDING_STYLES: SpendingStyle[] = [
  {
    id: 0,
    title: '생활 필수 관리형',
    hashtags: ['#병원_의료', '#자동차_유지비', '#연료_주유'],
    iconName: 'pulse-outline',
    color: '#FF6B6B',
  },
  {
    id: 1,
    title: '이동 중심 생활형',
    hashtags: ['#자동차_유지비', '#외식', '#병원_의료'],
    iconName: 'car-outline',
    color: '#4DABF7',
  },
  {
    id: 2,
    title: '미식 탐험형',
    hashtags: ['#외식', '#기타_음식', '#취미_여가'],
    iconName: 'restaurant-outline',
    color: '#FF922B',
  },
  {
    id: 3,
    title: '자기계발 투자형',
    hashtags: ['#교육_학원', '#커피_음료', '#사무_교육용품'],
    iconName: 'book-outline',
    color: '#5C7CFA',
  },
  {
    id: 4,
    title: '커피 & 모임형',
    hashtags: ['#커피_음료', '#주류_회식', '#분식'],
    iconName: 'cafe-outline',
    color: '#BE4BDB',
  },
  {
    id: 5,
    title: '장보기 실속형',
    hashtags: ['#식료품_구매', '#자동차_유지비', '#외식'],
    iconName: 'cart-outline',
    color: '#51CF66',
  },
  {
    id: 6,
    title: '패션/뷰티 집중형',
    hashtags: ['#화장품_미용', '#커피_음료', '#기타_음식'],
    iconName: 'shirt-outline',
    color: '#F06595',
  },
  {
    id: 7,
    title: '균형 소비 밸런스형',
    description: '한두 카테고리에 치우치지 않고 여러 영역에서 고르게 소비하는 안정적인 스타일이에요.',
    iconName: 'scale-balance',
    iconType: 'MaterialCommunityIcons',
    color: '#845EF7',
  },
];
