// Branded types for better type safety
// These types prevent mixing up regular strings with domain-specific IDs

declare const __brand: unique symbol;

type Brand<T, TBrand> = T & { readonly [__brand]: TBrand };

// Branded type for Document ID
export type DocumentId = Brand<string, 'DocumentId'>;

// Type guard to check if a string is a valid DocumentId
export function isDocumentId(value: string): value is DocumentId {
  // Check format: DOC-YYYYMMDD-XXXX
  return /^DOC-\d{8}-\d{4}$/.test(value);
}

// Convert a string to DocumentId (with validation)
export function toDocumentId(value: string): DocumentId {
  if (!isDocumentId(value)) {
    throw new Error(`Invalid DocumentId format: ${value}`);
  }
  return value;
}

// Safely create DocumentId from unknown value
export function asDocumentId(value: unknown): DocumentId | null {
  if (typeof value === 'string' && isDocumentId(value)) {
    return value;
  }
  return null;
}

// Branded type for Timestamps (ISO 8601 format)
export type Timestamp = Brand<string, 'Timestamp'>;

// Type guard for Timestamp
export function isTimestamp(value: string): value is Timestamp {
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
}

// Convert to Timestamp
export function toTimestamp(date: Date | string): Timestamp {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  return d.toISOString() as Timestamp;
}

// Get current timestamp
export function now(): Timestamp {
  return new Date().toISOString() as Timestamp;
}

// Branded type for non-empty strings
export type NonEmptyString = Brand<string, 'NonEmptyString'>;

// Type guard for NonEmptyString
export function isNonEmptyString(value: string): value is NonEmptyString {
  return value.trim().length > 0;
}

// Convert to NonEmptyString
export function toNonEmptyString(value: string): NonEmptyString {
  if (!isNonEmptyString(value)) {
    throw new Error('String cannot be empty');
  }
  return value as NonEmptyString;
}

// Helper type utilities
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P];
};

// Ensure an array is readonly and non-empty
export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0;
}
