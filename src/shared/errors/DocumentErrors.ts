// Custom Error Classes for better error handling

export class DocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentError';
    Object.setPrototypeOf(this, DocumentError.prototype);
  }
}

export class DocumentNotFoundError extends DocumentError {
  constructor(documentId: string) {
    super(`Document with ID "${documentId}" not found`);
    this.name = 'DocumentNotFoundError';
    Object.setPrototypeOf(this, DocumentNotFoundError.prototype);
  }
}

export class ValidationError extends DocumentError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class StorageError extends DocumentError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

export class DuplicateDocumentError extends DocumentError {
  constructor(documentId: string) {
    super(`Document with ID "${documentId}" already exists`);
    this.name = 'DuplicateDocumentError';
    Object.setPrototypeOf(this, DuplicateDocumentError.prototype);
  }
}
