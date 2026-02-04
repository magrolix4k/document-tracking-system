// Constants - Department definitions
import { Department } from '@/src/domain/entities/Document';

export const DEPARTMENTS: Department[] = [
  'GI',
  'CHK',
  'PHY',
  'ENT',
  'EYE',
  'DENT',
  'SKIN',
  'OBG',
  'NIGHT OBG',
  'NIGHT MED',
  'MED',
  'PED',
  'NIGHT PED',
];

// Department labels with Thai names
export const DEPARTMENT_LABELS: Record<Department, string> = {
  'GI': 'แผนกทางเดินอาหาร (GI)',
  'CHK': 'แผนกตรวจสุภาพ (CHK)',
  'PHY': 'แผนกกายภาพ (PHY)',
  'ENT': 'แผนกหู, คอ, จมูก (ENT)',
  'EYE': 'แผนกตา (EYE)',
  'DENT': 'แผนกทันตกรรม (DENT)',
  'SKIN': 'แผนกผิวหนัก (SKIN)',
  'OBG': 'แผนกสูตินารี (OBG)',
  'NIGHT OBG': 'คลีนิคกลางคืนสูตินารี (NIGHT OBG)',
  'NIGHT MED': 'คลีนิคกลางคืนอายุระกรรม (NIGHT MED)',
  'MED': 'แผนกอายุระกรรม (MED)',
  'PED': 'แผนกกุมารเวช (PED)',
  'NIGHT PED': 'คลีนิคกลางคืนกุมารเวช (NIGHT PED)',
};
