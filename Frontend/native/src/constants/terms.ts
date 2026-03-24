export type TermDocumentKey = 'service' | 'privacy' | 'telecom';

export type TermDocument = {
  key: TermDocumentKey;
  termId: number | null;
  title: string;
  effectiveDate: string;
  url: string | null;
  required: boolean;
};

export const TERM_DOCUMENT_KEYS: TermDocumentKey[] = ['service', 'privacy', 'telecom'];

export const TERM_DOCUMENTS: Record<TermDocumentKey, TermDocument> = {
  service: {
    key: 'service',
    termId: null,
    title: '(필수) WoW 서비스 이용약관',
    effectiveDate: '',
    url: null,
    required: true,
  },
  privacy: {
    key: 'privacy',
    termId: null,
    title: '(필수) WoW 개인정보 처리 방침',
    effectiveDate: '',
    url: null,
    required: true,
  },
  telecom: {
    key: 'telecom',
    termId: null,
    title: '(필수) 통신사 본인확인서비스 이용약관',
    effectiveDate: '',
    url: null,
    required: true,
  },
};
