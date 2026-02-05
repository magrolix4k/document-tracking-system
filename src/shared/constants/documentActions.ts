// Document action constants to avoid magic strings

export const DOCUMENT_ACTIONS = {
  CREATED: 'created',
  RECEIVED: 'received',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  UPDATED: 'updated',
  STATUS_CHANGED: 'status_changed',
} as const;

export type DocumentAction = typeof DOCUMENT_ACTIONS[keyof typeof DOCUMENT_ACTIONS];
