// Base types for database introspection
export interface TableColumn {
  name: string;
  dataType: string;
  isNullable: boolean;
  defaultValue?: string | null;
  maxLength?: number | null;
  numericPrecision?: number | null;
  numericScale?: number | null;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isIndexed: boolean;
  ordinalPosition: number;
  
  // Data profiling (when enabled)
  distinctCount?: number;
  nullCount?: number;
  minValue?: any;
  maxValue?: any;
  avgValue?: number;
  mostCommonValues?: Array<{ value: any; frequency: number }>;
}

export interface TableIndex {
  name: string;
  type: 'PRIMARY' | 'UNIQUE' | 'BTREE' | 'HASH' | 'GIST' | 'GIN' | 'BRIN';
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
  definition: string;
  tablespace?: string;
  condition?: string; // For partial indexes
}

export interface TableConstraint {
  name: string;
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL' | 'EXCLUDE';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  definition: string;
  isDeferrable?: boolean;
  isDeferred?: boolean;
}

export interface TableTrigger {
  name: string;
  event: string; // INSERT, UPDATE, DELETE, etc.
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  definition: string;
  isEnabled: boolean;
}

export interface TableStatistics {
  rowCount: number;
  sizeBytes: number;
  indexSizeBytes?: number;
  lastAnalyzed?: Date;
  lastVacuumed?: Date;
  deadTuples?: number;
  liveTuples?: number;
}

export interface TableSchema {
  name: string;
  schemaName: string;
  type: 'table' | 'view' | 'materialized_view' | 'foreign_table';
  description?: string;
  
  columns: TableColumn[];
  indexes: TableIndex[];
  constraints: TableConstraint[];
  triggers?: TableTrigger[];
  
  statistics?: TableStatistics;
  sampleData?: Record<string, any>[];
  
  // Relationships
  referencedBy: Array<{ table: string; column: string; foreignColumn: string }>;
  references: Array<{ table: string; column: string; foreignColumn: string }>;
}

export interface DatabaseSchema {
  name: string;
  tables: TableSchema[];
  views: TableSchema[];
  materializedViews?: TableSchema[];
  
  // Database-level information
  version?: string;
  encoding?: string;
  collation?: string;
  owner?: string;
  size?: number;
  
  // Extensions (PostgreSQL specific)
  extensions?: Array<{ name: string; version: string; schema: string }>;
}

export interface IntrospectionResult {
  dataSourceType: string;
  connectionStatus: 'connected' | 'failed';
  schemas: any; // Compact format: { database_type: string, tables: Array<{schema: string, name: string, columns: string[]}>, table_count: number }
  error?: string;
  metadata: {
    totalSchemas: number;
    totalTables: number;
    totalColumns: number;
    introspectionTimeMs: number;
    timestamp: string;
  };
}

export interface IntrospectionOptions {
  schemaName?: string;
  tableName?: string;
  sampleSize: number;
  includeIndexes: boolean;
  includeConstraints: boolean;
  includeStatistics: boolean;
  includeDataProfiling: boolean;
}

// Abstract base class for database introspectors
export abstract class DatabaseIntrospector {
  abstract connect(config: any): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract introspectDatabase(options: IntrospectionOptions): Promise<any>;
  abstract testConnection(): Promise<boolean>;
}
