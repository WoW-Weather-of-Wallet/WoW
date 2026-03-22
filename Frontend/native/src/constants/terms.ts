export type TermDocumentKey = 'service' | 'privacy' | 'telecom';

export type TermDocument = {
  key: TermDocumentKey;
  title: string;
  effectiveDate: string;
  url: string | null;
};

export const TERM_DOCUMENT_KEYS: TermDocumentKey[] = ['service', 'privacy', 'telecom'];

export const TERM_DOCUMENTS: Record<TermDocumentKey, TermDocument> = {
  service: {
    key: 'service',
    title: '(필수) WOW 서비스 이용약관 동의',
    effectiveDate: '',
    url: null,
  },
  privacy: {
    key: 'privacy',
    title: '(필수) 개인정보 수집 및 이용 동의',
    effectiveDate: '',
    url: null,
  },
  telecom: {
    key: 'telecom',
    title: '(필수) 통신사 본인확인서비스 이용약관 동의',
    effectiveDate: '',
    url: null,
  },
};
