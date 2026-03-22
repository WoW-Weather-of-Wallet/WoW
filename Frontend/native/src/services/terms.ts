import { TERM_DOCUMENTS, TERM_DOCUMENT_KEYS, type TermDocument, type TermDocumentKey } from '../constants/terms';
import { nativeApi } from './auth';

interface BackendTermResponse {
  termId: number;
  title: string;
  version: string;
  required: boolean;
  fileUrl: string | null;
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
      title: term.title || TERM_DOCUMENTS[key].title,
      effectiveDate: formatEffectiveDate(term.version),
      url: term.fileUrl,
    };
  });

  return nextTerms;
}

function resolveTermKey(title: string): TermDocumentKey | null {
  if (title.includes('개인정보')) {
    return 'privacy';
  }

  if (title.includes('통신사') || title.includes('본인확인')) {
    return 'telecom';
  }

  if (title.includes('서비스')) {
    return 'service';
  }

  return null;
}

function formatEffectiveDate(version: string) {
  const normalizedVersion = version.trim();

  if (!normalizedVersion) {
    return '';
  }

  return normalizedVersion.includes('시행') ? normalizedVersion : `${normalizedVersion} 시행`;
}

export function getTermList(terms: Record<TermDocumentKey, TermDocument>) {
  return TERM_DOCUMENT_KEYS.map((key) => terms[key]);
}
