// Domain Entity - ข้อมูลหลักของเอกสาร

export type DocumentStatus = 'pending' | 'processing' | 'completed';
export type Department = 'NIGHT MED' | 'MED NIGHT PED' | 'OBG' | 'ENT' | 'EYE' | 'SKIN' | 'CHK' | 'ER';
export type DocumentType = 'ใบลา' | 'หนังสือรับรอง' | 'ใบรับรองนักศึกษา' | 'เอกสารทั่วไป';
export type Priority = 'normal' | 'urgent' | 'very-urgent';

export interface HistoryEntry {
  timestamp: string;
  action: string;
  staffName?: string;
  oldValue?: string;
  newValue?: string;
  note?: string;
}

export interface Document {
  id: string;
  senderName: string;
  department: Department;
  documentType: DocumentType;
  details: string;
  status: DocumentStatus;
  priority: Priority;
  submittedDate: string;
  receivedDate?: string;
  completedDate?: string;
  staffNote?: string;
  history: HistoryEntry[];
}

// DTO สำหรับการสร้างเอกสารใหม่
export interface CreateDocumentDto {
  senderName: string;
  department: Department;
  documentType: DocumentType;
  details: string;
  priority: Priority;
}

// DTO สำหรับการอัปเดตสถานะ
export interface UpdateDocumentStatusDto {
  status: DocumentStatus;
  staffName?: string;
  note?: string;
}
