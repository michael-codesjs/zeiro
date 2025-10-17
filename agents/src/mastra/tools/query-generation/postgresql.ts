import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { QueryGenerator, QueryResult, DatabaseSchema } from './types';

// Simple schema for PostgreSQL query generation
const postgresQuerySchema = z.object({
  query: z.object({
    type: z.string(),
    content: z.string(),
  }),
  explanation: z.string(),
  confidence: z.number(),
  assumptions: z.array(z.string()),
  tables_used: z.array(z.string()),
});

export class PostgreSQLQueryGenerator extends QueryGenerator {
  getQueryType(): string {
    return 'sql';
  }

  getSupportedFeatures(): string[] {
    return [
      'SELECT queries',
      'JOINs (INNER, LEFT, RIGHT, FULL)',
      'Aggregation functions (COUNT, SUM, AVG, etc.)',
      'Window functions',
      'CTEs (Common Table Expressions)',
      'PostgreSQL-specific functions (DATE_TRUNC, EXTRACT, etc.)',
      'ILIKE for case-insensitive searches',
      'JSON/JSONB operations',
      'Array operations',
      'Type casting (::type)',
    ];
  }

  async generateQuery(naturalLanguageQuery: string, databaseSchema: DatabaseSchema): Promise<QueryResult> {
    try {
      console.log('🐘 Generating PostgreSQL query for:', naturalLanguageQuery);

      const schemaDescription = this.createSchemaDescription(databaseSchema);
      const systemPrompt = this.getSystemPrompt(schemaDescription);

      const userPrompt = `Generate a PostgreSQL query for this question: "${naturalLanguageQuery}"

Please provide:
1. A query object with type "sql" and the PostgreSQL query content
2. A clear explanation of what the query does
3. Your confidence level (0-1)
4. Any assumptions you made
5. List of tables used

Return the query content as a properly formatted PostgreSQL query string.`;

      const result = await generateObject({
        model: openai('gpt-4o'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        schema: postgresQuerySchema,
      });

      return result.object as QueryResult;
    } catch (error) {
      throw new Error(`Failed to generate PostgreSQL query: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getSystemPrompt(schemaDescription: string): string {
    return `You are an expert PostgreSQL query generator. Your task is to convert natural language questions into accurate SQL queries.

DATABASE SCHEMA:
${schemaDescription}

OUTPUT FORMAT:
- Return a query object with 'type' set to 'sql' and 'content' containing the PostgreSQL query
- The query should be properly formatted with indentation and line breaks

POSTGRESQL SPECIFIC RULES:
1. Only generate SELECT queries for data retrieval
2. Use proper PostgreSQL syntax
3. Use ILIKE for case-insensitive text searches
4. Use PostgreSQL-specific functions when appropriate (e.g., DATE_TRUNC, EXTRACT)
5. Use proper PostgreSQL data types and casting (::type)
6. Consider PostgreSQL-specific features like arrays, JSON, etc.
7. Always qualify column names with table names when joining tables
8. Use appropriate JOINs when data from multiple tables is needed
9. Format queries with proper indentation and line breaks
10. Include appropriate WHERE clauses to filter results
11. Use LIMIT when appropriate to prevent overly large result sets
12. Consider performance implications of the query

QUERY ANALYSIS:
- Analyze the user's question carefully
- Identify which tables and columns are needed
- Determine if joins are required
- Consider aggregation functions if needed
- Think about appropriate filtering conditions
- Consider ordering and limiting results

EXAMPLES OF GOOD POSTGRESQL QUERIES:
- SELECT u.name, u.email FROM users u WHERE u.created_at >= '2024-01-01'
- SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id WHERE u.status = 'active'
- SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) FROM users GROUP BY month ORDER BY month

Provide a high-confidence PostgreSQL query that accurately answers the user's question.`;
  }

  private createSchemaDescription(databaseSchema: DatabaseSchema): string {
    let description = '';

    // Group columns by table
    const tableColumns = new Map<string, any[]>();
    (databaseSchema.columns || []).forEach((column: any) => {
      const tableKey = `${column.table_schema}.${column.table_name}`;
      if (!tableColumns.has(tableKey)) {
        tableColumns.set(tableKey, []);
      }
      tableColumns.get(tableKey)?.push(column);
    });

    // Create table descriptions
    (databaseSchema.tables || []).forEach((table: any) => {
      const tableKey = `${table.schema_name}.${table.table_name}`;
      const columns = tableColumns.get(tableKey) || [];
      const rowCount = databaseSchema.rowCounts?.find(
        (rc: any) => rc.schema_name === table.schema_name && rc.table_name === table.table_name,
      );

      description += `\nTable: ${table.schema_name}.${table.table_name}`;
      if (rowCount) {
        description += ` (${rowCount.row_count} rows)`;
      }
      description += '\nColumns:\n';

      columns.forEach((column: any) => {
        description += `  - ${column.column_name}: ${column.data_type}`;
        if (column.character_maximum_length) {
          description += `(${column.character_maximum_length})`;
        }
        if (column.is_primary_key) {
          description += ' [PRIMARY KEY]';
        }
        if (column.is_nullable === 'NO') {
          description += ' [NOT NULL]';
        }
        if (column.column_default) {
          description += ` [DEFAULT: ${column.column_default}]`;
        }
        description += '\n';
      });
    });

    // Add relationship information
    if (databaseSchema.relationships && databaseSchema.relationships.length > 0) {
      description += '\nRelationships:\n';
      databaseSchema.relationships.forEach((rel: any) => {
        description += `  - ${rel.table_schema}.${rel.table_name}.${rel.column_name} → ${rel.foreign_table_schema}.${rel.foreign_table_name}.${rel.foreign_column_name}\n`;
      });
    }

    // Add index information
    if (databaseSchema.indexes && databaseSchema.indexes.length > 0) {
      description += '\nIndexes:\n';
      databaseSchema.indexes.forEach((index: any) => {
        description += `  - ${index.schema_name}.${index.table_name}: ${index.index_name}\n`;
      });
    }

    return description;
  }
}
