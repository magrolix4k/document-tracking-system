// Data Versioning and Migration System
import { Document } from '@/src/domain/entities/Document';
import { logger } from '../services/Logger';

const STORAGE_VERSION_KEY = 'documents_version';
const CURRENT_VERSION = 1;

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  migratedCount: number;
  errors: string[];
}

// Version 0 -> Version 1 migration (example for future use)
function migrateV0toV1(data: unknown[]): Document[] {
  logger.info('Migrating data from v0 to v1', 'DataMigration');
  
  // Example migration logic
  return data.map((item: unknown) => {
    const record = item as Record<string, unknown>;
    // Add any missing fields or transform data structure
    return {
      ...record,
      // Ensure all required fields exist
      history: record.history || [],
    } as Document;
  });
}

// Registry of all migrations
const migrations: Record<number, (data: unknown[]) => Document[]> = {
  1: migrateV0toV1,
};

export function getCurrentVersion(): number {
  if (typeof window === 'undefined') return CURRENT_VERSION;
  
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    return version ? parseInt(version, 10) : 0;
  } catch (error) {
    logger.error('Failed to get storage version', error as Error, 'DataMigration');
    return 0;
  }
}

export function setVersion(version: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, version.toString());
    logger.info(`Storage version set to ${version}`, 'DataMigration');
  } catch (error) {
    logger.error('Failed to set storage version', error as Error, 'DataMigration');
  }
}

export function needsMigration(): boolean {
  const currentVersion = getCurrentVersion();
  return currentVersion < CURRENT_VERSION;
}

export async function migrateData(storageKey: string): Promise<MigrationResult> {
  const fromVersion = getCurrentVersion();
  const errors: string[] = [];
  let migratedCount = 0;

  logger.info(`Starting migration from v${fromVersion} to v${CURRENT_VERSION}`, 'DataMigration');

  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot migrate in server environment');
    }

    // Get current data
    const rawData = localStorage.getItem(storageKey);
    if (!rawData) {
      // No data to migrate
      setVersion(CURRENT_VERSION);
      return {
        success: true,
        fromVersion,
        toVersion: CURRENT_VERSION,
        migratedCount: 0,
        errors: [],
      };
    }

    let data: unknown[];
    try {
      data = JSON.parse(rawData);
    } catch {
      throw new Error('Failed to parse existing data');
    }

    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }

    // Apply migrations sequentially
    let migratedData = data;
    for (let version = fromVersion + 1; version <= CURRENT_VERSION; version++) {
      const migration = migrations[version];
      if (migration) {
        try {
          logger.info(`Applying migration to v${version}`, 'DataMigration');
          migratedData = migration(migratedData);
          migratedCount = migratedData.length;
        } catch (migrationError) {
          const errorMsg = `Migration to v${version} failed: ${migrationError}`;
          errors.push(errorMsg);
          logger.error(errorMsg, migrationError as Error, 'DataMigration');
          
          // Stop migration on error
          return {
            success: false,
            fromVersion,
            toVersion: version - 1,
            migratedCount,
            errors,
          };
        }
      }
    }

    // Save migrated data
    localStorage.setItem(storageKey, JSON.stringify(migratedData));
    setVersion(CURRENT_VERSION);

    logger.info(
      `Migration completed successfully: ${migratedCount} records migrated`,
      'DataMigration',
      { fromVersion, toVersion: CURRENT_VERSION }
    );

    return {
      success: true,
      fromVersion,
      toVersion: CURRENT_VERSION,
      migratedCount,
      errors,
    };
  } catch (error) {
    const errorMsg = `Migration failed: ${error}`;
    errors.push(errorMsg);
    logger.error(errorMsg, error as Error, 'DataMigration');

    return {
      success: false,
      fromVersion,
      toVersion: fromVersion,
      migratedCount,
      errors,
    };
  }
}

export function createBackup(storageKey: string): boolean {
  try {
    if (typeof window === 'undefined') return false;

    const data = localStorage.getItem(storageKey);
    if (!data) return false;

    const backupKey = `${storageKey}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, data);

    logger.info(`Backup created: ${backupKey}`, 'DataMigration');
    return true;
  } catch (error) {
    logger.error('Failed to create backup', error as Error, 'DataMigration');
    return false;
  }
}

export function restoreBackup(backupKey: string, storageKey: string): boolean {
  try {
    if (typeof window === 'undefined') return false;

    const backupData = localStorage.getItem(backupKey);
    if (!backupData) {
      throw new Error('Backup not found');
    }

    localStorage.setItem(storageKey, backupData);
    logger.info(`Backup restored: ${backupKey}`, 'DataMigration');
    return true;
  } catch (error) {
    logger.error('Failed to restore backup', error as Error, 'DataMigration');
    return false;
  }
}

export function listBackups(): string[] {
  try {
    if (typeof window === 'undefined') return [];

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_backup_')) {
        keys.push(key);
      }
    }
    return keys.sort().reverse(); // Most recent first
  } catch (error) {
    logger.error('Failed to list backups', error as Error, 'DataMigration');
    return [];
  }
}
