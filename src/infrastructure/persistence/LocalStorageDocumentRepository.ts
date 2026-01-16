// Implementation of Repository using LocalStorage with error handling and caching
import { IDocumentRepository } from '@/src/domain/repositories/DocumentRepository';
import { Document, CreateDocumentDto, UpdateDocumentStatusDto } from '@/src/domain/entities/Document';
import { generateDocumentId, generateTimestamp } from '../../shared/utils/helpers';
import { DocumentNotFoundError, StorageError } from '../../shared/errors/DocumentErrors';
import { validateCreateDocumentDto, validateUpdateDocumentStatusDto, validateDocumentId } from '../../shared/validation/documentValidation';

const STORAGE_KEY = 'documents';
const CACHE_DURATION = 5000; // 5 seconds cache

export class LocalStorageDocumentRepository implements IDocumentRepository {
  private cache: { data: Document[]; timestamp: number } | null = null;

  private getDocuments(): Document[] {
    try {
      if (typeof window === 'undefined') return [];

      // Check cache first
      if (this.cache && Date.now() - this.cache.timestamp < CACHE_DURATION) {
        return [...this.cache.data]; // Return a copy
      }

      const data = localStorage.getItem(STORAGE_KEY);
      const documents = data ? JSON.parse(data) : [];

      // Update cache
      this.cache = { data: documents, timestamp: Date.now() };

      return documents;
    } catch (error) {
      throw new StorageError(
        'Failed to read documents from storage',
        error instanceof Error ? error : undefined
      );
    }
  }

  private saveDocuments(documents: Document[]): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

      // Update cache
      this.cache = { data: [...documents], timestamp: Date.now() };
    } catch (error) {
      throw new StorageError(
        'Failed to save documents to storage',
        error instanceof Error ? error : undefined
      );
    }
  }

  private invalidateCache(): void {
    this.cache = null;
  }

  findById(id: string): Document | null {
    try {
      validateDocumentId(id);
      const docs = this.getDocuments();
      return docs.find(doc => doc.id === id) || null;
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to find document', error instanceof Error ? error : undefined);
    }
  }

  findAll(): Document[] {
    try {
      return this.getDocuments();
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to get all documents', error instanceof Error ? error : undefined);
    }
  }

  findByDepartment(department: string): Document[] {
    try {
      return this.getDocuments().filter(doc => doc.department === department);
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to find documents by department', error instanceof Error ? error : undefined);
    }
  }

  search(filters: {
    senderName?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Document[] {
    try {
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
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to search documents', error instanceof Error ? error : undefined);
    }
  }

  create(dto: CreateDocumentDto): Document {
    try {
      // Validate input
      validateCreateDocumentDto(dto);

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
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to create document', error instanceof Error ? error : undefined);
    }
  }

  update(id: string, document: Document): void {
    try {
      validateDocumentId(id);

      const docs = this.getDocuments();
      const index = docs.findIndex(doc => doc.id === id);
      
      if (index === -1) {
        throw new DocumentNotFoundError(id);
      }

      docs[index] = document;
      this.saveDocuments(docs);
    } catch (error) {
      if (error instanceof DocumentNotFoundError || error instanceof StorageError) throw error;
      throw new StorageError('Failed to update document', error instanceof Error ? error : undefined);
    }
  }

  updateStatus(id: string, dto: UpdateDocumentStatusDto): void {
    try {
      validateDocumentId(id);
      validateUpdateDocumentStatusDto(dto);

      const doc = this.findById(id);
      if (!doc) {
        throw new DocumentNotFoundError(id);
      }

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
    } catch (error) {
      if (error instanceof DocumentNotFoundError || error instanceof StorageError) throw error;
      throw new StorageError('Failed to update document status', error instanceof Error ? error : undefined);
    }
  }

  addHistory(id: string, entry: Record<string, string | undefined>): void {
    try {
      validateDocumentId(id);

      const doc = this.findById(id);
      if (!doc) {
        throw new DocumentNotFoundError(id);
      }

      doc.history.push({
        timestamp: generateTimestamp(),
        action: entry.action || '',
        staffName: entry.staffName,
        note: entry.note,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
      });
      this.update(id, doc);
    } catch (error) {
      if (error instanceof DocumentNotFoundError || error instanceof StorageError) throw error;
      throw new StorageError('Failed to add history', error instanceof Error ? error : undefined);
    }
  }

  delete(id: string): void {
    try {
      validateDocumentId(id);

      let docs = this.getDocuments();
      const initialLength = docs.length;
      docs = docs.filter(doc => doc.id !== id);
      
      if (docs.length === initialLength) {
        throw new DocumentNotFoundError(id);
      }

      this.saveDocuments(docs);
    } catch (error) {
      if (error instanceof DocumentNotFoundError || error instanceof StorageError) throw error;
      throw new StorageError('Failed to delete document', error instanceof Error ? error : undefined);
    }
  }

  getStatistics() {
    try {
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
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError('Failed to get statistics', error instanceof Error ? error : undefined);
    }
  }
}
