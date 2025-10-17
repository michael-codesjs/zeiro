// Base types for query generation
export interface QueryResult {
  query: {
    type: 'sql' | 'mongodb' | 'dynamodb' | 'redis' | 'elasticsearch';
    content: string;
  };
  explanation: string;
  confidence: number;
  assumptions: string[];
  tables_used: string[];
}

export interface DatabaseSchema {
  tables?: Array<{
    schema_name?: string;
    table_name?: string;
    table_owner?: string;
  }>;
  columns?: Array<{
    table_schema?: string;
    table_name?: string;
    column_name?: string;
    data_type?: string;
    character_maximum_length?: number | null;
    numeric_precision?: number | null;
    numeric_scale?: number | null;
    is_nullable?: string;
    column_default?: string | null;
    is_primary_key?: boolean;
  }>;
  relationships?: Array<{
    table_schema?: string;
    table_name?: string;
    column_name?: string;
    foreign_table_schema?: string;
    foreign_table_name?: string;
    foreign_column_name?: string;
    constraint_name?: string;
  }>;
  indexes?: Array<{
    schema_name?: string;
    table_name?: string;
    index_name?: string;
    index_definition?: string;
  }>;
  rowCounts?: Array<{
    schema_name?: string;
    table_name?: string;
    row_count?: number;
    error?: string;
  }>;
}

// Abstract base class for query generators
export abstract class QueryGenerator {
  abstract generateQuery(naturalLanguageQuery: string, databaseSchema: DatabaseSchema): Promise<QueryResult>;
  abstract getQueryType(): string;
  abstract getSupportedFeatures(): string[];
}
