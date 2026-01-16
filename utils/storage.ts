// Backward compatibility layer - uses Clean Architecture pattern
import { LocalStorageDocumentRepository } from '@/src/infrastructure/persistence';
import { DocumentService } from '@/src/application/services';
import { CreateDocumentDto, UpdateDocumentStatusDto } from '@/src/domain/entities';

const repository = new LocalStorageDocumentRepository();
const documentService = new DocumentService(repository);

// Export old API for backward compatibility with existing pages
export const getDocumentById = (id: string) => documentService.getDocumentById(id);
export const getAllDocuments = () => documentService.getAllDocuments();
export const searchDocuments = (filters: any) => documentService.searchDocuments(filters);

export const updateDocument = (id: string, updated: any, staffName?: string) => {
  try {
    const docs = getAllDocuments();
    const index = docs.findIndex(d => d.id === id);
    
    if (index === -1) {
      console.error('Document not found:', id);
      return;
    }

    // Merge updates into the document
    const doc = docs[index];
    const updatedDoc = { ...doc, ...updated };

    // Add history entry if status is changing
    if (updated.status && updated.status !== doc.status) {
      updatedDoc.history = [
        ...(doc.history || []),
        {
          timestamp: new Date().toISOString(),
          action: updated.status === 'processing' ? 'received' : updated.status === 'completed' ? 'completed' : 'updated',
          staffName: staffName || undefined,
          newValue: updated.status,
        }
      ];
    }

    // Update the document in the array
    docs[index] = updatedDoc;
    
    // Save directly to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('documents', JSON.stringify(docs));
    }
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const updateDocumentStatus = (id: string, status: string, staffName?: string) => {
  const dto: UpdateDocumentStatusDto = {
    status: status as any,
    staffName,
  };
  documentService.updateDocumentStatus(id, dto);
};

export const addHistory = (id: string, action: string, staffName?: string, note?: string) => {
  documentService.addHistory(id, { action, staffName, note });
};

export const deleteDocument = (id: string) => {
  try {
    const docs = getAllDocuments();
    const filtered = docs.filter(doc => doc.id !== id);
    
    if (docs.length === filtered.length) {
      console.warn('Document not found for deletion:', id);
      return;
    }
    
    // Save directly to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('documents', JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const generateDocumentId = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const documents = getAllDocuments();
  const todayDocs = documents.filter(doc => doc.id.includes(dateStr));
  const nextNum = (todayDocs.length + 1).toString().padStart(3, '0');
  return `DOC-${dateStr}-${nextNum}`;
};

// Additional helper functions for backward compatibility
export const saveDocument = (doc: any) => {
  const docs = getAllDocuments();
  const existingIndex = docs.findIndex(d => d.id === doc.id);
  if (existingIndex >= 0) {
    docs[existingIndex] = doc;
  } else {
    docs.push(doc);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('documents', JSON.stringify(docs));
  }
};

export const getDocumentsByDepartment = (department: string) => {
  return documentService.getDepartmentDocuments(department);
};

export const getDocumentsByStatus = (departmentOrStatus: string, status?: string) => {
  const docs = getAllDocuments();
  // If status is provided, it's (department, status) call
  if (status) {
    return docs.filter(doc => doc.department === departmentOrStatus && doc.status === status);
  }
  // Otherwise it's just (status) call
  return docs.filter(doc => doc.status === departmentOrStatus);
};

export const getCompletedToday = (department?: string) => {
  const today = new Date().toDateString();
  const docs = getAllDocuments().filter(doc => !department || doc.department === department);
  return docs.filter(
    doc =>
      doc.status === 'completed' &&
      new Date(doc.completedDate || '').toDateString() === today
  ).length;
};

export const getCompletedThisWeek = (department?: string) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const docs = getAllDocuments().filter(doc => !department || doc.department === department);
  
  return docs.filter(
    doc =>
      doc.completedDate &&
      doc.status === 'completed' &&
      new Date(doc.completedDate) >= startOfWeek
  ).length;
};

export const getCompletedThisMonth = (department?: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const docs = getAllDocuments().filter(doc => !department || doc.department === department);
  
  return docs.filter(
    doc =>
      doc.completedDate &&
      doc.status === 'completed' &&
      new Date(doc.completedDate) >= startOfMonth
  ).length;
};

export const getCompletedThisYear = (department?: string) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const docs = getAllDocuments().filter(doc => !department || doc.department === department);
  
  return docs.filter(
    doc =>
      doc.completedDate &&
      doc.status === 'completed' &&
      new Date(doc.completedDate) >= startOfYear
  ).length;
};

export const getAverageProcessingTime = (department?: string) => {
  const docs = getAllDocuments().filter(doc => !department || doc.department === department);
  const completed = docs.filter(doc => doc.status === 'completed');
  if (completed.length === 0) return 0;
  
  const totalTime = completed.reduce((sum, doc) => {
    const start = new Date(doc.submittedDate).getTime();
    const end = new Date(doc.completedDate || '').getTime();
    return sum + (end - start);
  }, 0);
  
  return Math.round(totalTime / (1000 * 60 * 60 * completed.length));
};

// Type re-exports for backward compatibility
export type { Document, Department, DocumentStatus, DocumentType, Priority } from '@/src/domain/entities';
