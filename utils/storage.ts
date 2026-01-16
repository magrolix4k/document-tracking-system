import { Document, DocumentStatus, HistoryEntry } from '@/types/document';

const STORAGE_KEY = 'documents';

// Add history entry to document
export const addHistoryEntry = (
  document: Document,
  action: string,
  staffName?: string,
  oldValue?: string,
  newValue?: string,
  note?: string
): HistoryEntry => {
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    action,
    staffName,
    oldValue,
    newValue,
    note,
  };
  
  if (!document.history) {
    document.history = [];
  }
  document.history.push(entry);
  
  return entry;
};

export const generateDocumentId = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const documents = getAllDocuments();
  const todayDocs = documents.filter(doc => doc.id.includes(dateStr));
  const nextNum = (todayDocs.length + 1).toString().padStart(3, '0');
  return `DOC-${dateStr}-${nextNum}`;
};

export const getAllDocuments = (): Document[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDocumentById = (id: string): Document | null => {
  const documents = getAllDocuments();
  return documents.find(doc => doc.id === id) || null;
};

export const saveDocument = (document: Document): void => {
  const documents = getAllDocuments();
  documents.push(document);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

export const updateDocument = (id: string, updates: Partial<Document>, staffName?: string): boolean => {
  const documents = getAllDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return false;
  
  const oldDoc = documents[index];
  
  // Track status changes
  if (updates.status && updates.status !== oldDoc.status) {
    addHistoryEntry(
      oldDoc,
      updates.status === 'processing' ? 'received' : updates.status === 'completed' ? 'completed' : 'status_changed',
      staffName,
      oldDoc.status,
      updates.status
    );
  }
  
  // Track note changes
  if (updates.staffNote !== undefined && updates.staffNote !== oldDoc.staffNote) {
    addHistoryEntry(
      oldDoc,
      oldDoc.staffNote ? 'note_updated' : 'note_added',
      staffName,
      oldDoc.staffNote,
      updates.staffNote
    );
  }
  
  documents[index] = { ...oldDoc, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  return true;
};

export const getDocumentsByDepartment = (department: string): Document[] => {
  const documents = getAllDocuments();
  return documents.filter(doc => doc.department === department);
};

export const getDocumentsByStatus = (department: string, status: DocumentStatus): Document[] => {
  const documents = getDocumentsByDepartment(department);
  return documents.filter(doc => doc.status === status);
};

export const getCompletedToday = (department: string): number => {
  const today = new Date().toISOString().split('T')[0];
  const documents = getDocumentsByDepartment(department);
  return documents.filter(doc => 
    doc.status === 'completed' && 
    doc.completedDate?.startsWith(today)
  ).length;
};

export const getAverageProcessingTime = (department: string): number => {
  const documents = getDocumentsByDepartment(department).filter(doc => 
    doc.status === 'completed' && doc.submittedDate && doc.completedDate
  );
  
  if (documents.length === 0) return 0;
  
  const totalHours = documents.reduce((sum, doc) => {
    const submitted = new Date(doc.submittedDate);
    const completed = new Date(doc.completedDate!);
    const hours = (completed.getTime() - submitted.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return Math.round(totalHours / documents.length);
};

// Get start of week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  return new Date(d.setDate(diff));
};

// Get completed documents this week
export const getCompletedThisWeek = (department?: string): number => {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const documents = department ? getDocumentsByDepartment(department) : getAllDocuments();
  
  return documents.filter(doc => {
    if (doc.status !== 'completed' || !doc.completedDate) return false;
    const completedDate = new Date(doc.completedDate);
    return completedDate >= startOfWeek && completedDate <= today;
  }).length;
};

// Get completed documents this month
export const getCompletedThisMonth = (department?: string): number => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const documents = department ? getDocumentsByDepartment(department) : getAllDocuments();
  
  return documents.filter(doc => {
    if (doc.status !== 'completed' || !doc.completedDate) return false;
    const completedDate = new Date(doc.completedDate);
    return completedDate >= startOfMonth && completedDate <= today;
  }).length;
};

// Get completed documents this year
export const getCompletedThisYear = (department?: string): number => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  const documents = department ? getDocumentsByDepartment(department) : getAllDocuments();
  
  return documents.filter(doc => {
    if (doc.status !== 'completed' || !doc.completedDate) return false;
    const completedDate = new Date(doc.completedDate);
    return completedDate >= startOfYear && completedDate <= today;
  }).length;
};

// Get all time statistics
export const getAllTimeStats = () => {
  const allDocs = getAllDocuments();
  const completed = allDocs.filter(doc => doc.status === 'completed');
  const pending = allDocs.filter(doc => doc.status === 'pending');
  const processing = allDocs.filter(doc => doc.status === 'processing');
  
  return {
    total: allDocs.length,
    completed: completed.length,
    pending: pending.length,
    processing: processing.length,
  };
};
