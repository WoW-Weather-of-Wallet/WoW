export type SignupMode = 'normal' | 'ssafy';
export type RecoveryFlow = 'FindId' | 'FindPw';

export type IdentityGender = 'M' | 'F';

export interface IdentityVerificationData {
  name: string;
  ssnFront: string;
  ssnBack: string;
  telecom: string;
  phone: string;
}

export interface SignupIdentityRouteParams {
  name?: string;
  phone?: string;
  ssnFront?: string;
  ssnBack?: string;
  termsAgreed?: boolean;
}

export interface CreateAccountRouteParams extends SignupIdentityRouteParams {}

export interface WelcomeRouteParams {
  signupMode?: SignupMode;
  userId?: string;
  pendingToken?: string;
  pw?: string;
  name?: string;
  birthDate?: string;
  gender?: IdentityGender;
  phoneNumber?: string;
  termsAgreed?: boolean;
  alarmEnabled?: boolean;
}
