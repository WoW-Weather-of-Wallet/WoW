import { useEffect, useState } from 'react';
import { TERM_DOCUMENTS, type TermDocument, type TermDocumentKey } from '../constants/terms';
import { getTerms } from '../services/terms';

type TermDocumentsState = Record<TermDocumentKey, TermDocument>;

export function useTermDocuments(visible: boolean) {
  const [documents, setDocuments] = useState<TermDocumentsState>(TERM_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isCancelled = false;

    setIsLoading(true);

    getTerms()
      .then((nextDocuments) => {
        if (isCancelled) {
          return;
        }

        setDocuments(nextDocuments);
      })
      .catch((error) => {
        console.warn('Failed to load term documents', error);
      })
      .finally(() => {
        if (isCancelled) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [visible]);

  return {
    documents,
    isLoading,
  };
}
