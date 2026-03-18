export type TermDocumentKey = 'service' | 'privacy' | 'telecom';

export type TermDocument = {
  key: TermDocumentKey;
  title: string;
  effectiveDate: string;
  url: string | null;
};

export const TERM_DOCUMENTS: Record<TermDocumentKey, TermDocument> = {
  service: {
    key: 'service',
    title: '(필수) WOW 서비스 이용약관 동의',
    effectiveDate: '2026.03.17 시행',
    url: null,
  },
  privacy: {
    key: 'privacy',
    title: '(필수) 개인정보 수집 및 이용 동의',
    effectiveDate: '2026.03.17 시행',
    // Presigned S3 URLs expire quickly. Replace this with a freshly issued URL or fetch it from an API.
    url: 'https://ssafyapp-stg-project-prv-data.s3.ap-northeast-2.amazonaws.com/4e5piu/wow-privacy-policy.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260317T153209Z&X-Amz-SignedHeaders=host&X-Amz-Credential=AKIAW7FB3555IZHBLUZP%2F20260317%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Expires=3600&X-Amz-Signature=2ccfaf6cadf880280e58177eeda04284352a938b1e1c9777f87393281a078d73',
  },
  telecom: {
    key: 'telecom',
    title: '(필수) 통신사 본인확인서비스 이용약관 동의',
    effectiveDate: '2026.03.17 시행',
    url: null,
  },
};
