# WOW FrontEnd

**Weather Of Wallet** 프론트엔드 프로젝트

## 구조

```
FrontEnd/
├── react/      # 웹 (Vite + React + TypeScript)
├── native/     # 모바일 (Expo + React Native + TypeScript)
└── shared/     # 공통 타입/상수/API 설정
```

## 시작하기

### React 웹
```bash
cd react
npm install
npm run dev       # http://localhost:3000
```

### React Native 앱
```bash
cd native
npm install
npx expo start    # QR코드 스캔 or 에뮬레이터
```

## shared 사용법

```typescript
// 엔드포인트
import { ENDPOINTS } from '@shared/api/endpoints'

// 타입
import type { User } from '@shared/types/user'
import type { Transaction } from '@shared/types/transaction'

// 상수
import { EXPENSE_CATEGORIES } from '@shared/constants/categories'
import { SPENDING_TYPES } from '@shared/constants/spendingTypes'
```

## 환경변수

`react/.env` 파일 생성:
```
VITE_API_BASE_URL=http://192.168.70.7:8080
```
