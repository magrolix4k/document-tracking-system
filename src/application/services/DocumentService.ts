// Application Service - Business logic layer
import { IDocumentRepository } from '@/src/domain/repositories/DocumentRepository';
import { Document, CreateDocumentDto, UpdateDocumentStatusDto } from '@/src/domain/entities/Document';

export class DocumentService {
  constructor(private documentRepository: IDocumentRepository) {}

  // Queries
  getDocumentById(id: string): Document | null {
    return this.documentRepository.findById(id);
  }

  getAllDocuments(): Document[] {
    return this.documentRepository.findAll();
  }

  getDepartmentDocuments(department: string): Document[] {
    return this.documentRepository.findByDepartment(department);
  }

  searchDocuments(filters: {
    senderName?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Document[] {
    return this.documentRepository.search(filters);
  }

  // Commands
  submitDocument(dto: CreateDocumentDto): Document {
    return this.documentRepository.create(dto);
  }

  updateDocumentStatus(id: string, dto: UpdateDocumentStatusDto): void {
    const doc = this.documentRepository.findById(id);
    if (!doc) throw new Error('Document not found');
    this.documentRepository.updateStatus(id, dto);
  }

  addNote(id: string, note: string): void {
    const doc = this.documentRepository.findById(id);
    if (!doc) throw new Error('Document not found');
    
    doc.staffNote = note;
    this.documentRepository.addHistory(id, {
      action: 'note_added',
      note,
    });
  }

  addHistory(id: string, entry: Record<string, string | undefined>): void {
    this.documentRepository.addHistory(id, entry);
  }

  // Statistics & Reports
  getStatistics() {
    return this.documentRepository.getStatistics();
  }

  getProcessingTime(): {
    [key: string]: number;
  } {
    const docs = this.getAllDocuments();
    const completedDocs = docs.filter(d => d.completedDate);
    const timeByDept: { [key: string]: number[] } = {};

    completedDocs.forEach(doc => {
      const start = new Date(doc.submittedDate).getTime();
      const end = new Date(doc.completedDate!).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      
      if (!timeByDept[doc.department]) timeByDept[doc.department] = [];
      timeByDept[doc.department].push(hours);
    });

    const avgTime: { [key: string]: number } = {};
    Object.keys(timeByDept).forEach(dept => {
      const times = timeByDept[dept];
      avgTime[dept] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    return avgTime;
  }

  getDepartmentPerformance() {
    const docs = this.getAllDocuments();
    const deptStats: { [key: string]: { pending: number; completed: number; avgTime: number; totalTime: number; count: number } } = {};

    docs.forEach(doc => {
      if (!deptStats[doc.department]) {
        deptStats[doc.department] = {
          pending: 0,
          completed: 0,
          avgTime: 0,
          totalTime: 0,
          count: 0,
        };
      }

      const stats = deptStats[doc.department];
      if (doc.status === 'pending') stats.pending++;
      if (doc.status === 'completed') {
        stats.completed++;
        const start = new Date(doc.submittedDate).getTime();
        const end = new Date(doc.completedDate!).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        stats.totalTime += hours;
        stats.count++;
      }
    });

    Object.keys(deptStats).forEach(dept => {
      if (deptStats[dept].count > 0) {
        deptStats[dept].avgTime = deptStats[dept].totalTime / deptStats[dept].count;
      }
    });

    return deptStats;
  }
}
