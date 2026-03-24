// =============================================
// utils/ - 유틸리티 함수 디렉토리
// 예: 날짜 포맷, 입력 검증, 토큰 관리 등
// =============================================

/**
 * 비밀번호 강도 검사 (최소 8자, 영문+숫자 포함)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};
