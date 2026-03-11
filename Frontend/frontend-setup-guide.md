# 🚀 FrontEnd 초기 세팅 가이드

> React 19 (웹) + React Native / Expo 54 (앱) 기준  
> 작성일: 2026-03-09

---

## ✅ 전제 조건

```bash
node --version   # v18 이상 필요
npm --version    # v9 이상 권장
```

Node.js 설치가 안 되어 있다면 https://nodejs.org 에서 LTS 버전 설치

---

## 📦 1단계 - 웹(React) 세팅

```bash
cd FrontEnd/react
npm install
npm run dev      # 개발 서버 실행 → localhost:3000
```

---

## 📱 2단계 - 앱(React Native) 세팅

### 일반 npm install 시 주의사항

> `@types/react` 버전 충돌 에러가 날 수 있어요.  
> package.json의 `@types/react`가 `~19.1.0` 이상인지 확인 후 설치하세요.

```bash
cd FrontEnd/native

# 혹시 이전에 설치했다면 초기화 먼저
rm -rf node_modules
rm -f package-lock.json

# 설치
npm install

# expo SDK 버전에 맞게 패키지 자동 조정 (중요!)
npx expo install --fix
```

---

## ▶️ 3단계 - 앱 실행

### Expo Go 실기기 테스트 (추천 ⭐)

```bash
# 1. 핸드폰에 Expo Go 앱 설치 (App Store / Google Play)
# 2. PC와 핸드폰이 같은 와이파이 연결
# 3. 아래 명령어 실행 후 QR 코드 스캔

npx expo start
```

### SSAFY 강의장 (네트워크 막힌 경우)

```bash
# 터널링으로 우회
npx expo start --tunnel
```

### 안드로이드 에뮬레이터

```bash
# Android Studio 설치 및 에뮬레이터 실행 후
npx expo start --android
```

### iOS 시뮬레이터 (맥 전용)

```bash
# Xcode 설치 후
npx expo start --ios
```

---

## 🛠️ 자주 쓰는 명령어

### 웹 (react/)

```bash
npm run dev        # 개발 서버 실행 (localhost:3000)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과물 미리보기
```

### 앱 (native/)

```bash
npx expo start              # 개발 서버 실행 (QR 코드)
npx expo start --tunnel     # 터널링 모드 (SSAFY 강의장)
npx expo start --android    # 안드로이드 에뮬레이터
npx expo start --ios        # iOS 시뮬레이터 (맥 전용)
npx expo install --fix      # expo SDK 기준 패키지 버전 자동 조정
npx expo install [패키지명]  # expo 호환 버전으로 패키지 설치
```

### 패키지 설치 (앱에서는 npm 대신 expo 권장)

```bash
# ❌ 앱에서 일반 npm 설치 (버전 충돌 위험)
npm install [패키지명]

# ✅ 앱에서 expo 방식으로 설치 (버전 자동 맞춤)
npx expo install [패키지명]
```

---

## 🔧 트러블슈팅

### `npm install` 시 peer dependency 에러

```bash
# 방법 1 - legacy 모드로 설치 (빠른 해결)
npm install --legacy-peer-deps

# 방법 2 - 완전 초기화 후 재설치
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
npm install
```

### `npx expo install --fix` 전에 expo 없다는 에러

```bash
# expo가 아직 설치 안 된 상태
# npm install 먼저 완료 후 --fix 실행
npm install
npx expo install --fix
```

### SSAFY 강의장에서 Expo Go 연결 안 될 때

```bash
# 터널링 모드 사용
npx expo start --tunnel
# 추가 패키지 설치 필요할 수 있음
npx expo install @expo/ngrok
```

### 포트 충돌 (웹 3000번 포트 사용 중)

```bash
# 다른 포트로 실행
npx vite --port 3001
```

### 앱 캐시 문제로 이상하게 동작할 때

```bash
npx expo start --clear   # Metro 번들러 캐시 초기화
```

---

## 📁 참고 - 폴더 구조

```
FrontEnd/
├── react/       # 웹 (서비스 소개 랜딩페이지)
├── native/      # 앱 (실제 금융 서비스)
└── shared/      # 웹 + 앱 공통 타입/API/상수
```

> 💡 `shared/`는 별도 npm install 불필요  
> vite alias + tsconfig paths로 직접 참조하는 방식
