import { Client } from 'pg';
import {
  DatabaseIntrospector,
  DatabaseSchema,
  TableSchema,
  TableColumn,
  IntrospectionOptions
} from './types';

const createDatabaseConnection = (config: any) => {
    const { host, port = 5432, database, database_name, username, password, timeout = 30000 } = config;
    
    // Handle backward compatibility: use database_name if database is not provided
    const dbName = database || database_name;
    
    console.log('PostgreSQL introspector connecting to database:', dbName);
    
  return new Client({
      host,
      port,
      database: dbName,
      user: username,
      password,
      connectionTimeoutMillis: timeout,
      statement_timeout: timeout,
      query_timeout: timeout,
    });
};

const executeQuery = async (client: Client, query: string, params?: any[]) => {
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export class PostgreSQLIntrospector extends DatabaseIntrospector {
  private client: Client | null = null;

  async connect(config: any): Promise<void> {
    this.client = createDatabaseConnection(config);
    console.log('🔌 Connecting to PostgreSQL for introspection...');
    await this.client.connect();
    console.log('✅ Connected to PostgreSQL for introspection');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      await this.client.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async introspectDatabase(options: IntrospectionOptions): Promise<any> {
    if (!this.client) {
      throw new Error('Not connected to database');
    }

    try {
      // Get compact table and column info
      const query = `
        SELECT 
          t.table_schema,
          t.table_name,
          array_agg(
            c.column_name || ':' || c.data_type ||
            CASE WHEN pk.column_name IS NOT NULL THEN ':PK' ELSE '' END ||
            CASE WHEN uk.column_name IS NOT NULL THEN ':UQ' ELSE '' END
            ORDER BY c.ordinal_position
          ) as columns
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
        LEFT JOIN (
          SELECT ku.table_schema, ku.table_name, ku.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON c.table_schema = pk.table_schema AND c.table_name = pk.table_name AND c.column_name = pk.column_name
        LEFT JOIN (
          SELECT ku.table_schema, ku.table_name, ku.column_name
      FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
          WHERE tc.constraint_type = 'UNIQUE'
        ) uk ON c.table_schema = uk.table_schema AND c.table_name = uk.table_name AND c.column_name = uk.column_name
        WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          AND t.table_schema NOT LIKE 'pg_%'
          AND t.table_type = 'BASE TABLE'
        GROUP BY t.table_schema, t.table_name
        ORDER BY t.table_schema, t.table_name
        LIMIT 30
      `;

      const result = await executeQuery(this.client, query);
      
      // Return ultra-compact format
      return {
        database_type: 'PostgreSQL',
        tables: result.map((row: any) => ({
          schema: row.table_schema,
          name: row.table_name,
          columns: row.columns
        })),
        table_count: result.length
      };

    } catch (error) {
      throw new Error(`Failed to introspect database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
