export type SignupMode = 'normal' | 'ssafy';
export type RecoveryFlow = 'FindId' | 'FindPw';
export type AccountRecoveryUserType = 'local' | 'ssafy' | 'none' | 'fail';

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

export interface PhoneAuthRouteParams extends SignupIdentityRouteParams {
  flow?: RecoveryFlow;
  signupMode?: SignupMode;
  pendingToken?: string;
  telecom?: string;
}

export interface VerifyCodeRouteParams extends SignupIdentityRouteParams {
  flow?: RecoveryFlow;
  signupMode?: SignupMode;
  pendingToken?: string;
  telecom?: string;
  userId?: string;
}

export interface CreateAccountRouteParams extends SignupIdentityRouteParams {}

export interface FindPwRouteParams {
  prefilledId?: string;
}

export interface ResetPasswordRouteParams {
  userId?: string;
  name?: string;
  ssnFront?: string;
  ssnBack?: string;
  phoneNumber?: string;
}

export interface AccountRecoveryResultRouteParams {
  name?: string;
  userId?: string;
  userType?: AccountRecoveryUserType;
}

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
