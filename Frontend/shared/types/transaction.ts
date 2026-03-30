// =============================================
// 거래내역 관련 타입 정의
// BE 담당: 이채목 / FE 담당: 이채목
// =============================================

// 단건 거래내역
export interface Transaction {
  transactionId: number       // 거래 고유 ID
  accountId: number           // 계좌 ID
  userId: number              // 유저 ID
  direction: 'IN' | 'OUT'    // 입금(IN) / 출금(OUT)
  amount: number              // 거래 금액
  balanceAfter: number        // 거래 후 잔액
  merchantName: string        // 가맹점명 (상호명)
  memo?: string               // 사용자 메모 (선택)
  createdAt: string           // DB 생성 시각 (ISO 8601)
  transactionAt: string       // 실제 거래 발생 시각 (ISO 8601)
  categoryId: number          // 카테고리 ID (EXPENSE_CATEGORIES 참고)
}

// 거래내역 메모 작성/수정 요청
export interface TransactionMemoRequest {
  memo: string
}

// 거래내역 목록 조회 쿼리 파라미터
// GET /api/v1/accounts/{accountId}/transactions
export interface TransactionListParams {
  page?: number               // 페이지 번호 (0부터 시작)
  size?: number               // 페이지당 항목 수
  startDate?: string          // 조회 시작일 (YYYY-MM-DD)
  endDate?: string            // 조회 종료일 (YYYY-MM-DD)
  direction?: 'IN' | 'OUT'   // 입금/출금 필터
  categoryId?: number         // 카테고리 필터
}

// 거래내역 목록 조회 응답 (페이지네이션)
// 실제 BE 응답 구조는 김진우님과 협의 후 맞출 것
export interface TransactionListResponse {
  content: Transaction[]      // 거래내역 목록
  totalElements: number       // 전체 항목 수
  totalPages: number          // 전체 페이지 수
  currentPage: number         // 현재 페이지
}
