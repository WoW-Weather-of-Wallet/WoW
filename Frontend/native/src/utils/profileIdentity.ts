export const buildIdentityFrontFromBirthDate = (birthDate: string) => {
  if (!birthDate) {
    return '';
  }

  const digits = birthDate.replace(/-/g, '');
  return digits.length >= 8 ? digits.slice(2, 8) : '';
};

export const buildIdentityBackFromProfile = (
  gender: string,
  birthDate: string,
) => {
  if (!gender || !birthDate) {
    return '';
  }

  const year = parseInt(birthDate.slice(0, 4), 10);
  const isMale = gender === 'M';

  if (year >= 2000) {
    return isMale ? '3' : '4';
  }

  return isMale ? '1' : '2';
};
