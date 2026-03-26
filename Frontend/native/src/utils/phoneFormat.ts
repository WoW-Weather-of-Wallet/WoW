export const maskPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) {
    return '-';
  }

  const cleaned = phoneNumber.replace(/[^0-9]/g, '');

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
  }

  return phoneNumber;
};
