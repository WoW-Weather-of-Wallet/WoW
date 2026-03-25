export type SignupMode = 'normal' | 'ssafy';

export type IdentityGender = 'M' | 'F';

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
