// =============================================
// 메인 화면 관련 타입 정의
// AI 소비 분석 / 예측 / 비교 기능
// =============================================

// 소비 유형 기본 정보
export interface SpendingType {
  typeId: number       // 소비 유형 ID (1~8)
  typeName: string     // 유형명 (예: 미식 탐험가형)
  icon: string         // 아이콘 이모지
  description: string  // 유형 설명
}

// AI 소비 유형 분석 결과
// GET /api/v1/main/spending-type/analysis
export interface SpendingTypeAnalysis {
  spendingType: SpendingType               // 내 소비 유형
  categoryBreakdown: {
    categoryId: number                     // 카테고리 ID
    categoryName: string                   // 카테고리명
    percentage: number                     // 비중 (%)
  }[]
  reasons: {
    order: number                          // 순서
    icon: string                           // 아이콘
    title: string                          // 이유 제목
    content: string                        // 이유 내용
  }[]
  aiComment: string                        // AI 한 줄 코멘트
}

// 주간 소비 예보 (날씨 컨셉)
// GET /api/v1/main/calendar/weekly-forecast
export interface WeeklyForecast {
  date: string                             // 날짜 (YYYY-MM-DD)
  dayOfWeek: string                        // 요일 (MON~SUN)
  riskLevel: 'SAFE' | 'WARNING' | 'DANGER' // 🟢안정 / 🟡주의 / 🔴위험
  reason?: string                          // 위험 이유 (선택)
}

// 월간 소비 비교
// GET /api/v1/main/spending/monthly/compare
export interface MonthlyCompare {
  currentMonth: {
    yearMonth: string                      // 이번달 (YYYY-MM)
    totalAmount: number                    // 총 지출액
    categories: {
      categoryId: number
      categoryName: string
      percentage: number                   // 카테고리별 비중 (%)
    }[]
  }
  lastMonth: {
    yearMonth: string                      // 지난달 (YYYY-MM)
    totalAmount: number
    categories: {
      categoryId: number
      categoryName: string
      percentage: number
    }[]
  }
  aiComment: string                        // AI 비교 코멘트
}

// 예산 정보
// GET /api/v1/main/budget
export interface BudgetInfo {
  goalAmount: number        // 이번달 목표 금액
  spentAmount: number       // 현재까지 지출액
  remainingAmount: number   // 남은 예산
  remainingDays: number     // 이번달 남은 일수
  dailyAvailable: number    // 하루 사용 가능 금액
  estimatedSaving: number   // 예상 절약 금액
}
