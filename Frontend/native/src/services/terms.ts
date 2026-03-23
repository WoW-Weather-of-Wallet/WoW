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
  const normalizedTitle = normalizeTitle(title);

  // The backend now manages the live terms table, so the app should map titles
  // by stable Korean keywords instead of relying on previously hardcoded mojibake.
  if (normalizedTitle.includes('\uAC1C\uC778\uC815\uBCF4')) {
    return 'privacy';
  }

  if (
    normalizedTitle.includes('\uD1B5\uC2E0\uC0AC') ||
    normalizedTitle.includes('\uBCF8\uC778\uD655\uC778')
  ) {
    return 'telecom';
  }

  if (
    normalizedTitle.includes('\uC11C\uBE44\uC2A4') &&
    normalizedTitle.includes('\uC774\uC6A9\uC57D\uAD00')
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

  return normalizedVersion.includes('\uC2DC\uD589')
    ? normalizedVersion
    : `${normalizedVersion} \uC2DC\uD589`;
}

export function getTermList(terms: Record<TermDocumentKey, TermDocument>) {
  return TERM_DOCUMENT_KEYS.map((key) => terms[key]);
}
