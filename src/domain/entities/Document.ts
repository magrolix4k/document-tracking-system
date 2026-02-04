// Domain Entity - ข้อมูลหลักของเอกสาร

export type DocumentStatus = 'pending' | 'processing' | 'completed';
export type Department = 'GI' | 'CHK' | 'PHY' | 'ENT' | 'EYE' | 'DENT' | 'SKIN' | 'OBG' | 'NIGHT OBG' | 'NIGHT MED' | 'MED' | 'PED' | 'NIGHT PED';

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
  weekRange: string; // e.g., "13 - 19 Jan 2025"
  details: string;
  status: DocumentStatus;
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
  weekRange: string;
  details: string;
}

// DTO สำหรับการอัปเดตสถานะ
export interface UpdateDocumentStatusDto {
  status: DocumentStatus;
  staffName?: string;
  note?: string;
}
