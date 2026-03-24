import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
    title: '일상 든든 헬스케어형',
    hashtags: ['#병원_의료', '#자동차_유지비', '#식료품소매'],
    iconName: 'pulse-outline',
    color: '#FF6B6B',
  },
  {
    id: 1,
    title: '드라이빙 마니아형',
    hashtags: ['#자동차_유지비', '#한식', '#병원_의료'],
    iconName: 'car-outline',
    color: '#4DABF7',
  },
  {
    id: 2,
    title: '다채로운 욜로 외식형',
    hashtags: ['#한식', '#기타외식', '#취미_오락'],
    iconName: 'restaurant-outline',
    color: '#FF922B',
  },
  {
    id: 3,
    title: '미래 투자 교육형',
    hashtags: ['#교육_학원', '#커피_음료', '#사무_교육용품'],
    iconName: 'book-outline',
    color: '#5C7CFA',
  },
  {
    id: 4,
    title: '커피 & 디저트 러버형',
    hashtags: ['#커피_음료', '#육류_회식', '#분식'],
    iconName: 'cafe-outline',
    color: '#BE4BDB',
  },
  {
    id: 5,
    title: '장바구니 요정 집밥형',
    hashtags: ['#음식료품소매', '#자동차_유지비', '#한식'],
    iconName: 'cart-outline',
    color: '#51CF66',
  },
  {
    id: 6,
    title: '트렌디 뷰티/패션형',
    hashtags: ['#화장품소매', '#커피_음료', '#기타외식'],
    iconName: 'shirt-outline',
    color: '#F06595',
  },
  {
    id: 7,
    title: '균형 잡힌 밸런스형',
    description: '어느 한 카테고리에 치우치지 않고 모든 분야에서 균형 있게 소비하는 안정적인 스타일이에요.',
    iconName: 'scale-balance',
    iconType: 'MaterialCommunityIcons',
    color: '#845EF7',
  },
];
