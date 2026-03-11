// =============================================
// 유저 관련 타입 정의
// BE 담당: 김진우
// =============================================

// 유저 기본 정보
export interface User {
  id: number              // 유저 고유 ID
  loginId: string         // 로그인 ID (이메일)
  userName: string        // 이름
  gender: 'M' | 'F'      // 성별
  birthDate: string       // 생년월일 (YYYY-MM-DD)
  phoneNumber: string     // 휴대폰 번호
  jobId: number           // 직업 ID
  createdAt: string       // 가입일 (ISO 8601)
  updatedAt: string       // 정보 수정일 (ISO 8601)
}

// 회원 정보 수정 요청
// PATCH /api/v1/users/me
export interface UserUpdateRequest {
  userName?: string       // 이름 변경
  phoneNumber?: string    // 휴대폰 번호 변경
  jobId?: number          // 직업 변경
}

// 알림 설정 단건
export interface NotificationSetting {
  notificationTypesId: number  // 알림 유형 ID
  enabled: boolean             // 알림 활성화 여부
  updatedAt: string            // 마지막 수정일 (ISO 8601)
}
