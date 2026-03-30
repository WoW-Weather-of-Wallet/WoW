import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

export default function RainIcon({ size = 48, color = '#3B82F6' }) {
  const cloudColor = '#64748B';
  const cloudPath = "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z";

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="translate(0, 0)">
        {/* 비: 구름 뒤쪽에서 내리도록 먼저 렌더링, 조금 왼쪽으로 이동하고 길이를 늘려 구름 뒤에 숨겨진 입체감 연출 */}
        <Path d="M5.5 23l1.5-5 M9.5 23l1.5-5 M13.5 23l1.5-5 M17.5 23l1.5-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        {/* 구름 */}
        <Path d={cloudPath} fill={cloudColor} />
      </G>
    </Svg>
  );
}
