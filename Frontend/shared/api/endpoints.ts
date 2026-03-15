// =============================================
// API endpoints
// 웹/앱 공용으로 사용하는 엔드포인트 상수입니다.
// 실제 백엔드 코드 기준으로 현재 존재하는 경로를 우선 반영합니다.
// =============================================

// Vite 환경에서만 import.meta.env 가 존재합니다.
// shared 코드는 웹/네이티브가 같이 참조하므로, 웹이 아닐 때 접근 에러가 나지 않게 먼저 가드합니다.
const viteApiBaseUrl =
  typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined;

// 변경 사항:
// 기존에는 배포 서버 URL 이 하드코딩되어 있어서 로컬 백엔드를 붙여도 프론트가 그대로 원격 서버를 호출했습니다.
// 이제 웹에서는 .env 의 VITE_API_BASE_URL 값을 우선 사용하고, 값이 없을 때만 기존 배포 서버를 fallback 으로 사용합니다.
export const BASE_URL = viteApiBaseUrl || 'https://j14d106.p.ssafy.io';

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/v1/auth/signup',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    PHONE_SEND: '/api/v1/auth/sms/send',
    PHONE_VERIFY: '/api/v1/auth/sms/verify',
    // 회원가입 전 아이디 중복확인은 GET query 방식으로 조회성 호출을 보냅니다.
    CHECK_USER_ID: '/api/v1/auth/check-user-id',
    GOOGLE_OAUTH: '/oauth2/authorization/google',
  },

  USER: {
    // 사용자 프로필 조회 및 수정 계열 API 경로
    PROFILE: '/api/v1/user/profile',
    PASSWORD: '/api/v1/auth/password',
    PHONE: '/api/v1/user/phone',
    DELETE: '/api/v1/user/delete',
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
