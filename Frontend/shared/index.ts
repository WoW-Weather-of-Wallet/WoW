// =============================================
// @wow/shared - 공통 모듈 진입점
// React(웹) + React Native(앱) 공용으로 사용
// =============================================

// API 엔드포인트 상수
export * from './api/endpoints';

// 공통 상수
export * from './constants/categories';   // 지출 카테고리 (식비, 교통 등)
export * from './constants/spendingTypes'; // 소비 유형 8가지

// 타입 정의
export * from './types/user';        // 유저 관련 타입
export * from './types/auth';        // 인증 관련 타입
export * from './types/account';     // 계좌 관련 타입
export * from './types/transaction'; // 거래내역 관련 타입
export * from './types/calendar';    // 캘린더 관련 타입
export * from './types/main';        // 메인 화면 관련 타입
