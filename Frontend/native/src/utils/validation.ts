/**
 * @file validation.ts
 * @description 아이디 및 비밀번호의 강력한 검증 규칙을 제공하는 유틸리티 파일입니다.
 * 보안 정책에 따라 복잡성, 연속성, 반복성 검사를 수행합니다.
 */

/**
 * 아이디 검증 결과 인터페이스
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * 아이디(ID) 유효성 검사 규칙:
 * 1. 길이: 4자 ~ 20자
 * 2. 문자 구성: 영문 소문자 + 숫자 조합
 * 3. 필수 포함: 영문 소문자 1개 이상 필수
 * 4. 제한 사항: 특수문자 불가
 */
export const validateId = (id: string): ValidationResult => {
  const trimmedId = id.trim();

  // 1. 길이 체크
  if (trimmedId.length < 4 || trimmedId.length > 20) {
    return {
      isValid: false,
      message: '아이디는 4자 이상 20자 이하로 입력해주세요.',
    };
  }

  // 2. 특수문자 및 대문자 금지 (영문 소문자와 숫자만 허용)
  if (!/^[a-z0-9]+$/.test(trimmedId)) {
    return {
      isValid: false,
      message: '아이디는 영문 소문자와 숫자만 사용할 수 있습니다.',
    };
  }

  // 3. 영문 소문자 필수 포함 여부 확인
  if (!/[a-z]/.test(trimmedId)) {
    return {
      isValid: false,
      message: '아이디에 영문 소문자를 최소 1개 이상 포함해야 합니다.',
    };
  }

  /**
   * [Bug-Fix] 아이디 숫자 필구 포함 규칙 추가
   * 보안 강화를 위해 영문뿐만 아니라 숫자도 최소 1개 이상 포함하도록 검증을 강화합니다.
   */
  if (!/[0-9]/.test(trimmedId)) {
    return {
      isValid: false,
      message: '아이디에 숫자를 최소 1개 이상 포함해야 합니다.',
    };
  }

  return { isValid: true, message: '사용 가능한 형식의 아이디입니다.' };
};

/**
 * 비밀번호(Password) 유효성 검사 규칙:
 * 1. 길이: 8자 ~ 20자
 * 2. 복잡성: 영문 대문자, 소문자, 숫자, 특수문자(!@#$%^&*) 각각 1개 이상 포함
 * 3. 아이디 대조: 아이디와 동일할 수 없음
 * 4. 연속성: 4개 이상 연속된 문자/숫자 불가 (예: 1234, abcd)
 * 5. 반복성: 4개 이상 동일한 문자/숫자 반복 불가 (예: aaaa, 1111)
 */
export const validatePassword = (password: string, userId?: string): ValidationResult => {
  const pw = password;

  // 1. 길이 체크
  if (pw.length < 8 || pw.length > 20) {
    return {
      isValid: false,
      message: '비밀번호는 8자 이상 20자 이하로 입력해주세요.',
    };
  }

  // 2. 복잡성 체크 (대문자, 소문자, 숫자, 특수문자)
  const hasUppercase = /[A-Z]/.test(pw);
  const hasLowercase = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return {
      isValid: false,
      message: '비밀번호는 영문 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
    };
  }

  // 3. 아이디와 동일한지 체크
  if (userId && pw === userId) {
    return {
      isValid: false,
      message: '아이디와 동일한 비밀번호는 사용할 수 없습니다.',
    };
  }

  // 4. 동일 문자 4회 반복 체크 (aaaa, 1111 등)
  for (let i = 0; i <= pw.length - 4; i++) {
    if (
      pw[i] === pw[i + 1] &&
      pw[i] === pw[i + 2] &&
      pw[i] === pw[i + 3]
    ) {
      return {
        isValid: false,
        message: '동일한 문자를 4번 이상 연속해서 사용할 수 없습니다.',
      };
    }
  }

  // 5. 연속된 문자/숫자 4개 체크 (1234, abcd, 4321, dcba 등)
  for (let i = 0; i <= pw.length - 4; i++) {
    const charCode1 = pw.charCodeAt(i);
    const charCode2 = pw.charCodeAt(i + 1);
    const charCode3 = pw.charCodeAt(i + 2);
    const charCode4 = pw.charCodeAt(i + 3);

    // 오름차순 (1234, abcd)
    if (
      charCode2 === charCode1 + 1 &&
      charCode3 === charCode2 + 1 &&
      charCode4 === charCode3 + 1
    ) {
      return {
        isValid: false,
        message: '연속된 문자나 숫자를 4개 이상 사용할 수 없습니다.',
      };
    }

    // 내림차순 (4321, dcba)
    if (
      charCode2 === charCode1 - 1 &&
      charCode3 === charCode2 - 1 &&
      charCode4 === charCode3 - 1
    ) {
      return {
        isValid: false,
        message: '연속된 문자나 숫자를 4개 이상 사용할 수 없습니다.',
      };
    }
  }

  return { isValid: true, message: '안전한 비밀번호입니다.' };
};

/**
 * [Defense-Log] 백엔드 요청값 검증(P2) 부재에 대응하기 위한 이름 검증
 * 이름은 2~20자 사이의 한글/영문만 허용하며 필수 입력값입니다.
 */
export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) return { isValid: false, message: '이름을 입력해주세요.' };
  if (trimmed.length < 2 || trimmed.length > 20) return { isValid: false, message: '이름은 2자 이상 20자 이하로 입력해주세요.' };
  if (!/^[a-zA-Z가-힣\s]+$/.test(trimmed)) return { isValid: false, message: '이름에 특수문자나 숫자를 포함할 수 없습니다.' };
  return { isValid: true, message: '올바른 이름 형식입니다.' };
};

/**
 * [Defense-Log] 백엔드 전화번호 중복 체크(P1) 및 검증(P2) 부재에 대응
 * 숫자만 10~11자리인지 확인합니다.
 */
export const validatePhone = (phone: string): ValidationResult => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned) return { isValid: false, message: '휴대폰 번호를 입력해주세요.' };
  if (cleaned.length < 10 || cleaned.length > 11) return { isValid: false, message: '올바른 휴대폰 번호 형식이 아닙니다. (10~11자리 숫자)' };
  return { isValid: true, message: '올바른 휴대폰 번호 형식입니다.' };
};

/**
 * [Defense-Log] 백엔드 생년월일 검증(P2) 부재에 대응
 * 8자리 숫자(YYYYMMDD) 형식을 확인합니다.
 */
export const validateBirthDate = (birthDate: string): ValidationResult => {
  const cleaned = birthDate.replace(/[^0-9]/g, '');
  if (!cleaned) return { isValid: false, message: '생년월일을 입력해주세요.' };
  if (cleaned.length !== 8) return { isValid: false, message: '생년월일 8자리를 입력해주세요. (예: 19990101)' };
  
  const year = parseInt(cleaned.substring(0, 4), 10);
  const month = parseInt(cleaned.substring(4, 6), 10);
  const day = parseInt(cleaned.substring(6, 8), 10);

  const now = new Date();
  const currentYear = now.getFullYear();

  if (year < 1900 || year > currentYear)
    return { isValid: false, message: '태어난 년도를 정확히 입력해주세요.' };
  if (month < 1 || month > 12) return { isValid: false, message: '태어난 월을 정확히 입력해주세요.' };

  // [UX-Refinement] 월별 최대 일수 및 윤년 검증 추가
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day < 1 || day > daysInMonth[month - 1]) {
    return { isValid: false, message: `태어난 일을 정확히 입력해주세요. (${month}월은 1~${daysInMonth[month - 1]}일까지 있어요)` };
  }

  return { isValid: true, message: '올바른 생년월일 형식입니다.' };
};
