# AI Report API Spec

## Purpose

This document defines the backend-facing AI report contract and the current
runtime policy.

- Full AI report JSON is cached in Redis.
- Existing DB tables are used only for minimal monthly snapshot storage.
- No new DB schema is required for this flow.

## Backend Public API

- Method: `GET`
- Path: `/api/v1/ai/analysis`
- Auth: required
- Query:
  - `year` optional
  - `month` optional

If `year` and `month` are omitted, the backend uses the current year/month in
the server time zone.

## Report Period Rule

The AI report is built from a rolling 3-month window.

- Example: `2026-03`
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
      "description": "사무/교육용품과 서적/도서 비중이 매우 높고 분식 소비가 함께 나타나는 학습 집중형 유형",
      "icon": "📚"
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
        "description": "충동 구매 대신 '하루 1회' 같은 규칙을 정하고, 나머지는 티백·원두·견과류 등 대체재로 고정하세요."
      }
    ],
    "goal": {
      "savable_amount": 29258,
      "expected_spending": 970842,
      "action_tip": "커피/음료를 주 3회 구매로 제한하고 나머지는 대체 음료로 고정해보세요."
    }
  }
}
```

## Cache Policy

- Redis key: `ai:monthly:report:{userId}:{year}:{month}`
- TTL: 6 hours
- Cache payload: full AI report JSON

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

## Error Response Examples

No transactions in the rolling 3-month window:

```json
{
  "httpStatusCode": 404,
  "errorMessage": "최근 3개월 내 AI 리포트를 생성할 거래 내역이 없습니다."
}
```

AI server timeout or connection failure:

```json
{
  "httpStatusCode": 500,
  "errorMessage": "AI 리포트 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요."
}
```
