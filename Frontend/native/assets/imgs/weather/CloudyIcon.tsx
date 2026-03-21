import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

export default function CloudyIcon({ size = 48, color = '#94A3B8' }) {
  const sunColor = '#F59E0B';
  const cloudPath = "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z";

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="translate(0, 1.5)">
        <Circle cx="16" cy="8" r="5" fill={sunColor} />
        <Path d={cloudPath} fill={color} />
      </G>
    </Svg>
  );
}
