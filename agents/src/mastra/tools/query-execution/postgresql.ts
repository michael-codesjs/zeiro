import { Client } from 'pg';
import { QueryExecutor, QueryExecutionResult } from './types';
import { DataSource } from '../../types';

export class PostgreSQLQueryExecutor extends QueryExecutor {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    super();
    this.dataSource = dataSource;
  }

  async executeQuery(query: string, options?: { limit?: number; timeout?: number }): Promise<QueryExecutionResult> {
    const startTime = Date.now();
    let client: Client | null = null;

    try {
      // Validate the query first
      const validation = this.validateQuery(query);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Invalid query',
          query,
          executionTime: Date.now() - startTime,
        };
      }

      // Create database connection
      const config = this.dataSource.connection_config as any;
      const credentials = this.dataSource.credential?.secrets;
      
      // Handle backward compatibility for database field
      const databaseName = config.database || config.database_name || credentials?.database || credentials?.database_name;
      
      console.log('Connecting to PostgreSQL database:', databaseName);
      
      client = new Client({
        host: config.host,
        port: config.port,
        database: databaseName,
        user: credentials?.username,
        password: credentials?.password,
        statement_timeout: (options?.timeout || 10) * 1000, // Convert to milliseconds
      });

      await client.connect();

      // Apply limit if specified and query doesn't already have one
      let finalQuery = query.trim();
      const hasLimit = /\bLIMIT\s+\d+/i.test(finalQuery);
      const limit = options?.limit || 100;
      
      // Only add LIMIT to SELECT queries that don't already have one and aren't aggregation queries
      const isAggregationQuery = /\b(COUNT|SUM|AVG|MIN|MAX|GROUP\s+BY)\b/i.test(finalQuery);
      const needsLimit = !hasLimit && validation.queryType === 'SELECT' && !isAggregationQuery;
      
      if (needsLimit) {
        finalQuery += ` LIMIT ${limit}`;
      }

      console.log('🐘 Executing PostgreSQL query:', finalQuery);

      // Execute the query
      const result = await client.query(finalQuery);
      const executionTime = Date.now() - startTime;

      // Extract column metadata
      const columns = result.fields?.map(field => ({
        name: field.name,
        type: this.mapPostgreSQLType(field.dataTypeID),
      })) || [];

      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount || result.rows?.length || 0,
        executionTime,
        query: finalQuery,
        metadata: {
          columns,
          affectedRows: result.rowCount || 0,
        },
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ PostgreSQL query execution failed:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        query,
        executionTime,
      };
    } finally {
      if (client) {
        try {
          await client.end();
        } catch (disconnectError) {
          console.warn('Warning: Failed to disconnect from PostgreSQL:', disconnectError);
        }
      }
    }
  }

  validateQuery(query: string): { isValid: boolean; error?: string; queryType?: string } {
    const trimmedQuery = query.trim().toUpperCase();

    // Check if query is empty
    if (!trimmedQuery) {
      return { isValid: false, error: 'Query cannot be empty' };
    }

    // Only allow SELECT queries for safety
    if (!trimmedQuery.startsWith('SELECT')) {
      return { 
        isValid: false, 
        error: 'Only SELECT queries are allowed for security reasons. No INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, or other modification operations permitted.' 
      };
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /\bDROP\b/i,
      /\bDELETE\b/i,
      /\bUPDATE\b/i,
      /\bINSERT\b/i,
      /\bCREATE\b/i,
      /\bALTER\b/i,
      /\bTRUNCATE\b/i,
      /\bGRANT\b/i,
      /\bREVOKE\b/i,
      /\bEXEC\b/i,
      /\bEXECUTE\b/i,
      /--/,  // SQL comments
      /\/\*/,  // Multi-line comments
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        return { 
          isValid: false, 
          error: `Query contains potentially dangerous operations. Only SELECT queries are allowed.` 
        };
      }
    }

    return { 
      isValid: true, 
      queryType: 'SELECT' 
    };
  }

  getSupportedOperations(): string[] {
    return [
      'SELECT queries with JOINs',
      'Aggregation functions (COUNT, SUM, AVG, MIN, MAX)',
      'Window functions',
      'Common Table Expressions (CTEs)',
      'Subqueries',
      'PostgreSQL-specific functions',
      'JSON/JSONB operations',
      'Array operations',
      'Date/time functions',
      'String functions',
      'Mathematical functions',
    ];
  }

  private mapPostgreSQLType(dataTypeID: number): string {
    // Common PostgreSQL data type mappings
    const typeMap: { [key: number]: string } = {
      16: 'boolean',
      17: 'bytea',
      18: 'char',
      19: 'name',
      20: 'bigint',
      21: 'smallint',
      23: 'integer',
      25: 'text',
      26: 'oid',
      114: 'json',
      142: 'xml',
      700: 'real',
      701: 'double precision',
      1043: 'varchar',
      1082: 'date',
      1083: 'time',
      1114: 'timestamp',
      1184: 'timestamptz',
      1700: 'numeric',
      3802: 'jsonb',
    };

    return typeMap[dataTypeID] || `unknown(${dataTypeID})`;
  }
}
