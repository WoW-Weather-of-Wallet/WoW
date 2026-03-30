// =============================================
// 캘린더 관련 타입 정의
// BE 담당: 오우택
// 날씨 예보 컨셉으로 소비 흐름을 시각화
// =============================================

import { Transaction } from './transaction'

// 날짜 유형 (과거/오늘/가까운미래/먼미래)
export type DayType = 'PAST' | 'TODAY' | 'NEAR_FUTURE' | 'FAR_FUTURE'

// 캘린더 날짜 단건 정보
export interface CalendarDay {
  calendarGoalId: number      // 목표 ID
  userId: number              // 유저 ID
  date: string                // 날짜 (YYYY-MM-DD)
  dayType: DayType            // 날짜 유형
  dailyTotal: number          // 당일 총 지출
  isForecast: boolean         // 예측값 여부 (true: AI 예측)
  spendingWeatherId?: number  // 소비 날씨 ID (🟢안정/🟡주의/🔴위험)
}

// 캘린더 헤더 정보
// GET /api/v1/calendar/header
export interface CalendarHeader {
  userName: string            // 유저 이름
  currentBalance: number      // 현재 잔액
  monthlyGoal: number         // 이번달 지출 목표
  currentMonthSpent: number   // 이번달 지출액
  remainingBudget: number     // 남은 예산
  weatherDescription: string  // 이번달 소비 날씨 설명
}

// 일별 소비 요약 (날짜 클릭 시 상세)
export interface DailySummary {
  summaryId: number           // 요약 ID
  date: string                // 날짜 (YYYY-MM-DD)
  totalExpense: number        // 당일 총 지출
  transactionCount: number    // 거래 건수
  transactions: Transaction[] // 거래내역 목록
  memo?: string               // 하루 메모 (선택)
}

// 고정 지출 항목
// 구독 서비스, 공과금, 통신비 등
export interface FixedExpense {
  id: number                  // 고정 지출 ID
  accountId: number           // 연결 계좌 ID
  categoryId: number          // 카테고리 ID
  userId: number              // 유저 ID
  icon: string                // 아이콘 이모지
  name: string                // 지출 항목명
  amount: number              // 금액
  dueDay: number              // 결제일 (1~31)
  isAuto: boolean             // 자동 감지 여부
  isEnable: boolean           // 활성화 여부
  paymentStatus: string       // 결제 상태 (PAID, UNPAID 등)
  sourceTxnName?: string      // 원본 거래명 (자동 감지 시)
}
