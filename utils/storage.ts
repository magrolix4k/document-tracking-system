// Backward compatibility layer - uses Firebase for data persistence
'use client';

import { firebaseDocumentService } from '@/src/infrastructure/firebase';
import { Document, UpdateDocumentDto, HistoryEntry, DocumentStatus } from '@/src/domain/entities';
import { logger } from '@/src/shared/services';

// Export old API for backward compatibility with existing pages
export const getDocumentById = async (id: string): Promise<Document | null> => {
  try {
    return await firebaseDocumentService.getDocumentById(id);
  } catch (error) {
    logger.error('Error getting document', error instanceof Error ? error : undefined, 'storage', { id });
    return null;
  }
};

export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    return await firebaseDocumentService.getAllDocuments();
  } catch (error) {
    logger.error('Error getting all documents', error instanceof Error ? error : undefined, 'storage');
    return [];
  }
};

export const searchDocuments = async (filters: any) => {
  try {
    const docs = await getAllDocuments();
    return docs.filter(doc => {
      if (filters.senderName && !doc.senderName.toLowerCase().includes(filters.senderName.toLowerCase())) {
        return false;
      }
      if (filters.department && filters.department !== 'all' && doc.department !== filters.department) {
        return false;
      }
      return true;
    });
  } catch (error) {
    logger.error('Error searching documents', error instanceof Error ? error : undefined, 'storage', { filters });
    return [];
  }
};

export const updateDocument = async (id: string, updates: UpdateDocumentDto, staffName?: string): Promise<void> => {
  try {
    const doc = await getDocumentById(id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    const updatedDoc: Partial<Document> = { ...updates };

    // Add history entry if status is changing
    if (updates.status && updates.status !== doc.status) {
      const historyEntry: HistoryEntry = {
        timestamp: new Date().toISOString(),
        action: updates.status === 'processing' ? 'received' : 
                updates.status === 'completed' ? 'completed' :
                updates.status === 'cancelled' ? 'cancelled' : 'updated',
        newValue: updates.status,
      };
      
      if (staffName) {
        historyEntry.staffName = staffName;
      }

      if (updates.cancelReason && updates.status === 'cancelled') {
        historyEntry.note = updates.cancelReason;
      }
      
      updatedDoc.history = [
        ...(doc.history || []),
        historyEntry
      ];
    }

    await firebaseDocumentService.updateDocument(id, updatedDoc);
  } catch (error) {
    logger.error('Error updating document', error instanceof Error ? error : undefined, 'storage', { id, updates });
    throw error;
  }
};

export const updateDocumentStatus = async (id: string, status: DocumentStatus, staffName?: string): Promise<void> => {
  try {
    await updateDocument(id, { status }, staffName);
  } catch (error) {
    logger.error('Error updating document status', error instanceof Error ? error : undefined, 'storage', { id, status });
    throw error;
  }
};

export const addHistory = async (id: string, action: string, staffName?: string, note?: string): Promise<void> => {
  try {
    const doc = await getDocumentById(id);
    if (!doc) {
      throw new Error(`Document not found: ${id}`);
    }

    const historyEntry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      action,
      staffName,
      note,
    };

    const updatedHistory = [...(doc.history || []), historyEntry];
    await firebaseDocumentService.updateDocument(id, { history: updatedHistory });
  } catch (error) {
    logger.error('Error adding history', error instanceof Error ? error : undefined, 'storage', { id, action });
    throw error;
  }
};

export const deleteDocument = async (id: string) => {
  try {
    await firebaseDocumentService.deleteDocument(id);
  } catch (error) {
    logger.error('Error deleting document', error instanceof Error ? error : undefined, 'storage', { id });
    throw error;
  }
};

export const generateDocumentId = async () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const documents = await getAllDocuments();
  const todayDocs = documents.filter(doc => doc && doc.id && String(doc.id).includes(dateStr));
  const nextNum = (todayDocs.length + 1).toString().padStart(3, '0');
  return `DOC-${dateStr}-${nextNum}`;
};

// Additional helper functions for backward compatibility
export const saveDocument = async (doc: Document) => {
  try {
    await firebaseDocumentService.saveDocument(doc);
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

export const getDocumentsByDepartment = async (department: string) => {
  try {
    return await firebaseDocumentService.getDocumentsByDepartment(department);
  } catch (error) {
    logger.error('Error getting documents by department', error instanceof Error ? error : undefined, 'storage', { department });
    return [];
  }
};

export const getDocumentsByStatus = async (departmentOrStatus: string, status?: string) => {
  try {
    return await firebaseDocumentService.getDocumentsByStatus(departmentOrStatus, status);
  } catch (error) {
    logger.error('Error getting documents by status', error instanceof Error ? error : undefined, 'storage', { departmentOrStatus, status });
    return [];
  }
};

export const getCompletedToday = async (department?: string) => {
  const today = new Date().toDateString();
  const docs = await getAllDocuments();
  const filtered = department ? docs.filter(doc => doc.department === department) : docs;
  return filtered.filter(
    doc =>
      doc.status === 'completed' &&
      new Date(doc.completedDate || '').toDateString() === today
  ).length;
};

export const getCompletedThisWeek = async (department?: string) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const docs = await getAllDocuments();
  const filtered = department ? docs.filter(doc => doc.department === department) : docs;
  
  return filtered.filter(
    doc =>
      doc.completedDate &&
      doc.status === 'completed' &&
      new Date(doc.completedDate) >= startOfWeek
  ).length;
};

export const getCompletedThisMonth = async (department?: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const docs = await getAllDocuments();
  const filtered = department ? docs.filter(doc => doc.department === department) : docs;
  
  return filtered.filter(
    doc =>
      doc.completedDate &&
      doc.status === 'completed' &&
      new Date(doc.completedDate) >= startOfMonth
  ).length;
};

export const getCompletedThisYear = async (department?: string) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const docs = await getAllDocuments();
  const filtered = department ? docs.filter(doc => doc.department === department) : docs;
  
  return filtered.filter(
    doc =>
      doc.completedDate &&
      doc.status === 'completed' &&
      new Date(doc.completedDate) >= startOfYear
  ).length;
};

export const getAverageProcessingTime = async (department?: string) => {
  const docs = await getAllDocuments();
  const filtered = department ? docs.filter(doc => doc.department === department) : docs;
  const completed = filtered.filter(doc => doc.status === 'completed');
  if (completed.length === 0) return 0;
  
  const totalTime = completed.reduce((sum, doc) => {
    const start = new Date(doc.submittedDate).getTime();
    const end = new Date(doc.completedDate || '').getTime();
    return sum + (end - start);
  }, 0);
  
  return Math.round(totalTime / (1000 * 60 * 60 * completed.length));
};

// Type re-exports for backward compatibility
export type { Document, Department, DocumentStatus } from '@/src/domain/entities';
