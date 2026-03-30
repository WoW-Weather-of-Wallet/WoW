import type { ImageSourcePropType } from 'react-native';

export interface SpendingStyle {
  id: number;
  title: string;
  hashtags?: string[];
  description?: string;
  iconName: string;
  iconType?: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  imageSource?: ImageSourcePropType;
}

export const SPENDING_STYLES: SpendingStyle[] = [
  {
    id: 0,
    title: '외식·생활잡화형',
    hashtags: ['#외식', '#생활잡화', '#편의점'],
    iconName: 'basket-outline',
    color: '#F17C67',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_homecookinglife.png'),
  },
  {
    id: 1,
    title: '사무·서적형',
    hashtags: ['#사무용품', '#서적', '#문구'],
    iconName: 'book-outline',
    color: '#5C7CFA',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_study.png'),
  },
  {
    id: 2,
    title: '외식·드라이브형',
    hashtags: ['#외식', '#주유', '#드라이브'],
    iconName: 'car-outline',
    color: '#4DABF7',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_drivemania.png'),
  },
  {
    id: 3,
    title: '차량·의료관리형',
    hashtags: ['#차량관리', '#병원', '#약국'],
    iconName: 'medical-outline',
    color: '#FF6B6B',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_healthcare.png'),
  },
  {
    id: 4,
    title: '외식·의료집중형',
    hashtags: ['#외식', '#병원', '#건강관리'],
    iconName: 'restaurant-outline',
    color: '#F06595',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_yololife.png'),
  },
  {
    id: 5,
    title: '의료·자동차형',
    hashtags: ['#의료비', '#자동차유지비', '#주유'],
    iconName: 'pulse-outline',
    color: '#845EF7',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_balancedlife.png'),
  },
  {
    id: 6,
    title: '교육·선물 특화형',
    hashtags: ['#교육', '#선물', '#자기계발'],
    iconName: 'gift-outline',
    color: '#BE4BDB',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_trendbeauty.png'),
  },
  {
    id: 7,
    title: '커피·디저트형',
    hashtags: ['#커피', '#디저트', '#카페'],
    iconName: 'cafe-outline',
    color: '#A56BE0',
    imageSource: require('../../../assets/cluster_mascot/mascot_cluster_coffeelove.png'),
  },
];
