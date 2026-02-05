// Domain Entity - ข้อมูลหลักของเอกสาร

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type Department = 
  | 'PUR' | 'STO' | 'ER' | 'SURG' | 'CRO' | 'STR' | 'HSA' | 'ADMISSION' 
  | 'AMB' | 'CAS' | 'PHA' | 'MED' | 'MRD' | 'PED' | 'OBG' | 'LAB' 
  | 'MAI' | 'SKIN' | 'CCO' | 'HOU' | 'CHK' | 'EYE' | 'ENT' | 'CAR' 
  | 'XRD' | 'DNT' | 'HD' | 'ICU' | 'CATH' | 'LR' | 'OR' | 'CSSD' 
  | 'MEM' | 'NICU' | 'NSY' | 'HR' | 'MRA' | 'IPC' | 'ACC' | 'FIN' 
  | 'QC' | 'COM' | 'PHY' | 'GI' | 'W10' | 'W11' | 'W12' 
  | 'NIGHT OBG' | 'NIGHT MED' | 'NIGHT PED';
export type DocumentType = 'WI' | 'WP' | 'POLICY' | 'WAITING TIME' | 'FORM';

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
  weekRange: string; // e.g., "13 - 19 Jan 2025"
  details: string;
  status: DocumentStatus;
  submittedDate: string;
  receivedDate?: string;
  completedDate?: string;
  cancelledDate?: string;
  cancelReason?: string;
  staffNote?: string;
  history: HistoryEntry[];
}

// DTO สำหรับการสร้างเอกสารใหม่
export interface CreateDocumentDto {
  senderName: string;
  department: Department;
  documentType: DocumentType;
  weekRange: string;
  details: string;
}

// DTO สำหรับการอัปเดตสถานะ
export interface UpdateDocumentStatusDto {
  status: DocumentStatus;
  staffName?: string;
  note?: string;
}

// DTO สำหรับการอัปเดตเอกสาร
export type UpdateDocumentDto = Partial<Omit<Document, 'id' | 'history'>> & {
  cancelReason?: string;
};
