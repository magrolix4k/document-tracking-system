// Validation utilities for domain entities
import { CreateDocumentDto, UpdateDocumentStatusDto, Department, DocumentStatus } from '@/src/domain/entities/Document';
import { ValidationError } from '../errors/DocumentErrors';

// Valid constants
const VALID_DEPARTMENTS: readonly Department[] = ['NIGHT MED', 'MED', 'PED', 'NIGHT PED', 'OBG', 'ENT', 'EYE', 'SKIN', 'CHK', 'ER', 'SUR'] as const;
const VALID_STATUSES: readonly DocumentStatus[] = ['pending', 'processing', 'completed'] as const;

// Validation helpers
export function isValidDepartment(value: unknown): value is Department {
  return typeof value === 'string' && (VALID_DEPARTMENTS as readonly string[]).includes(value);
}

export function isValidStatus(value: unknown): value is DocumentStatus {
  return typeof value === 'string' && (VALID_STATUSES as readonly string[]).includes(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

// Main validation functions
export function validateCreateDocumentDto(dto: unknown): asserts dto is CreateDocumentDto {
  if (!dto || typeof dto !== 'object') {
    throw new ValidationError('Invalid document data: must be an object');
  }

  const data = dto as Record<string, unknown>;

  // Validate senderName
  if (!isNonEmptyString(data.senderName)) {
    throw new ValidationError('ชื่อผู้ส่งไม่ถูกต้อง กรุณาระบุชื่อ', 'senderName', data.senderName);
  }

  if (data.senderName.length > 200) {
    throw new ValidationError('ชื่อผู้ส่งยาวเกินไป (สูงสุด 200 ตัวอักษร)', 'senderName', data.senderName);
  }

  // Validate department
  if (!isValidDepartment(data.department)) {
    throw new ValidationError(
      `แผนกไม่ถูกต้อง กรุณาเลือกจาก: ${VALID_DEPARTMENTS.join(', ')}`,
      'department',
      data.department
    );
  }

  // Validate weekRange
  if (!isNonEmptyString(data.weekRange)) {
    throw new ValidationError('ช่วงวันสัปดาห์ไม่ถูกต้อง', 'weekRange', data.weekRange);
  }

  // Validate details
  if (!isNonEmptyString(data.details)) {
    throw new ValidationError('รายละเอียดไม่ถูกต้อง กรุณาระบุรายละเอียด', 'details', data.details);
  }

  if (data.details.length > 1000) {
    throw new ValidationError('รายละเอียดยาวเกินไป (สูงสุด 1000 ตัวอักษร)', 'details', data.details);
  }
}

export function validateUpdateDocumentStatusDto(dto: unknown): asserts dto is UpdateDocumentStatusDto {
  if (!dto || typeof dto !== 'object') {
    throw new ValidationError('Invalid status update data: must be an object');
  }

  const data = dto as Record<string, unknown>;

  // Validate status
  if (!isValidStatus(data.status)) {
    throw new ValidationError(
      `สถานะไม่ถูกต้อง กรุณาเลือกจาก: ${VALID_STATUSES.join(', ')}`,
      'status',
      data.status
    );
  }

  // Validate optional staffName
  if (data.staffName !== undefined && !isNonEmptyString(data.staffName)) {
    throw new ValidationError('ชื่อเจ้าหน้าที่ไม่ถูกต้อง', 'staffName', data.staffName);
  }

  if (typeof data.staffName === 'string' && data.staffName.length > 200) {
    throw new ValidationError('ชื่อเจ้าหน้าที่ยาวเกินไป (สูงสุด 200 ตัวอักษร)', 'staffName', data.staffName);
  }

  // Validate optional note
  if (data.note !== undefined && data.note !== null) {
    if (typeof data.note !== 'string') {
      throw new ValidationError('หมายเหตุต้องเป็นข้อความ', 'note', data.note);
    }
    if (data.note.length > 500) {
      throw new ValidationError('หมายเหตุยาวเกินไป (สูงสุด 500 ตัวอักษร)', 'note', data.note);
    }
  }
}

export function validateDocumentId(id: unknown): asserts id is string {
  if (!isNonEmptyString(id)) {
    throw new ValidationError('Document ID ไม่ถูกต้อง', 'id', id);
  }

  // Check format: DOC-YYYYMMDD-XXXX
  const idPattern = /^DOC-\d{8}-\d{4}$/;
  if (!idPattern.test(id)) {
    throw new ValidationError('รูปแบบ Document ID ไม่ถูกต้อง (ต้องเป็น DOC-YYYYMMDD-XXXX)', 'id', id);
  }
}

// Export constants for use in other modules
export const VALIDATION_CONSTANTS = {
  DEPARTMENTS: VALID_DEPARTMENTS,
  STATUSES: VALID_STATUSES,
  MAX_SENDER_NAME_LENGTH: 200,
  MAX_DETAILS_LENGTH: 1000,
  MAX_STAFF_NAME_LENGTH: 200,
  MAX_NOTE_LENGTH: 500,
} as const;
