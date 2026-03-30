# AI Server Connection Guide

## Purpose

This note explains how the backend should connect to the Python AI server
for:

- monthly AI report generation
- calendar header spending weather calculation

The backend already calls the AI server through:

- internal property: `ai.server.base-url`
- environment variable: `AI_SERVER_BASE_URL`

Current default in
[application.yaml](/Users/SSAFY/Desktop/S14P21D106/Backend/src/main/resources/application.yaml)
is:

```yaml
ai:
  server:
    base-url: ${AI_SERVER_BASE_URL:http://127.0.0.1:8000}
```

## Which Address To Use

There are two connection cases.

### 1. Internal Pod / Internal Network Connection

Use this when the backend can reach the AI server inside the same internal
network.

Example:

```text
http://172.21.0.2:8000
```

This was the internal AI server address confirmed from the AI server logs.

### 2. External Connection

Use this when the backend server cannot access the Pod internal IP.

In this case, Runpod must expose container port `8000` as an external TCP
port.

Example:

```text
194.68.245.129:31xxx -> :8000
```

Then the backend base URL becomes:

```text
http://194.68.245.129:31xxx
```

Important:

- `194.68.245.129:22056 -> :22` is SSH only.
- It is **not** the AI API address.
- The AI API must point to external port mapped to internal `:8000`.

## Required Backend Configuration

Set this environment variable for the backend:

```text
AI_SERVER_BASE_URL=http://172.21.0.2:8000
```

or, if exposed externally:

```text
AI_SERVER_BASE_URL=http://194.68.245.129:31xxx
```

## AI Server Endpoints

Base URL example:

```text
http://172.21.0.2:8000
```

Endpoints:

- `GET /health`
- `POST /api/analyze`
- `POST /api/chat`
- `DELETE /api/session/{sessionId}`

## Backend Usage

The backend uses:

- `GET /api/v1/ai/analysis`
- `GET /api/v1/calendar/header`

Internally, `AiAnalysisService` sends a request to:

- `POST {AI_SERVER_BASE_URL}/api/analyze`

with aggregated 3-month category `items`.

## Connection Check Order

Before debugging backend code, always check the AI server in this order.

### 1. AI Server Health

From the machine that should call the AI server:

```bash
curl http://172.21.0.2:8000/health
```

or:

```bash
curl http://194.68.245.129:31xxx/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### 2. Backend Environment Variable

Check that `AI_SERVER_BASE_URL` is actually injected.

### 3. Backend Public API

Then test:

```text
GET /api/v1/ai/analysis
GET /api/v1/calendar/header
```

with a user who has enough recent transaction data.

## Recommended Timeout

- health: `5s`
- analyze: `180s`
- chat: `120s`

## Cold Start Note

The 14B model may require about `100 ~ 120 seconds` after server start
before it answers health and analyze requests stably.

If the server was just restarted:

- wait first
- confirm `/health`
- then call backend APIs

## Quick Troubleshooting

### Health works inside Pod but not from backend

Likely cause:

- backend cannot access internal Pod IP

Action:

- expose Runpod container port `8000`
- use external mapped port

### Backend returns AI server connection failure

Check:

- `AI_SERVER_BASE_URL`
- AI server `/health`
- network path between backend and AI server

### AI server is up but first request is slow

Likely cause:

- model cold start

Action:

- wait about `100 ~ 120 seconds`
- retry after `/health` is stable
