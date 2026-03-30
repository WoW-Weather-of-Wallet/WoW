import type { IdentityGender } from '../types/auth';

export interface IdentityProfile {
  birthDate: string;
  gender: IdentityGender;
}

const getBirthYearPrefix = (ssnBackCode: string) => {
  if (['1', '2', '5', '6'].includes(ssnBackCode)) {
    return '19';
  }

  if (['3', '4', '7', '8'].includes(ssnBackCode)) {
    return '20';
  }

  if (['9', '0'].includes(ssnBackCode)) {
    return '18';
  }

  return null;
};

export const buildBirthDateFromIdentity = (
  ssnFront?: string,
  ssnBack?: string,
) => {
  if (!ssnFront || ssnFront.length !== 6 || !ssnBack || ssnBack.length === 0) {
    return null;
  }

  const yearPrefix = getBirthYearPrefix(ssnBack[0]);
  if (!yearPrefix) {
    return null;
  }

  return `${yearPrefix}${ssnFront.slice(0, 2)}-${ssnFront.slice(2, 4)}-${ssnFront.slice(4, 6)}`;
};

export const buildGenderFromIdentity = (
  ssnBack?: string,
): IdentityGender | null => {
  if (!ssnBack || ssnBack.length === 0) {
    return null;
  }

  if (!/^\d$/.test(ssnBack[0])) {
    return null;
  }

  return parseInt(ssnBack[0], 10) % 2 !== 0 ? 'M' : 'F';
};

export const buildIdentityProfile = (
  ssnFront?: string,
  ssnBack?: string,
): IdentityProfile | null => {
  const birthDate = buildBirthDateFromIdentity(ssnFront, ssnBack);
  const gender = buildGenderFromIdentity(ssnBack);

  if (!birthDate || !gender) {
    return null;
  }

  return {
    birthDate,
    gender,
  };
};

export const decodeUnicodeEscapes = (value: string | null) => {
  if (!value || !value.includes('\\u')) {
    return value;
  }

  return value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
};
