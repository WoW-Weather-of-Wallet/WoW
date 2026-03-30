import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TERM_DOCUMENTS,
  type TermDocument,
  type TermDocumentKey,
} from '../constants/terms';
import { getTermList, getTerms } from '../services/terms';

type TermDocumentsState = Record<TermDocumentKey, TermDocument>;

export function useTermDocuments(visible: boolean) {
  const [documents, setDocuments] = useState<TermDocumentsState>(TERM_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      const nextDocuments = await getTerms(forceRefresh);
      setDocuments(nextDocuments);
    } catch (error) {
      console.warn('Failed to load term documents', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    void loadDocuments();
  }, [loadDocuments, visible]);

  const termList = useMemo(() => getTermList(documents), [documents]);

  return {
    documents,
    termList,
    isLoading,
    refreshDocuments: () => loadDocuments(true),
  };
}
