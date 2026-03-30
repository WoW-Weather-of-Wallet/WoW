// =============================================
// 계좌 관련 타입 정의
// BE 담당: 이채목 / FE 담당: 이채목
// SSAFY 금융망 API 연동 (inquireDemandDepositAccountBalance 등)
// =============================================

// 계좌 기본 정보
export interface Account {
  accountId: number        // 계좌 고유 ID
  bankCode: string         // 은행 코드
  bankName: string         // 은행명
  accountNumber: string    // 계좌번호
  accountName: string      // 계좌 별칭
  balance: number          // 현재 잔액
  status: string           // 계좌 상태 (ACTIVE, CLOSED 등)
  createdAt: string        // 계좌 개설일 (ISO 8601)
  closedAt?: string        // 계좌 해지일 (ISO 8601, 선택)
}
