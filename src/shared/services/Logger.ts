// Logging Service for monitoring and debugging
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private enabled = true;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private log(level: LogLevel, message: string, context?: string, data?: unknown, error?: Error): void {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with appropriate styling
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data, error);
        break;
    }

    // In production, you could send logs to external service (e.g., Sentry)
    if (level === 'error' && typeof window !== 'undefined') {
      // TODO: Send to external monitoring service
      // Example: Sentry.captureException(error, { extra: { message, context, data } });
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  error(message: string, error?: Error, context?: string, data?: unknown): void {
    this.log('error', message, context, data, error);
  }

  // Document-specific logging methods
  documentCreated(documentId: string, senderName: string): void {
    this.info(`Document created: ${documentId}`, 'DocumentService', { documentId, senderName });
  }

  documentUpdated(documentId: string, updates: Record<string, unknown>): void {
    this.info(`Document updated: ${documentId}`, 'DocumentService', { documentId, updates });
  }

  documentDeleted(documentId: string): void {
    this.info(`Document deleted: ${documentId}`, 'DocumentService', { documentId });
  }

  documentNotFound(documentId: string): void {
    this.warn(`Document not found: ${documentId}`, 'DocumentService', { documentId });
  }

  validationError(field: string, value: unknown, message: string): void {
    this.warn(`Validation error: ${field}`, 'Validation', { field, value, message });
  }

  storageError(operation: string, error: Error): void {
    this.error(`Storage error during ${operation}`, error, 'Storage');
  }

  // Get recent logs (for debugging/admin panel)
  getRecentLogs(count = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by context
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', 'Logger');
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance export
export const logger = Logger.getInstance();

// Convenience wrapper functions
export const log = {
  debug: (message: string, context?: string, data?: unknown) => logger.debug(message, context, data),
  info: (message: string, context?: string, data?: unknown) => logger.info(message, context, data),
  warn: (message: string, context?: string, data?: unknown) => logger.warn(message, context, data),
  error: (message: string, error?: Error, context?: string, data?: unknown) => logger.error(message, error, context, data),
};
