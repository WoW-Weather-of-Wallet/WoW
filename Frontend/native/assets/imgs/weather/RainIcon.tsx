import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function RainIcon({ size = 48, color = '#3B82F6' }) {
  const cloudColor = '#64748B';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.5 17H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill={cloudColor} stroke={cloudColor} strokeWidth="2" />
      <Path d="M8 22v-3" stroke={color} strokeWidth="2" />
      <Path d="M12 22v-3" stroke={color} strokeWidth="2" />
      <Path d="M16 22v-3" stroke={color} strokeWidth="2" />
    </Svg>
  );
}
