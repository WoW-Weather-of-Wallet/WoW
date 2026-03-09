// =============================================
// API 엔드포인트 상수 모음
// 웹(React) + 앱(React Native) 공용으로 사용
// BASE_URL은 환경에 따라 변경 필요 (개발/배포)
// =============================================

// 개발: localhost / 배포: 실제 서버 주소로 변경
export const BASE_URL = 'http://localhost:8080'

export const ENDPOINTS = {
  // -----------------------------------------------
  // 사용자 관리 (Auth) - BE 담당: 김진우
  // -----------------------------------------------
  AUTH: {
    SIGNUP: '/api/v1/auth/signup',                              // POST - 회원가입
    LOGIN: '/api/v1/auth/login',                                // POST - 로그인
    LOGOUT: '/api/v1/auth/logout',                              // DELETE - 로그아웃
    REFRESH: '/api/v1/auth/refresh',                            // POST - 토큰 갱신
    PHONE_SEND: '/api/v1/auth/phone/send',                      // POST - 휴대폰 인증번호 요청
    PHONE_VERIFY: '/api/v1/auth/phone/verify',                  // POST - 휴대폰 인증번호 확인
    CHECK_EMAIL: '/api/v1/auth/check-email',                    // GET  - 이메일 중복 확인
    EMAIL_VERIFY_REQUEST: '/api/v1/auth/email-verifications',   // POST - 이메일 인증번호 요청
    EMAIL_VERIFY_CONFIRM: '/api/v1/auth/email-verifications/confirm', // POST - 이메일 인증번호 확인
    GOOGLE_OAUTH: '/oauth2/authorization/google',               // POST - 구글 OAuth (2차 MVP)
  },

  // -----------------------------------------------
  // 유저 정보 - BE 담당: 김진우
  // -----------------------------------------------
  USER: {
    ME: '/api/v1/users/me',                       // GET/PATCH/DELETE - 내 정보 조회/수정/탈퇴
    PASSWORD: '/api/v1/users/me/password',         // PATCH - 비밀번호 변경
    NOTIFICATIONS: '/api/v1/users/me/notifications', // GET/PATCH - 알림 설정 조회/변경
    ONBOARDING: '/api/v1/users/me/onboarding',    // POST - 온보딩 선택 저장
  },

  // -----------------------------------------------
  // 약관 - BE 담당: 김진우
  // -----------------------------------------------
  TERMS: {
    LIST: '/api/v1/terms',       // GET  - 약관 목록 조회
    AGREE: '/api/v1/terms/agree', // POST - 약관 동의
  },

  // -----------------------------------------------
  // 계좌 - BE 담당: 이채목 / FE 담당: 이채목
  // -----------------------------------------------
  ACCOUNTS: {
    LIST: '/api/v1/accounts',                                               // GET - 계좌 정보 및 잔액 조회
    BALANCE: (accountId: number) => `/api/v1/accounts/${accountId}/balance`, // GET - 특정 계좌 잔액 단건 조회
    TRANSACTIONS: (accountId: number) => `/api/v1/accounts/${accountId}/transactions`, // GET - 거래 내역 조회
  },

  // -----------------------------------------------
  // 거래 내역 메모 - FE 담당: 이채목
  // -----------------------------------------------
  TRANSACTIONS: {
    MEMO: (transactionId: number) => `/api/v1/transactions/${transactionId}/memo`, // PATCH/DELETE - 메모 작성/수정/삭제
  },

  // -----------------------------------------------
  // 캘린더 - BE 담당: 오우택
  // -----------------------------------------------
  CALENDAR: {
    HEADER: '/api/v1/calendar/header',               // GET - 캘린더 헤더 조회 (잔액, 목표 등)
    MONTHLY: '/api/v1/calendar/monthly',             // GET - 월 단위 캘린더 조회
    FIXED_EXPENSES: '/api/v1/calendar/fixed-expenses', // GET - 고정 지출 목록 조회
    TRANSACTIONS: '/api/v1/calendar/transactions',   // GET - 전체 거래내역 조회
    AI_FEEDBACK: '/api/v1/calendar/aifeedback',      // GET - AI 피드백 조회
  },

  // -----------------------------------------------
  // 고정 지출 - BE 담당: 오우택
  // -----------------------------------------------
  FIXED_EXPENSES: {
    LIST: '/api/v1/fixed-expenses',                                          // GET  - 고정 지출 전체 조회
    BY_CATEGORY: (category: string) => `/api/v1/fixed-expenses?category=${category}`, // GET  - 카테고리별 조회
    DETAIL: (id: number) => `/api/v1/fixed-expenses/${id}`,                  // PATCH/DELETE - 수정/삭제
  },

  // -----------------------------------------------
  // 유동 지출 - BE 담당: 오우택 (2차 MVP)
  // -----------------------------------------------
  EXPENSES: {
    LIST: '/api/v1/expenses',                           // GET/POST - 전체 조회/추가
    DETAIL: (id: number) => `/api/v1/expenses/${id}`,  // PATCH/DELETE - 수정/삭제
  },

  // -----------------------------------------------
  // 메인 화면 - BE 담당 미정
  // -----------------------------------------------
  MAIN: {
    SPENDING_TYPE: '/api/v1/main/spending-type',                  // GET - 소비 유형 조회
    SPENDING_TYPE_ANALYSIS: '/api/v1/main/spending-type/analysis', // GET - 소비 유형 분석 결과 조회
    SPENDING_MONTHLY: '/api/v1/main/spending/monthly',            // GET - 이번달 소비 카테고리별 조회
    BUDGET: '/api/v1/main/budget',                                // GET - 이번달 남은 예산 조회
    WEEKLY_FORECAST: '/api/v1/main/calendar/weekly-forecast',     // GET - 이번주 소비 예보 조회
    MONTHLY_COMPARE: '/api/v1/main/spending/monthly/compare',     // GET - 이번달 지난달 소비 비교
  },

  // -----------------------------------------------
  // 가이드
  // -----------------------------------------------
  GUIDE: '/api/v1/guide', // GET - 계좌 조회 가이드
} as const
