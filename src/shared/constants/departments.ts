// Constants - Department definitions
import { Department } from '@/src/domain/entities/Document';

export const DEPARTMENTS: Department[] = [
  'NIGHT MED',
  'MED',
  'PED',
  'NIGHT PED',
  'OBG',
  'ENT',
  'EYE',
  'SKIN',
  'CHK',
  'ER',
  'SUR',
];

export const DOCUMENT_TYPES = [
  'ใบลา',
  'หนังสือรับรอง',
  'ใบรับรองนักศึกษา',
  'เอกสารทั่วไป',
];

export const PRIORITIES = [
  { value: 'normal', label: '✅ ปกติ' },
  { value: 'urgent', label: '⚡ ด่วน' },
  { value: 'very-urgent', label: '🚨 ด่วนมาก' },
];
