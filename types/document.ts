export type DocumentStatus = 'pending' | 'processing' | 'completed';

export type Department = 'ทะเบียน' | 'การเงิน' | 'วิชาการ' | 'ธุรการ' | 'บุคคล' | 'พัสดุ' | 'อาคารสถานที่' | 'IT/เทคโนโลยี';

export type DocumentType = 'ใบลา' | 'หนังสือรับรอง' | 'ใบรับรองนักศึกษา' | 'เอกสารทั่วไป';

export type Priority = 'normal' | 'urgent' | 'very-urgent';

export interface HistoryEntry {
  timestamp: string;
  action: string; // 'created' | 'received' | 'completed' | 'note_added' | 'note_updated'
  staffName?: string;
  oldValue?: string;
  newValue?: string;
  note?: string;
}

export interface Document {
  id: string; // DOC-20260116-001
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

export interface DepartmentStats {
  department: Department;
  pending: number;
  completedToday: number;
  avgProcessingTime: number; // in hours
}
