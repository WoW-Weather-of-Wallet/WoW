import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function HeavyRainIcon({ size = 48, color = '#1E3A8A' }) {
  const cloudColor = '#475569';
  const lightningColor = '#EAB308';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17.5 15H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill={cloudColor} stroke={cloudColor} strokeWidth="2" />
      <Path d="M7 23v-5" stroke={color} strokeWidth="2" />
      <Path d="M11 23v-5" stroke={color} strokeWidth="2" />
      <Path d="M15 23v-5" stroke={color} strokeWidth="2" />
      <Path d="M13 15l-3 4h4l-2 5" stroke={lightningColor} strokeWidth="2" fill={lightningColor} />
    </Svg>
  );
}
