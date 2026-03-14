// 메인 홈 섹션과 바텀시트가 공유하는 타입을 상수 레이어에 둡니다.
export interface LegendListItem {
  id: string;
  label: string;
  value: string;
  color: string;
}

export interface SpendingStyleMetric extends LegendListItem {
  score: number;
}
