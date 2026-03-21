import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function CloudyIcon({ size = 48, color = '#94A3B8' }) {
  const sunColor = '#F59E0B';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="8" cy="8" r="4" fill={sunColor} stroke={sunColor} />
      <Path d="M17 18a5 5 0 0 0-10 0" stroke={color} fill={color} />
      <Path d="M12 18h8a4 4 0 0 0-4-4 4.5 4.5 0 0 0-8 0" fill={color} stroke={color} />
    </Svg>
  );
}
