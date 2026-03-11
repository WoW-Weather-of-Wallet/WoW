// =============================================
// API endpoints
// 웹/앱 공용으로 사용하는 엔드포인트 상수입니다.
// 실제 백엔드 코드 기준으로 현재 존재하는 경로를 우선 반영합니다.
// =============================================

// 로컬 스프링 서버를 직접 붙일 때 사용합니다.
// export const BASE_URL = 'http://localhost:8080';

// Expo 실기기 테스트에서는 로컬 네트워크 이슈가 잦아서,
// 현재는 SSAFY 배포 서버를 기본값으로 사용합니다.
export const BASE_URL = 'https://j14d106.p.ssafy.io';

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/v1/auth/signup',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    PHONE_SEND: '/api/v1/auth/sms/send',
    PHONE_VERIFY: '/api/v1/auth/sms/verify',
    CHECK_EMAIL: '/api/v1/auth/check-email',
    EMAIL_VERIFY_REQUEST: '/api/v1/auth/email-verifications',
    EMAIL_VERIFY_CONFIRM: '/api/v1/auth/email-verifications/confirm',
    GOOGLE_OAUTH: '/oauth2/authorization/google',
  },

  USER: {
    // 현재 백엔드 구현은 /users/me 계열이 아니라 /user/profile 계열입니다.
    PROFILE: '/api/v1/user/profile',
    ONBOARDING: '/api/v1/user/onboarding',
    PASSWORD: '/api/v1/user/profile/password',
    NOTIFICATIONS: '/api/v1/user/profile/notifications',
    DELETE: '/api/v1/user/profile',
  },

  TERMS: {
    LIST: '/api/v1/terms',
    AGREE: '/api/v1/terms/agree',
  },

  ACCOUNTS: {
    LIST: '/api/v1/accounts',
    BALANCE: (accountId: number) => `/api/v1/accounts/${accountId}/balance`,
    TRANSACTIONS: (accountId: number) => `/api/v1/accounts/${accountId}/transactions`,
  },

  TRANSACTIONS: {
    MEMO: (transactionId: number) => `/api/v1/transactions/${transactionId}/memo`,
  },

  CALENDAR: {
    HEADER: '/api/v1/calendar/header',
    MONTHLY: '/api/v1/calendar/monthly',
    FIXED_EXPENSES: '/api/v1/calendar/fixed-expenses',
    TRANSACTIONS: '/api/v1/calendar/transactions',
    AI_FEEDBACK: '/api/v1/calendar/aifeedback',
  },

  FIXED_EXPENSES: {
    LIST: '/api/v1/fixed-expenses',
    BY_CATEGORY: (category: string) => `/api/v1/fixed-expenses?category=${category}`,
    DETAIL: (id: number) => `/api/v1/fixed-expenses/${id}`,
  },

  EXPENSES: {
    LIST: '/api/v1/expenses',
    DETAIL: (id: number) => `/api/v1/expenses/${id}`,
  },

  MAIN: {
    SPENDING_TYPE: '/api/v1/main/spending-type',
    SPENDING_TYPE_ANALYSIS: '/api/v1/main/spending-type/analysis',
    SPENDING_MONTHLY: '/api/v1/main/spending/monthly',
    BUDGET: '/api/v1/main/budget',
    WEEKLY_FORECAST: '/api/v1/main/calendar/weekly-forecast',
    MONTHLY_COMPARE: '/api/v1/main/spending/monthly/compare',
  },

  GUIDE: '/api/v1/guide',
} as const;
