# 기존 Calendar API 명세 수정안

## 범위

이 문서는 백엔드에서 계속 공개 API로 유지할 기존 캘린더 업로드/검수 관련 3개 API를 다룹니다.

- `POST /api/v1/calendar/transactions/csv`
- `POST /api/v1/calendar/transactions/overrides`
- `POST /api/v1/calendar/transactions/csv/confirm`

목표는 현재 경로는 유지하되, 명세를 정리해서 백엔드, 프론트엔드, AI 연동이 같은 기준으로 개발되도록 맞추는 것입니다.

## 공통 수정 사항

아래 규칙은 세 API 모두에 공통 적용하는 것을 권장합니다.

### 1. 인증 필수

세 API 모두 개인 거래 데이터를 다루므로 아래 헤더를 필수로 명시해야 합니다.

```http
Authorization: Bearer <access_token>
```

현재 문제점:

- `/transactions/csv/confirm`은 사용자 확정 액션인데도 보안 설정상 익명 접근이 열려 있습니다.
- 업로드 API와 오버라이드 API 역시 개인 금융 데이터를 다루므로 공개 API로 두면 안 됩니다.

관련 파일:

- `Backend/src/main/java/com/wow/domain/security/SecurityConfig.java`
- `Backend/src/main/java/com/wow/domain/calendar/controller/CalendarController.java`

### 2. 성공 응답 포맷 통일

모든 공개 백엔드 API는 공통 응답 래퍼를 사용하는 것이 좋습니다.

```json
{
  "httpStatusCode": 200,
  "responseMessage": "요청 성공",
  "data": {}
}
```

현재 문제점:

- `POST /api/v1/calendar/transactions/csv`는 raw Flask DTO를 그대로 반환합니다.
- `POST /api/v1/calendar/transactions/overrides`는 plain string을 반환합니다.
- `POST /api/v1/calendar/transactions/csv/confirm`만 이미 백엔드 공통 래퍼를 사용하고 있습니다.

관련 파일:

- `Backend/src/main/java/com/wow/global/common/ApiResponse.java`
- `Backend/src/main/java/com/wow/domain/calendar/dto/FlaskPreprocessDto.java`

### 3. 공개 명세는 camelCase 사용

현재 AI/Flask 내부 응답은 `snake_case`가 섞여 있지만, 공개 API 명세는 `camelCase`만 노출하는 것이 좋습니다.

예시:

- `excluded_rows` -> `excludedRows`
- `merchant_name` -> `merchantName`
- `classification_reason` -> `classificationReason`
- `transaction_date` -> `transactionDate`

관련 파일:

- `Frontend/native/src/services/calendar.ts`
- `Frontend/native/src/types/calendar.ts`

### 4. 에러 포맷 일관성 유지

공개 API 에러 응답도 한 가지 포맷으로 통일하는 것을 권장합니다.

```json
{
  "httpStatusCode": 400,
  "errorMessage": "에러 메시지"
}
```

명세에는 항상 아래 항목이 보이도록 정리해야 합니다.

- HTTP status
- 비즈니스 에러 코드
- 사용자 노출 메시지

## API 1. `POST /api/v1/calendar/transactions/csv`

### 유지할 것

- 경로
- 메서드
- multipart 업로드 구조
- `bank_file`만 업로드, `card_file`만 업로드, 둘 다 업로드 모두 허용하는 구조

### 명세에서 수정할 것

1. 인증 필수 명시
2. 최소 1개 파일은 반드시 필요하다는 규칙 명시
3. 요청 형식을 `multipart/form-data`로 명시
4. 응답을 `ApiResponse`로 감싸기
5. 공개 필드명은 `camelCase`만 사용

### 권장 Request 명세

**Header**

```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Part**

| key | type | required | description |
| --- | --- | --- | --- |
| bank_file | `File` | N | 은행 거래 파일 (`csv`, `xls`, `xlsx`) |
| card_file | `File` | N | 카드 거래 파일 (`csv`, `xls`, `xlsx`) |

규칙:

- `bank_file`, `card_file` 중 최소 하나는 반드시 포함되어야 합니다.

### 권장 Response 명세

| key | type | description |
| --- | --- | --- |
| message | `String` | 전처리 결과 메시지 |
| records | `Array<Object>` | 카테고리 집계 요약 |
| records[].category | `String` | 카테고리명 |
| records[].amt | `Integer` | 총 금액 |
| records[].cnt | `Integer` | 총 건수 |
| items | `Array<Object>` | 전처리된 거래 목록 |
| items[].transactionDate | `String` | 거래일 (`yyyy-MM-dd`) |
| items[].merchantName | `String` | 가맹점명 |
| items[].transactionDetail | `String` | 거래 상세 정보 |
| items[].amount | `Integer` | 거래 금액 |
| items[].category | `String` | 분류된 카테고리 |
| items[].classificationReason | `String` | 분류 사유 |
| items[].status | `String` | `classified`, `needs-category` |
| excludedRows | `Array<Object>` | 분석 대상에서 제외된 거래 |
| excludedRows[].merchantName | `String` | 가맹점명 |
| excludedRows[].classificationReason | `String` | 제외 사유 |
| excludedRows[].amount | `Integer` | 금액 |
| excludedRows[].cnt | `Integer` | 건수 |
| transactionCount | `Integer` | 포함 거래 건수 |
| includedAmount | `Integer` | 포함 거래 합계 |
| excludedAmount | `Integer` | 제외 거래 합계 |
| totalAmount | `Integer` | 전체 거래 합계 |

### 비고

- 이 API는 미리보기/검수용 API이며, 최종 저장까지 끝나는 API는 아닙니다.
- 최종 저장은 `POST /api/v1/calendar/transactions/csv/confirm`에서 수행합니다.

## API 2. `POST /api/v1/calendar/transactions/overrides`

### 유지할 것

- 경로
- 메서드
- 목적: 확정 전 수동 카테고리 수정 저장

### 명세에서 수정할 것

1. 인증 필수 명시
2. 공개 요청 필드명을 `camelCase`로 변경
3. 오버라이드는 사용자 단위 데이터라는 의미를 명확히 하기
4. plain string 응답 대신 `ApiResponse`로 통일

### 중요한 설계 수정 포인트

현재 AI 서비스는 오버라이드를 하나의 공용 CSV 파일에 저장하고 있습니다.

- `Desktop/data_analysis/analysis/demo_app.py`

하지만 이 구현 방식이 공개 명세에 그대로 드러나면 안 됩니다.

공개 API의 의미는 아래처럼 정의하는 것이 맞습니다.

- "인증된 사용자의 카테고리 수정 규칙을 저장한다."

아래처럼 보이면 안 됩니다.

- "전체 사용자가 공유하는 전역 오버라이드 파일에 기록한다."

### 권장 Request 명세

**Header**

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**

| key | type | required | description |
| --- | --- | --- | --- |
| rows | `Array<Object>` | Y | 사용자 카테고리 수정 목록 |
| rows[].merchantName | `String` | Y | 상호명 |
| rows[].category | `String` | Y | 수정 카테고리 |
| rows[].reason | `String` | N | 수정 사유 |

### 권장 Response 명세

| key | type | description |
| --- | --- | --- |
| savedCount | `Integer` | 저장된 수정 항목 수 |

### 비고

- 현재 AI 서비스와의 호환을 위해 백엔드 내부에서 `merchantName`을 `merchant_name`으로 변환할 수는 있습니다.
- 다만 그 내부 변환 규칙이 공개 명세에 드러나면 안 됩니다.

## API 3. `POST /api/v1/calendar/transactions/csv/confirm`

### 유지할 것

- 경로
- 메서드
- 목적: 검수 완료된 거래를 백엔드 DB에 최종 저장

### 명세에서 수정할 것

1. 인증 필수 명시
2. 보안 설정에서 익명 접근 제거
3. 이 API가 최종 확정 저장 API라는 의미를 명확히 하기
4. 현재 요청 구조는 유지하되 `tempId`를 공개 명세에 둘지 결정

### 권장 Request 명세

**Header**

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**

| key | type | required | description |
| --- | --- | --- | --- |
| items | `Array<Object>` | Y | 최종 확정할 거래 목록 |
| items[].tempId | `String` | N | 프리뷰 단계 임시 식별자 |
| items[].merchantName | `String` | Y | 상호명 |
| items[].amount | `Integer` | Y | 거래 금액 |
| items[].categoryId | `Integer` | Y | 최종 카테고리 ID |
| items[].transactionDate | `String` | Y | 거래일 (`yyyy-MM-dd`) |

### 권장 Response 명세

| key | type | description |
| --- | --- | --- |
| savedCount | `Integer` | 저장된 거래 건수 |
| date | `String` | 저장 기준 일자 |

### 비고

- `tempId`는 현재 백엔드 DTO에는 존재하지만, 프론트 타입에서는 적극적으로 사용하지 않고 있습니다.
- 따라서 공개 명세에서는 선택 필드로 두는 것이 무난합니다.

관련 파일:

- `Backend/src/main/java/com/wow/domain/calendar/dto/TransactionConfirmRequest.java`
- `Backend/src/main/java/com/wow/domain/calendar/dto/TransactionConfirmResponse.java`

## 공개 API 계약 요약

| API | 경로 유지 여부 | 반드시 수정할 것 |
| --- | --- | --- |
| `POST /api/v1/calendar/transactions/csv` | 유지 | 인증, 응답 래퍼, camelCase 필드 |
| `POST /api/v1/calendar/transactions/overrides` | 유지 | 인증, 사용자 단위 저장 의미, 응답 래퍼, camelCase 요청 바디 |
| `POST /api/v1/calendar/transactions/csv/confirm` | 유지 | 인증 필수, 보안 설정 수정 |

## 구현 메모

이 명세를 만족시키기 위해 필요한 최소 구현 작업은 아래와 같습니다.

1. 세 API 모두 인증 필수로 변경
2. `/transactions/csv`, `/transactions/overrides`도 `ApiResponse`로 감싸기
3. 공개 응답/요청 필드명을 `camelCase`로 통일
4. 오버라이드 저장을 사용자 단위 저장소로 이동
5. 현재 경로는 유지해서 프론트 연동 비용을 낮추기

## 케이스 변경 대상 정리

공개 명세에서는 아래 필드들을 `snake_case` 그대로 노출하지 않고 `camelCase` 또는 도메인 의미에 맞는 이름으로 바꾸는 것을 권장합니다.

| 현재 필드명 | 변경 필드명 | 적용 위치 | 비고 |
| --- | --- | --- | --- |
| `excluded_rows` | `excludedRows` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `transaction_count` | `transactionCount` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `included_amount` | `includedAmount` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `excluded_amount` | `excludedAmount` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `total_amount` | `totalAmount` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `merchant_name` | `merchantName` | `/transactions/csv` 응답, `/transactions/overrides` 요청 | 공개 요청/응답 필드 |
| `classification_reason` | `classificationReason` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `transaction_date` | `transactionDate` | `/transactions/csv` 응답, `/transactions/csv/confirm` 요청 | 공개 요청/응답 필드 |
| `transaction_detail` | `transactionDetail` | `/transactions/csv` 응답 | 공개 응답 필드 |
| `card_tpbuz_nm_2` | `category` | `/transactions/csv` 응답 | 내부 CSV 컬럼명은 공개 명세에 직접 노출하지 않음 |

## 최종 방향

- AI 내부 Python/Flask 레이어는 `snake_case`를 유지해도 됩니다.
- 백엔드와 프론트가 공유하는 공개 API 명세는 `camelCase`로 통일합니다.
- 즉, "내부 구현은 Python 스타일", "외부 계약은 Java/TypeScript 스타일"로 분리하는 방향이 가장 현실적입니다.
