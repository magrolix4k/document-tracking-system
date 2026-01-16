// Implementation of Repository using LocalStorage
import { IDocumentRepository } from '@/src/domain/repositories/DocumentRepository';
import { Document, CreateDocumentDto, UpdateDocumentStatusDto } from '@/src/domain/entities/Document';
import { generateDocumentId, generateTimestamp } from '../../shared/utils/helpers';

const STORAGE_KEY = 'documents';

export class LocalStorageDocumentRepository implements IDocumentRepository {
  private getDocuments(): Document[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveDocuments(documents: Document[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }

  findById(id: string): Document | null {
    const docs = this.getDocuments();
    return docs.find(doc => doc.id === id) || null;
  }

  findAll(): Document[] {
    return this.getDocuments();
  }

  findByDepartment(department: string): Document[] {
    return this.getDocuments().filter(doc => doc.department === department);
  }

  search(filters: {
    senderName?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Document[] {
    const docs = this.getDocuments();
    return docs.filter(doc => {
      const nameMatch = !filters.senderName || 
        doc.senderName.toLowerCase().includes(filters.senderName.toLowerCase());
      const deptMatch = !filters.department || filters.department === 'all' || 
        doc.department === filters.department;
      const dateFromMatch = !filters.dateFrom || 
        new Date(doc.submittedDate) >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo || 
        new Date(doc.submittedDate) <= new Date(filters.dateTo);
      
      return nameMatch && deptMatch && dateFromMatch && dateToMatch;
    });
  }

  create(dto: CreateDocumentDto): Document {
    const docs = this.getDocuments();
    const newDocument: Document = {
      id: generateDocumentId(),
      ...dto,
      status: 'pending',
      submittedDate: generateTimestamp(),
      history: [{
        timestamp: generateTimestamp(),
        action: 'created',
      }],
    };
    
    docs.push(newDocument);
    this.saveDocuments(docs);
    return newDocument;
  }

  update(id: string, document: Document): void {
    const docs = this.getDocuments();
    const index = docs.findIndex(doc => doc.id === id);
    if (index !== -1) {
      docs[index] = document;
      this.saveDocuments(docs);
    }
  }

  updateStatus(id: string, dto: UpdateDocumentStatusDto): void {
    const doc = this.findById(id);
    if (!doc) return;

    doc.status = dto.status;
    
    if (dto.status === 'processing' && !doc.receivedDate) {
      doc.receivedDate = generateTimestamp();
    }
    if (dto.status === 'completed' && !doc.completedDate) {
      doc.completedDate = generateTimestamp();
    }
    if (dto.note) {
      doc.staffNote = dto.note;
    }

    doc.history.push({
      timestamp: generateTimestamp(),
      action: dto.status === 'processing' ? 'received' : 
              dto.status === 'completed' ? 'completed' : 'updated',
      staffName: dto.staffName,
      newValue: dto.status,
    });

    this.update(id, doc);
  }

  addHistory(id: string, entry: Record<string, string | undefined>): void {
    const doc = this.findById(id);
    if (doc) {
      doc.history.push({
        timestamp: generateTimestamp(),
        action: entry.action || '',
        staffName: entry.staffName,
        note: entry.note,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
      });
      this.update(id, doc);
    }
  }

  delete(id: string): void {
    let docs = this.getDocuments();
    docs = docs.filter(doc => doc.id !== id);
    this.saveDocuments(docs);
  }

  getStatistics() {
    const docs = this.getDocuments();
    const byStatus: Record<string, number> = { pending: 0, processing: 0, completed: 0 };
    const byDepartment: Record<string, number> = {};

    docs.forEach(doc => {
      byStatus[doc.status]++;
      byDepartment[doc.department] = (byDepartment[doc.department] || 0) + 1;
    });

    return {
      total: docs.length,
      byStatus,
      byDepartment,
    };
  }
}
