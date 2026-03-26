import type {
  CompositeNavigationProp,
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/native';
import type {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps
} from '@react-navigation/native-stack';
import type {
  AccountRecoveryResultRouteParams,
  CreateAccountRouteParams,
  FindPwRouteParams,
  PhoneAuthRouteParams,
  ResetPasswordRouteParams,
  VerifyCodeRouteParams,
  WelcomeRouteParams,
} from './auth';

// =============================================
// types/ - 앱 내부에서 공통으로 쓰는 타입 정의
// navigation, user, api 타입을 이 폴더에서 모아 관리합니다.
// =============================================

export interface TermsPdfParams {
  title: string;
  url: string;
}

export interface VerifiedProfileParams {
  phoneNumber: string;
  name: string;
  birthDate: string;
  gender: string;
}

export type AiFeedbackStackParamList = {
  AiFeedbackHome: undefined;
  AiLoading: undefined;
  AiResult: undefined;
};

export type MyPageStackParamList = {
  MyPageHome: undefined;
  Settings: undefined;
  Withdraw: VerifiedProfileParams;
  PhoneUpdate: VerifiedProfileParams;
};

export type MainTabParamList = {
  MainHome: undefined;
  Calendar: { action?: 'add_record' } | undefined;
  AiFeedback: NavigatorScreenParams<AiFeedbackStackParamList> | undefined;
  MyPage: NavigatorScreenParams<MyPageStackParamList> | undefined;
};

/**
 * 루트 스택 네비게이션 파라미터 정의
 * 인증 플로우와 메인 진입점을 한 타입에 모아 두면
 * 화면 이동 이름을 잘못 쓰는 실수를 줄일 수 있습니다.
 */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Onboarding: undefined;
  Main: undefined;
  PhoneAuth: PhoneAuthRouteParams | undefined;
  VerifyCode: VerifyCodeRouteParams;
  CreateAccount: CreateAccountRouteParams | undefined;
  Welcome: WelcomeRouteParams | undefined;
  AccountRecoveryEntry: undefined;
  FindId: undefined;
  FindPw: FindPwRouteParams | undefined;
  AccountRecoveryResult: AccountRecoveryResultRouteParams;
  ResetPassword: ResetPasswordRouteParams;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  TermsPdf: TermsPdfParams;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, T>,
    RootNavigationProp
  >;
export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<
  MainTabParamList,
  T
>;
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type AiFeedbackStackNavigationProp<
  T extends keyof AiFeedbackStackParamList,
> = CompositeNavigationProp<
  NativeStackNavigationProp<AiFeedbackStackParamList, T>,
  RootNavigationProp
>;
export type AiFeedbackStackRouteProp<
  T extends keyof AiFeedbackStackParamList,
> = RouteProp<AiFeedbackStackParamList, T>;
export type AiFeedbackStackScreenProps<
  T extends keyof AiFeedbackStackParamList,
> = {
  navigation: AiFeedbackStackNavigationProp<T>;
  route: AiFeedbackStackRouteProp<T>;
};

export type MyPageStackNavigationProp<
  T extends keyof MyPageStackParamList,
> = CompositeNavigationProp<
  NativeStackNavigationProp<MyPageStackParamList, T>,
  RootNavigationProp
>;
export type MyPageStackRouteProp<T extends keyof MyPageStackParamList> = RouteProp<
  MyPageStackParamList,
  T
>;
export type MyPageStackScreenProps<T extends keyof MyPageStackParamList> = {
  navigation: MyPageStackNavigationProp<T>;
  route: MyPageStackRouteProp<T>;
};

/**
 * 사용자 기본 타입
 * 실제 백엔드 user 응답이 정리되면 shared/types/user.ts와 협의 후 맞추면 됩니다.
 */
export interface User {
  id: string;
  username: string;
}

export * from './auth';
