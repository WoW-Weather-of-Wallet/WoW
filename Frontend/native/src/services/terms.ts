import {
  TERM_DOCUMENTS,
  TERM_DOCUMENT_KEYS,
  type TermDocument,
  type TermDocumentKey,
} from '../constants/terms';
import { nativeApi } from './auth';

interface BackendTermResponse {
  termId: number;
  title: string;
  version: string;
  required: boolean;
  fileUrl: string | null;
}

export interface TermAgreementItemRequest {
  termId: number;
  agreed: boolean;
}

export interface TermsAgreeRequest {
  agreements: TermAgreementItemRequest[];
}

export interface TermsAgreeResponse {
  savedCount: number;
}

let cachedTerms: Record<TermDocumentKey, TermDocument> | null = null;

export async function getTerms(forceRefresh = false) {
  if (!forceRefresh && cachedTerms) {
    return cachedTerms;
  }

  const response = await nativeApi.get<BackendTermResponse[]>('/api/v1/terms');
  const mappedTerms = mapBackendTerms(response.data);

  cachedTerms = mappedTerms;
  return mappedTerms;
}

export async function agreeTerms(payload: TermsAgreeRequest) {
  const response = await nativeApi.post<TermsAgreeResponse>(
    '/api/v1/user/terms/agree',
    payload,
  );
  return response.data;
}

function mapBackendTerms(terms: BackendTermResponse[]) {
  const nextTerms: Record<TermDocumentKey, TermDocument> = {
    ...TERM_DOCUMENTS,
  };

  terms.forEach((term) => {
    const key = resolveTermKey(term.title);

    if (!key) {
      return;
    }

    nextTerms[key] = {
      key,
      termId: term.termId,
      title: term.title || TERM_DOCUMENTS[key].title,
      effectiveDate: formatEffectiveDate(term.version),
      url: term.fileUrl,
      required: term.required,
    };
  });

  return nextTerms;
}

function resolveTermKey(title: string): TermDocumentKey | null {
  const normalizedTitle = normalizeTitle(title);

  // Match the live terms table with stable keywords so the UI does not depend on
  // hardcoded document ordering or previously broken mojibake strings.
  if (normalizedTitle.includes('개인정보')) {
    return 'privacy';
  }

  if (
    normalizedTitle.includes('통신사') ||
    normalizedTitle.includes('본인확인')
  ) {
    return 'telecom';
  }

  if (
    normalizedTitle.includes('서비스') &&
    normalizedTitle.includes('이용약관')
  ) {
    return 'service';
  }

  return null;
}

function normalizeTitle(title: string) {
  return title.replace(/\s+/g, '').trim();
}

function formatEffectiveDate(version: string) {
  const normalizedVersion = version.trim();

  if (!normalizedVersion) {
    return '';
  }

  return normalizedVersion.includes('시행')
    ? normalizedVersion
    : `${normalizedVersion} 시행`;
}

export function getTermList(terms: Record<TermDocumentKey, TermDocument>) {
  return TERM_DOCUMENT_KEYS.map((key) => terms[key]);
}
