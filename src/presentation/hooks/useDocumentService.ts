// Custom Hook - Document Service
'use client';

import { useMemo } from 'react';
import { DocumentService } from '@/src/application/services/DocumentService';
import { LocalStorageDocumentRepository } from '@/src/infrastructure/persistence/LocalStorageDocumentRepository';

export function useDocumentService() {
  return useMemo(() => {
    const repository = new LocalStorageDocumentRepository();
    const service = new DocumentService(repository);
    return service;
  }, []);
}
