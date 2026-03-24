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
    title: '(\uD544\uC218) WoW \uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00',
    effectiveDate: '',
    url: null,
    required: true,
  },
  privacy: {
    key: 'privacy',
    termId: null,
    title: '(\uD544\uC218) WoW \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC \uBC29\uCE68',
    effectiveDate: '',
    url: null,
    required: true,
  },
  telecom: {
    key: 'telecom',
    termId: null,
    title: '(\uD544\uC218) \uD1B5\uC2E0\uC0AC \uBCF8\uC778\uD655\uC778\uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00',
    effectiveDate: '',
    url: null,
    required: true,
  },
};
