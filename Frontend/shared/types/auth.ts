// =============================================
// 인증(Auth) 관련 타입 정의
// BE 담당: 김진우 / FE 담당: 진현제
// 1차 MVP: 일반 이메일/비밀번호, SSAFY OAuth
// 2차 MVP: 구글/카카오 OAuth, 간편 비밀번호
// =============================================

// -----------------------------------------------
// 로그인
// -----------------------------------------------

// 로그인 요청
// POST /api/v1/auth/login
export interface LoginRequest {
  loginId: string    // 이메일 (로그인 ID)
  password: string   // 비밀번호
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string   // JWT Access Token (메모리 저장)
  refreshToken: string  // JWT Refresh Token (httpOnly 쿠키)
  user: AuthUser        // 로그인한 유저 기본 정보
}

// -----------------------------------------------
// 회원가입
// -----------------------------------------------

// 회원가입 요청
// POST /api/v1/auth/signup
export interface SignupRequest {
  loginId: string      // 이메일
  password: string     // 비밀번호 (8자 이상)
  userName: string     // 이름
  phoneNumber: string  // 휴대폰 번호 (010-XXXX-XXXX)
  gender: 'M' | 'F'   // 성별
  birthDate: string    // 생년월일 (YYYY-MM-DD)
  jobId: number        // 직업 ID
}

// -----------------------------------------------
// 이메일 인증
// -----------------------------------------------

// 이메일 인증번호 요청
// POST /api/v1/auth/email-verifications
export interface EmailVerifyRequest {
  email: string  // 인증할 이메일
}

// 이메일 인증번호 확인
// POST /api/v1/auth/email-verifications/confirm
export interface EmailVerifyConfirmRequest {
  email: string  // 인증한 이메일
  code: string   // 인증번호 (6자리)
}

// -----------------------------------------------
// 휴대폰 인증
// -----------------------------------------------

// 휴대폰 인증번호 요청
// POST /api/v1/auth/phone/send
export interface PhoneSendRequest {
  phoneNumber: string  // 인증할 휴대폰 번호
}

// 휴대폰 인증번호 확인
// POST /api/v1/auth/phone/verify
export interface PhoneVerifyRequest {
  phoneNumber: string  // 인증한 휴대폰 번호
  code: string         // 인증번호 (6자리)
}

// -----------------------------------------------
// 토큰 갱신
// -----------------------------------------------

// 토큰 갱신 응답
// POST /api/v1/auth/refresh
export interface RefreshResponse {
  accessToken: string  // 새로 발급된 Access Token
}

// -----------------------------------------------
// 공통
// -----------------------------------------------

// Auth 관련 최소 유저 정보 (로그인 응답에 포함)
export interface AuthUser {
  id: number        // 유저 ID
  loginId: string   // 이메일
  userName: string  // 이름
}
