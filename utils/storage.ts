// Backward compatibility layer - uses Firebase for data persistence
'use client';

import { firebaseDocumentService } from '@/src/infrastructure/firebase';
import { Document } from '@/src/domain/entities';

// Cache for in-memory storage (for better performance during session)
let documentCache: Document[] | null = null;
let cacheInitialized = false;

// Initialize cache on first load
async function initializeCache() {
  if (!cacheInitialized && typeof window !== 'undefined') {
    try {
      documentCache = await firebaseDocumentService.getAllDocuments();
      cacheInitialized = true;
    } catch (error) {
      console.error('Error initializing cache:', error);
      documentCache = [];
      cacheInitialized = true;
    }
  }
}

// Export old API for backward compatibility with existing pages
export const getDocumentById = async (id: string) => {
  try {
    return await firebaseDocumentService.getDocumentById(id);
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};

export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    if (!cacheInitialized) {
      await initializeCache();
    }
    return documentCache || [];
  } catch (error) {
    console.error('Error getting all documents:', error);
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
    console.error('Error searching documents:', error);
    return [];
  }
};

export const updateDocument = async (id: string, updated: any, staffName?: string) => {
  try {
    const doc = await getDocumentById(id);
    if (!doc) {
      console.error('Document not found:', id);
      return;
    }

    const updatedDoc = { ...doc, ...updated };

    // Add history entry if status is changing
    if (updated.status && updated.status !== doc.status) {
      const historyEntry: any = {
        timestamp: new Date().toISOString(),
        action: updated.status === 'processing' ? 'received' : updated.status === 'completed' ? 'completed' : 'updated',
        newValue: updated.status,
      };
      
      // Only add staffName if it exists
      if (staffName) {
        historyEntry.staffName = staffName;
      }
      
      updatedDoc.history = [
        ...(doc.history || []),
        historyEntry
      ];
    }

    await firebaseDocumentService.updateDocument(id, updatedDoc);
    
    // Update cache
    if (documentCache) {
      const index = documentCache.findIndex(d => d.id === id);
      if (index >= 0) {
        documentCache[index] = updatedDoc;
      }
    }
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const updateDocumentStatus = async (id: string, status: string, staffName?: string) => {
  try {
    await updateDocument(id, { status }, staffName);
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

export const addHistory = async (id: string, action: string, staffName?: string, note?: string) => {
  try {
    const doc = await getDocumentById(id);
    if (!doc) {
      console.error('Document not found:', id);
      return;
    }

    const historyEntry = {
      timestamp: new Date().toISOString(),
      action,
      staffName,
      note,
    };

    const updatedHistory = [...(doc.history || []), historyEntry];
    await firebaseDocumentService.updateDocument(id, { history: updatedHistory });

    // Update cache
    if (documentCache) {
      const index = documentCache.findIndex(d => d.id === id);
      if (index >= 0) {
        documentCache[index].history = updatedHistory;
      }
    }
  } catch (error) {
    console.error('Error adding history:', error);
    throw error;
  }
};

export const deleteDocument = async (id: string) => {
  try {
    await firebaseDocumentService.deleteDocument(id);
    
    // Update cache
    if (documentCache) {
      documentCache = documentCache.filter(doc => doc.id !== id);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
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
    
    // Update cache
    if (documentCache) {
      const existingIndex = documentCache.findIndex(d => d.id === doc.id);
      if (existingIndex >= 0) {
        documentCache[existingIndex] = doc;
      } else {
        documentCache.push(doc);
      }
    }
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
};

export const getDocumentsByDepartment = async (department: string) => {
  try {
    return await firebaseDocumentService.getDocumentsByDepartment(department);
  } catch (error) {
    console.error('Error getting documents by department:', error);
    return [];
  }
};

export const getDocumentsByStatus = async (departmentOrStatus: string, status?: string) => {
  try {
    return await firebaseDocumentService.getDocumentsByStatus(departmentOrStatus, status);
  } catch (error) {
    console.error('Error getting documents by status:', error);
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
