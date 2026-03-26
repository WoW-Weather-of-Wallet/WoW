# AI Report API Spec

## Purpose

This document defines the current backend contract for:

- monthly AI report generation
- Redis-first caching policy
- minimal DB snapshot persistence
- calendar header spending weather calculation

The current production-safe policy is:

- Full AI report JSON is cached in Redis.
- Existing DB tables are used only for minimal monthly snapshot storage.
- No new DB schema is required for this flow.

## Category Basis

The current AI report and cluster calculation use the **existing 45-category
model feature space**.

- Cluster `0 ~ 7` is already trained on this category basis.
- Because retraining is expensive, the backend must keep the same category
  basis for AI report input.
- If a 20-category summary is needed later, it should be handled as a
  **display-only derived view**, not as a replacement for the model input.

## Backend Public API

- Method: `GET`
- Path: `/api/v1/ai/analysis`
- Auth: required
- Query:
  - `year` optional
  - `month` optional

If `year` and `month` are omitted, the backend uses the current server
year/month.

## Report Period Rule

The AI report is built from a rolling 3-month window.

- Example target month: `2026-03`
- Included transactions:
  - `2026-01-01 00:00:00 <= transaction_at < 2026-04-01 00:00:00`

The returned report is still treated as the report for the requested month.

## Internal AI Server Call

The backend aggregates the rolling 3-month transactions by category before
calling the AI server.

- Method: `POST`
- Path: `/api/analyze`
- Base URL: `${ai.server.base-url}`

### Internal Request Body

```json
{
  "items": [
    {
      "category": "커피/음료",
      "amount": 233500,
      "count": 12
    },
    {
      "category": "육류/회식",
      "amount": 193200,
      "count": 4
    }
  ],
  "keepSession": false
}
```

Notes:

- `category` is the backend category name used for AI aggregation.
- The backend sends aggregated values, not raw transaction rows.
- `keepSession` is `false` for monthly report generation.

## Backend Response Shape

The backend wraps the AI report with the common response envelope.

```json
{
  "httpStatusCode": 200,
  "responseMessage": "AI 리포트 조회 성공",
  "data": {
    "cluster": {
      "id": 1,
      "name": "사무·서적형",
      "description": "사무/교육용품과 서적/도서 비중이 높은 유형",
      "icon": "book"
    },
    "categories": [
      {
        "name": "커피/음료",
        "amount": 233500,
        "my_ratio": 23.3,
        "base_ratio": 8.9,
        "diff": 14.4
      }
    ],
    "overspending": [
      {
        "name": "커피/음료",
        "my_ratio": 23.3,
        "base_ratio": 8.9,
        "savable_amount": 16322
      }
    ],
    "summary": {
      "total_savable": 29258,
      "expected_spending": 970842
    },
    "tips": [
      {
        "order": 1,
        "keyword": "커피·간식",
        "title": "커피·간식 빈도를 미리 정해두세요",
        "description": "충동 구매 대신 하루 1회 같은 규칙을 정하고 관리하세요."
      }
    ],
    "goal": {
      "savable_amount": 29258,
      "expected_spending": 970842,
      "action_tip": "커피/음료를 주 3회 구매로 제한하고 대체 음료를 고정해보세요."
    }
  }
}
```

## Cache Policy

- Redis key: `ai:monthly:report:{userId}:{year}:{month}`
- TTL: 6 hours
- Cache payload: full AI report JSON

The Redis cache is the **source of truth for the full report payload**.

## DB Persistence Policy

The current schema is kept as-is.

Persisted:

- `ai_analysis`
  - user
  - spending type
  - year/month
  - analysis type
  - cluster description
- `ai_analysis_category_result`
  - category
  - my ratio
  - base ratio
  - amount

Not persisted in DB yet:

- `overspending`
- `tips`
- `goal`
- full raw JSON

Those fields are served from Redis cache or a fresh AI server call.

## Invalidation Rule

When transactions are created, updated, or deleted:

- monthly compare cache is evicted
- AI monthly report cache is evicted
- affected monthly AI DB snapshots are removed for:
  - changed month
  - changed month + 1
  - changed month + 2

This matches the 3-month rolling aggregation rule.

## Calendar Header Spending Weather

The calendar header spending weather is derived from the monthly AI report.
It is **not** calculated from the old per-day weather table.

### Weather Source

- source endpoint: `GET /api/v1/ai/analysis`
- source fields:
  - `summary.total_savable`
  - `summary.expected_spending`
  - `overspending[0]`
  - `goal.action_tip`

### Weather Ratio

The backend computes:

`total_savable / (total_savable + expected_spending)`

This ratio represents the savings opportunity level of the monthly report.

### Five Weather Bands

- `< 10%` -> `맑음` / `sunny`
- `< 20%` -> `구름` / `cloudy`
- `< 30%` -> `흐림` / `overcast`
- `< 50%` -> `비` / `rain`
- `>= 50%` -> `폭우` / `heavy-rain`

These bands are aligned with the current frontend weather guide.

### Header Fallback Policy

If the AI report cannot be generated because:

- there are no transactions in the rolling 3-month window, or
- the AI server is unavailable,

the calendar header falls back to:

- `weatherName = "정보 없음"`
- `iconCode = null`
- `description = "최근 3개월 거래가 부족해 소비 날씨를 계산할 수 없습니다."`

### Header Description Rule

- If risk is meaningful and `goal.action_tip` exists, use it as the header
  description.
- Otherwise, use the top overspending category and savable amount to build a
  short fallback explanation.
- If no overspending category exists and the savings opportunity is near zero,
  return a stable message indicating the spending flow is relatively stable.

## Error Response Examples

No transactions in the rolling 3-month window:

```json
{
  "httpStatusCode": 404,
  "errorMessage": "최근 3개월 거래가 없어 AI 리포트를 생성할 수 없습니다."
}
```

AI server timeout or connection failure:

```json
{
  "httpStatusCode": 500,
  "errorMessage": "AI 리포트 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요."
}
```

AI server returned an empty body or an unexpected error:

```json
{
  "httpStatusCode": 500,
  "errorMessage": "AI 리포트 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```
