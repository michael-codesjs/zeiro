import { Agent } from "@mastra/core"
import { DynamoDBStore } from "@mastra/dynamodb"
import { Memory } from "@mastra/memory"
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { Client } from 'pg'
import { DataSourceAgent, DataSourceAgentConfig } from './abstracts/base-agent'
import { generateThreadTitle } from './title-agent'

export interface PostgreSQLAgentConfig extends Omit<DataSourceAgentConfig, 'data_source' | 'credentials'> {
  data_source: {
    id: string
    name: string
    database_name: string
    host: string
    port?: number
  }
  credentials: {
    username: string
    password: string
  }
}

export class PostgreSQLAgent extends DataSourceAgent {
  
  private memory: Memory
  private data_source_id: string = null
  private client: Client | null = null
  private pgConfig: PostgreSQLAgentConfig

  constructor(config: PostgreSQLAgentConfig) {
    super(config as any)

    this.config = config as any
    this.pgConfig = config
    this.data_source_id = config.data_source.id

    // Validate that user_id is provided for user identification
    if (!config.user_id) {
      throw new Error('user_id is required for user identification');
    }

    // Initialize DynamoDB storage for Mastra
    const storage = new DynamoDBStore({
      name: "postgres-storage",
      config: {
        tableName: process.env.MASTRA_STORAGE_TABLE_NAME,
        region: 'eu-central-1',
        credentials: fromNodeProviderChain()[0]
      },
    });

    // Initialize Memory with DynamoDB storage and enhanced thread options
    this.memory = new Memory({
      storage,
      options: {
        lastMessages: 20,
        threads: {
          generateTitle: true
        },
        workingMemory: {
          enabled: true,
          scope: 'thread',
        },
      },
    });

    this.setupAgent()
  }

  private async getClient(): Promise<Client> {
    if (!this.client) {
      this.client = new Client({
        host: this.pgConfig.data_source.host,
        port: this.pgConfig.data_source.port || 5432,
        user: this.pgConfig.credentials.username,
        password: this.pgConfig.credentials.password,
        database: this.pgConfig.data_source.database_name
      })
      await this.client.connect()
    }
    return this.client
  }

  private createGetSchemaTool() {
    return createTool({
      id: 'get-schema',
      description: 'Get the database schema information by introspecting PostgreSQL tables, columns, indexes, and constraints',
      inputSchema: z.object({
        schema_name: z.string().optional().default('public').describe('Schema name to inspect (default: public)'),
        table_name: z.string().optional().describe('Optional specific table name to get schema for')
      }),
      outputSchema: z.object({
        database_name: z.string(),
        schema_name: z.string(),
        tables: z.array(z.object({
          table_name: z.string(),
          columns: z.array(z.object({
            name: z.string(),
            type: z.string(),
            nullable: z.boolean(),
            default: z.any().optional(),
            is_primary_key: z.boolean(),
            is_foreign_key: z.boolean()
          })),
          indexes: z.array(z.object({
            index_name: z.string(),
            columns: z.array(z.string()),
            is_unique: z.boolean(),
            is_primary: z.boolean(),
            index_type: z.string()
          })).optional(),
          foreign_keys: z.array(z.object({
            constraint_name: z.string(),
            column_name: z.string(),
            foreign_table_name: z.string(),
            foreign_column_name: z.string()
          })).optional(),
          row_count: z.number().optional(),
          size_mb: z.number().optional()
        }))
      }),
      execute: async (context) => {
        const { schema_name = 'public', table_name } = context.input
        const client = await this.getClient()

        try {
          // Get list of tables
          const tableQuery = table_name
            ? `SELECT 
                t.table_name,
                pg_stat_user_tables.n_live_tup as row_count,
                pg_size_pretty(pg_total_relation_size(quote_ident(t.table_schema)||'.'||quote_ident(t.table_name))) as size
               FROM information_schema.tables t
               LEFT JOIN pg_stat_user_tables ON pg_stat_user_tables.schemaname = t.table_schema 
                 AND pg_stat_user_tables.relname = t.table_name
               WHERE t.table_schema = $1 AND t.table_type = 'BASE TABLE' AND t.table_name = $2`
            : `SELECT 
                t.table_name,
                pg_stat_user_tables.n_live_tup as row_count,
                pg_size_pretty(pg_total_relation_size(quote_ident(t.table_schema)||'.'||quote_ident(t.table_name))) as size
               FROM information_schema.tables t
               LEFT JOIN pg_stat_user_tables ON pg_stat_user_tables.schemaname = t.table_schema 
                 AND pg_stat_user_tables.relname = t.table_name
               WHERE t.table_schema = $1 AND t.table_type = 'BASE TABLE'`
          
          const tableParams = table_name ? [schema_name, table_name] : [schema_name]
          const tablesResult = await client.query(tableQuery, tableParams)

          const tableSchemas = await Promise.all(tablesResult.rows.map(async (table) => {
            // Get columns with primary key and foreign key information
            const columnsResult = await client.query(
              `SELECT 
                c.column_name as name,
                c.data_type as type,
                c.is_nullable = 'YES' as nullable,
                c.column_default as default,
                CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key,
                CASE WHEN fk.column_name IS NOT NULL THEN true ELSE false END as is_foreign_key
               FROM information_schema.columns c
               LEFT JOIN (
                 SELECT ku.column_name
                 FROM information_schema.table_constraints tc
                 JOIN information_schema.key_column_usage ku
                   ON tc.constraint_name = ku.constraint_name
                   AND tc.table_schema = ku.table_schema
                 WHERE tc.constraint_type = 'PRIMARY KEY'
                   AND tc.table_schema = $1
                   AND tc.table_name = $2
               ) pk ON pk.column_name = c.column_name
               LEFT JOIN (
                 SELECT ku.column_name
                 FROM information_schema.table_constraints tc
                 JOIN information_schema.key_column_usage ku
                   ON tc.constraint_name = ku.constraint_name
                   AND tc.table_schema = ku.table_schema
                 WHERE tc.constraint_type = 'FOREIGN KEY'
                   AND tc.table_schema = $1
                   AND tc.table_name = $2
               ) fk ON fk.column_name = c.column_name
               WHERE c.table_schema = $1 AND c.table_name = $2
               ORDER BY c.ordinal_position`,
              [schema_name, table.table_name]
            )

            // Get indexes
            const indexesResult = await client.query(
              `SELECT 
                i.indexname as index_name,
                i.indexdef,
                idx.indisunique as is_unique,
                idx.indisprimary as is_primary,
                am.amname as index_type,
                array_agg(a.attname ORDER BY array_position(idx.indkey, a.attnum)) as columns
               FROM pg_indexes i
               JOIN pg_class c ON c.relname = i.tablename
               JOIN pg_index idx ON idx.indexrelid = (i.schemaname||'.'||i.indexname)::regclass
               JOIN pg_am am ON am.oid = c.relam
               JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(idx.indkey)
               WHERE i.schemaname = $1 AND i.tablename = $2
               GROUP BY i.indexname, i.indexdef, idx.indisunique, idx.indisprimary, am.amname`,
              [schema_name, table.table_name]
            )

            // Get foreign keys
            const foreignKeysResult = await client.query(
              `SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
               FROM information_schema.table_constraints AS tc
               JOIN information_schema.key_column_usage AS kcu
                 ON tc.constraint_name = kcu.constraint_name
                 AND tc.table_schema = kcu.table_schema
               JOIN information_schema.constraint_column_usage AS ccu
                 ON ccu.constraint_name = tc.constraint_name
                 AND ccu.table_schema = tc.table_schema
               WHERE tc.constraint_type = 'FOREIGN KEY'
                 AND tc.table_schema = $1
                 AND tc.table_name = $2`,
              [schema_name, table.table_name]
            )

            // Parse size to MB
            let size_mb = 0
            if (table.size) {
              const sizeStr = table.size.toString()
              if (sizeStr.includes('MB')) {
                size_mb = parseFloat(sizeStr.replace(' MB', ''))
              } else if (sizeStr.includes('GB')) {
                size_mb = parseFloat(sizeStr.replace(' GB', '')) * 1024
              } else if (sizeStr.includes('kB')) {
                size_mb = parseFloat(sizeStr.replace(' kB', '')) / 1024
              }
            }

            return {
              table_name: table.table_name,
              columns: columnsResult.rows.map(col => ({
                name: col.name,
                type: col.type,
                nullable: col.nullable,
                default: col.default,
                is_primary_key: col.is_primary_key,
                is_foreign_key: col.is_foreign_key
              })),
              indexes: indexesResult.rows.length > 0 ? indexesResult.rows.map(idx => ({
                index_name: idx.index_name,
                columns: idx.columns,
                is_unique: idx.is_unique,
                is_primary: idx.is_primary,
                index_type: idx.index_type
              })) : undefined,
              foreign_keys: foreignKeysResult.rows.length > 0 ? foreignKeysResult.rows.map(fk => ({
                constraint_name: fk.constraint_name,
                column_name: fk.column_name,
                foreign_table_name: fk.foreign_table_name,
                foreign_column_name: fk.foreign_column_name
              })) : undefined,
              row_count: parseInt(table.row_count) || 0,
              size_mb: size_mb
            }
          }))

          return {
            database_name: this.pgConfig.data_source.database_name,
            schema_name: schema_name,
            tables: tableSchemas
          }

        } catch (error) {
          console.error('Failed to introspect PostgreSQL database:', error)
          throw error
        }
      }
    })
  }

  private setupAgent() {
    const getSchemaTool = this.createGetSchemaTool()

    this.agent = new Agent({
      name: 'PostgreSQL Agent',
      instructions: `You are a PostgreSQL expert agent that assists users with database operations on ${this.pgConfig.data_source.database_name} and questions about PostgreSQL in general.

CRITICAL INSTRUCTIONS:
- You MUST respond ONLY in JSON format at ALL TIMES
- NEVER respond with plain text, markdown, code blocks, or any other format
- DO NOT wrap your response in markdown code blocks (\`\`\`json or \`\`\`)
- Return ONLY the raw JSON object starting with { and ending with }
- Your response must ALWAYS follow this exact structure:
{
  "message": "Your helpful response message here",
  "suggestChartType": "Table" | "Pie" | "LineGraph" | null,
  "query_parameters": { /* JSON object with query parameters */ } | null
}

QUERY OPTIMIZATION PRINCIPLES:
1. ACCURACY IS PARAMOUNT: Always generate queries that return the correct results
2. Use proper JOIN syntax for multi-table queries
3. Leverage PostgreSQL-specific features like CTEs, window functions, and array operations when beneficial
4. Use indexes effectively by filtering on indexed columns
5. Apply WHERE clauses to reduce result sets early
6. Use LIMIT to prevent excessive data retrieval
7. Consider using aggregate functions (COUNT, SUM, AVG) for summaries
8. Use EXPLAIN ANALYZE for query performance analysis when needed

RESPONSE GUIDELINES:
- "message": Provide helpful, informative responses about PostgreSQL operations, best practices, or answers to user questions. Do NOT mention parameters or explain that you're providing them - the UI handles this automatically
- "suggestChartType": Suggest "Table" for tabular data, "Pie" for categorical distributions, "LineGraph" for time series data, or null if no visualization is appropriate
- "query_parameters": Include relevant PostgreSQL query parameters when suggesting a query, or null if not applicable. The UI will automatically present these to the user

QUERY PARAMETER FORMAT:
{
  "operation": "select" | "insert" | "update" | "delete",
  "query": "The SQL query string",
  "parameters": [] // Array of parameter values for prepared statements (optional)
}

TOOLS AVAILABLE:
- get-schema: Use this tool to retrieve database schema information including tables, columns, indexes, foreign keys, and statistics

TOOL USAGE GUIDELINES:
- ONLY call get-schema when you need specific schema information that you don't already know
- DO NOT call get-schema for every query - use it strategically when schema details are required
- If you already have schema information from a previous call in the conversation, reuse that knowledge
- Call get-schema when: user asks about table structure, you need column names/types, you need to understand relationships, or you need index information

EXAMPLES OF PROPER RESPONSES:

For a SELECT query:
{
  "message": "I'll retrieve all active users from the database.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT * FROM users WHERE status = 'active' LIMIT 50"
  }
}

For a query with CTE:
{
  "message": "Here's a query using a CTE to get the top customers by order value.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "select",
    "query": "WITH customer_totals AS (SELECT customer_id, SUM(order_total) as total_spent FROM orders GROUP BY customer_id) SELECT c.name, ct.total_spent FROM customer_totals ct JOIN customers c ON ct.customer_id = c.id ORDER BY ct.total_spent DESC LIMIT 10"
  }
}

For window functions:
{
  "message": "I'll calculate running totals using window functions.",
  "suggestChartType": "LineGraph",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT date, amount, SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total FROM transactions ORDER BY date"
  }
}

For aggregate data:
{
  "message": "I'll calculate the sales summary by category.",
  "suggestChartType": "Pie",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT category, COUNT(*) as count, SUM(amount) as total_sales FROM sales GROUP BY category ORDER BY total_sales DESC"
  }
}

Remember: ALWAYS use the get-schema tool when you need information about the database structure, prioritize accuracy over efficiency, and ALWAYS respond in the exact JSON format specified above.`,
      model: this.config.model,
      tools: {
        'get-schema': getSchemaTool
      },
      memory: this.memory
    })
  }

  public async generate(query: string, options?: { threadId?: string }): Promise<{
    text: string
    threadId?: string
  }> {
    let threadId = options?.threadId
    
    // If no thread ID provided, create a new thread
    if (!threadId) {
      const title = await generateThreadTitle(query)
      const thread = await this.memory.createThread({
        resourceId: this.data_source_id,
        title,
        metadata: {
          data_source_id: this.data_source_id,
          database_name: this.pgConfig.data_source.database_name,
          created_at: new Date().toISOString(),
          auto_created: true
        }
      })
      threadId = thread.id
      try { console.log('PostgreSQLAgent: created new threadId:', threadId) } catch {}
    }
    
    const generateOptions = {
      threadId: threadId,
      resourceId: this.data_source_id
    }
    
    const result = await this.agent.generate(query, generateOptions)
    try { console.log('PostgreSQLAgent: agent.generate returned, threadId:', threadId) } catch {}
    return { ...result, threadId }
  }

  public getAgent(): Agent {
    return this.agent
  }

  public async disconnect() {
    if (this.client) {
      await this.client.end()
      this.client = null
    }
  }
}
