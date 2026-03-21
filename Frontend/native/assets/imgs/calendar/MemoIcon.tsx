import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export default function MemoIcon({ size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        {/*
          변경 이유:
          - 기존 압정 메모 아이콘보다 캘린더 셀의 작은 배지에는 단순한 포스트잇 실루엣이 더 잘 읽힙니다.
          - 사용자가 준 시안처럼 밝은 노란 바탕과 접힌 모서리만 남겨 시인성을 높입니다.
        */}
        <LinearGradient id="memoBody" x1="0" y1="0" x2="100" y2="100">
          <Stop offset="0%" stopColor="#FFE48A" />
          <Stop offset="100%" stopColor="#FFD56C" />
        </LinearGradient>
        <LinearGradient id="memoFold" x1="72" y1="72" x2="100" y2="100">
          <Stop offset="0%" stopColor="#FFBE59" />
          <Stop offset="100%" stopColor="#F59E42" />
        </LinearGradient>
      </Defs>

      <Path
        d="M14 6H86C90.418 6 94 9.582 94 14V66C94 68.122 93.157 70.157 91.657 71.657L71.657 91.657C70.157 93.157 68.122 94 66 94H14C9.582 94 6 90.418 6 86V14C6 9.582 9.582 6 14 6Z"
        fill="url(#memoBody)"
      />
      <Path
        d="M72 72H94L72 94V72Z"
        fill="url(#memoFold)"
      />
      <Path
        d="M72 72V85C72 89.971 67.971 94 63 94H72V72Z"
        fill="#F8C86A"
        opacity="0.55"
      />
    </Svg>
  );
}
