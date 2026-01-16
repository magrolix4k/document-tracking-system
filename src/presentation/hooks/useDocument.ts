// Custom Hook - Document Query (Optimized)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document } from '@/src/domain/entities/Document';
import { useDocumentService } from './useDocumentService';

export function useDocument(id: string | null) {
  const service = useDocumentService();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const doc = service.getDocumentById(id);
      setDocument(doc);
      setError(doc ? null : 'ไม่พบเอกสาร');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [id, service]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const refetch = useCallback(() => {
    fetchDocument();
  }, [fetchDocument]);

  return { document, loading, error, refetch };
}
