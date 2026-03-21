import React from 'react';
import Svg, { Rect, Circle, G, Line } from 'react-native-svg';

export default function MemoIcon({ size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <G transform="translate(0, 10)">
        {/* 뒤쪽 포스트잇 (오렌지색, 살짝 기울어짐) */}
        <Rect 
          x="15" y="15" width="70" height="70" rx="8" 
          fill="#FF9F00" 
          transform="rotate(-5, 50, 50)" 
        />
        
        {/* 앞쪽 포스트잇 (밝은 노란색) */}
        <Rect 
          x="20" y="10" width="70" height="70" rx="8" 
          fill="#FFE16A" 
        />
        
        {/* 압정 핀 (바늘 부분) */}
        <G transform="rotate(45, 75, 15)">
          <Line 
            x1="75" y1="10" x2="75" y2="35" 
            stroke="#455A64" strokeWidth="6" strokeLinecap="round" 
          />
          {/* 압정 머리 (빨간색) */}
          <Circle cx="75" cy="10" r="14" fill="#F44336" />
          {/* 압정 머리 하이라이트 (약간 더 밝은 빨강) */}
          <Circle cx="72" cy="7" r="5" fill="#FF5252" opacity="0.6" />
        </G>
      </G>
    </Svg>
  );
}
