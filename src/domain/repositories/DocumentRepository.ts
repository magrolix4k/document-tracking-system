// Repository Interface - การกำหนดสัญญาสำหรับการเข้าถึงข้อมูล
import { Document, CreateDocumentDto, UpdateDocumentStatusDto } from '../entities/Document';

export interface IDocumentRepository {
  // Query operations
  findById(id: string): Document | null;
  findAll(): Document[];
  findByDepartment(department: string): Document[];
  search(filters: {
    senderName?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Document[];

  // Command operations
  create(dto: CreateDocumentDto): Document;
  update(id: string, document: Document): void;
  updateStatus(id: string, dto: UpdateDocumentStatusDto): void;
  addHistory(id: string, entry: Record<string, string | undefined>): void;
  delete(id: string): void;

  // Batch operations
  getStatistics(): {
    total: number;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
  };
}
