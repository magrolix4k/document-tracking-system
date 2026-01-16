// Custom Hook - Document Query
'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/src/domain/entities/Document';
import { useDocumentService } from './useDocumentService';

export function useDocument(id: string | null) {
  const service = useDocumentService();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const doc = service.getDocumentById(id);
      setDocument(doc);
      setError(doc ? null : 'ไม่พบเอกสาร');
    } catch {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }, [id, service]);

  return { document, loading, error };
}
