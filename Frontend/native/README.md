# 🚀 WOW 핀테크 앱 - Splash & Login 구현 리포트

> **브랜치**: `front-feat/loginpage`  
> **작업일**: 2026-03-10  
> **기술 스택**: React Native (Expo 54) + NativeWind v4 + Reanimated + TypeScript

---

## 📁 디렉토리 구조

협업/분업에 최적화된 **역할별 분리** 구조로 설계했습니다.

```
src/
├── assets/          → 이미지, 아이콘 등 정적 리소스
├── components/      → 재사용 공통 컴포넌트
│   └── common/      → GradientButton, CustomTextInput
├── constants/       → 테마 색상, 반응형 유틸 (theme.ts)
├── hooks/           → 커스텀 훅 (추후 확장)
├── navigation/      → 네비게이션 설정 (RootNavigator)
├── screens/         → 화면 컴포넌트
│   └── auth/        → SplashScreen, LoginScreen
├── services/        → API 서비스 (백엔드 연결 시)
├── store/           → Zustand 상태관리
├── styles/          → 글로벌 CSS (NativeWind)
├── types/           → TypeScript 타입 정의
└── utils/           → 유틸리티 함수 (검증 등)
```

> [!TIP]
> **분업 가이드**: 화면 작업은 `screens/`, 공통 UI는 `components/common/`, API 연결은 `services/`, 상태관리는 `store/`에서 독립적으로 작업 가능합니다.

---

## 🎨 구현 화면

### 1. Splash Screen (로고 등장)
| 항목 | 내용 |
|------|------|
| 파일 | [SplashScreen.tsx](file:///c:/Users/SSAFY/Desktop/S14P21D106/Frontend/native/src/screens/auth/SplashScreen.tsx) |
| 배경 | `#6666ee` 기반 3단 그라데이션 (`#7B7BF5` → `#6666ee` → `#5252CC`) |
| 로고 | `splash.png` 사용 (WOW 원형 로고) |
| 애니메이션 | 페이드인 (800ms) + 스케일업 (0.6→1.0, 스프링) + 슬라이드업 |
| 전환 | 2.2초 후 페이드아웃 → Login 화면으로 자동 이동 |

### 2. Login Screen (로그인/회원가입)
| 항목 | 내용 |
|------|------|
| 파일 | [LoginScreen.tsx](file:///c:/Users/SSAFY/Desktop/S14P21D106/Frontend/native/src/screens/auth/LoginScreen.tsx) |
| 타이틀 | "로그인" + 테마 컬러 언더라인 |
| 입력 | 아이디/비밀번호 (포커스 시 보더 컬러 애니메이션) |
| 버튼 | 회원가입(outline) / 로그인(gradient) 가로 배치 |
| 기능 | 자동 로그인 토글, 아이디/비밀번호 찾기 |
| 소셜 | "또는" 구분선 + SSAFY 계정 로그인 (블루 그라데이션) |
| 애니메이션 | 각 요소 stagger FadeInDown (100ms 간격) |

---

## 📦 설치된 패키지

| 패키지 | 용도 |
|--------|------|
| `nativewind` v4 + `tailwindcss` | 스타일링 |
| `react-native-reanimated` | 고품질 애니메이션 |
| `expo-linear-gradient` | 그라데이션 배경/버튼 |
| `expo-splash-screen` | 폰트 로딩 전 스플래시 제어 |
| `@expo-google-fonts/inter` | 프리미엄 타이포그래피 |

---

## 🔧 설정 파일

| 파일 | 역할 |
|------|------|
| [babel.config.js](file:///c:/Users/SSAFY/Desktop/S14P21D106/Frontend/native/babel.config.js) | NativeWind + Reanimated 플러그인 |
| [metro.config.js](file:///c:/Users/SSAFY/Desktop/S14P21D106/Frontend/native/metro.config.js) | NativeWind CSS 지원 |
| [tailwind.config.js](file:///c:/Users/SSAFY/Desktop/S14P21D106/Frontend/native/tailwind.config.js) | #6666ee 팔레트 + Inter 폰트 |
| [nativewind-env.d.ts](file:///c:/Users/SSAFY/Desktop/S14P21D106/Frontend/native/nativewind-env.d.ts) | TypeScript 타입 지원 |

---

## 🔜 다음 작업 (추후)

- [ ] 회원가입(Signup) 화면 구현
- [ ] 백엔드 API 연결 (`services/authService.ts`)
- [ ] Zustand `authStore`로 로그인 상태 관리
- [ ] 메인 탭 네비게이터 (메인/캘린더/마이페이지)
- [ ] Expo Go에서 실기기 테스트

---

## 📱 실행 방법

```bash
cd Frontend/native
npx expo start -c
```
Expo Go 앱에서 QR 코드를 스캔하여 확인합니다. (캐시 문제 예방을 위해 `-c` 플래그 권장)

---

## 🪲 트러블슈팅 및 버전 관리 기록 (Troubleshooting)

기본 스캐폴딩 이후 Expo Go 연동 중 발생한 크리티컬 이슈들과 해결 방법(버전 맞춤)을 기록합니다.

### 1. `[Worklets] Mismatch` 에러 (0.7.4 vs 0.5.1)
- **증상**: Reanimated 레이아웃 애니메이션 구동 시 Worklet 버전 불일치로 런타임 에러(RedBox) 발생.
- **원인**: Expo Go 54 버전에 내장된 `react-native-worklets`의 네이티브 버전은 `0.5.1`인데, NPM에 설치된 JS 버전이 더 높았음.
- **해결**: `react-native-worklets-core`를 삭제하고 정확히 일치하는 `react-native-worklets@0.5.1`을 강제 설치하여 해결.

### 2. `SafeAreaView has been deprecated` 및 네비게이션 무반응
- **증상**: 터미널에 SafeAreaView 경고가 무한정 뜨면서 화면이 넘어가지 않음.
- **원인**: React Native 0.77 (Expo 54)부터 내장 `SafeAreaView`가 삭제되어, 과거 방식을 쓰는 라이브러리들에서 렌더링 오류 발생 가능성 존재.
- **해결**: `react-native-safe-area-context`를 명시적으로 설치하고, `App.tsx` 최상단을 `<SafeAreaProvider>`로 감싸 오류 방지 및 Navigation 동작 정상화.

### 3. 무한 네이티브 스플래시 화면 (App entry not found)
- **증상**: 로고만 떠있고 React 컴포넌트(`SplashScreen`)가 아예 마운트되지 않는 현상.
- **원인**: `package.json`의 `"main"` 속성이 `"App.tsx"`로 잘못 설정되어 있어, Expo의 `AppRegistry.registerComponent`가 포함된 `expo/AppEntry.js`가 실행되지 않음.
- **해결**: `"main": "expo/AppEntry.js"`로 진입점을 수정하여 React 트리가 정상적으로 네이티브에 붙도록 완벽 해결.
