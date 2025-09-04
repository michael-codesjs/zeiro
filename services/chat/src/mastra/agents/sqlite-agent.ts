import { Agent } from "@mastra/core"
import { DynamoDBStore } from "@mastra/dynamodb"
import { Memory } from "@mastra/memory"
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import { DataSourceAgent, DataSourceAgentConfig } from './abstracts/base-agent'
import { generateThreadTitle } from './title-agent'

export interface SQLiteAgentConfig extends Omit<DataSourceAgentConfig, 'data_source' | 'credentials'> {
  data_source: {
    id: string
    name: string
    database_path: string // Path to SQLite database file
  }
  credentials?: {
    // SQLite doesn't require credentials, but we keep this for consistency
  }
}

export class SQLiteAgent extends DataSourceAgent {
  
  private memory: Memory
  private data_source_id: string = null
  private db: Database | null = null
  private sqliteConfig: SQLiteAgentConfig

  constructor(config: SQLiteAgentConfig) {
    super(config as any)

    this.config = config as any
    this.sqliteConfig = config
    this.data_source_id = config.data_source.id

    // Validate that user_id is provided for user identification
    if (!config.user_id) {
      throw new Error('user_id is required for user identification');
    }

    // Initialize DynamoDB storage for Mastra
    const storage = new DynamoDBStore({
      name: "sqlite-storage",
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

  private async getDatabase(): Promise<Database> {
    if (!this.db) {
      this.db = await open({
        filename: this.sqliteConfig.data_source.database_path,
        driver: sqlite3.Database
      })
    }
    return this.db
  }

  private createGetSchemaTool() {
    return createTool({
      id: 'get-schema',
      description: 'Get the database schema information by introspecting SQLite tables, columns, indexes, and foreign keys',
      inputSchema: z.object({
        table_name: z.string().optional().describe('Optional specific table name to get schema for')
      }),
      outputSchema: z.object({
        database_path: z.string(),
        tables: z.array(z.object({
          table_name: z.string(),
          columns: z.array(z.object({
            cid: z.number(),
            name: z.string(),
            type: z.string(),
            notnull: z.boolean(),
            default_value: z.any().optional(),
            is_primary_key: z.boolean()
          })),
          indexes: z.array(z.object({
            index_name: z.string(),
            is_unique: z.boolean(),
            columns: z.array(z.string()),
            partial: z.boolean()
          })).optional(),
          foreign_keys: z.array(z.object({
            id: z.number(),
            seq: z.number(),
            table: z.string(),
            from: z.string(),
            to: z.string(),
            on_update: z.string(),
            on_delete: z.string()
          })).optional(),
          row_count: z.number().optional()
        })),
        total_size_mb: z.number().optional()
      }),
      execute: async (context) => {
        const { table_name } = context.input
        const db = await this.getDatabase()

        try {
          // Get list of tables
          const tableQuery = table_name
            ? `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name = ?`
            : `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
          
          const tables = table_name
            ? await db.all(tableQuery, [table_name])
            : await db.all(tableQuery)

          const tableSchemas = await Promise.all(tables.map(async (table) => {
            // Get table info (columns)
            const columns = await db.all(`PRAGMA table_info(${table.name})`)
            
            // Get indexes
            const indexList = await db.all(`PRAGMA index_list(${table.name})`)
            const indexes = await Promise.all(indexList.map(async (idx) => {
              const indexInfo = await db.all(`PRAGMA index_info(${idx.name})`)
              return {
                index_name: idx.name,
                is_unique: idx.unique === 1,
                columns: indexInfo.map((col: any) => col.name),
                partial: idx.partial === 1
              }
            }))

            // Get foreign keys
            const foreignKeys = await db.all(`PRAGMA foreign_key_list(${table.name})`)

            // Get row count
            const countResult = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`)
            const row_count = countResult?.count || 0

            return {
              table_name: table.name,
              columns: columns.map((col: any) => ({
                cid: col.cid,
                name: col.name,
                type: col.type,
                notnull: col.notnull === 1,
                default_value: col.dflt_value,
                is_primary_key: col.pk === 1
              })),
              indexes: indexes.length > 0 ? indexes : undefined,
              foreign_keys: foreignKeys.length > 0 ? foreignKeys.map((fk: any) => ({
                id: fk.id,
                seq: fk.seq,
                table: fk.table,
                from: fk.from,
                to: fk.to,
                on_update: fk.on_update,
                on_delete: fk.on_delete
              })) : undefined,
              row_count
            }
          }))

          // Get database file size
          let total_size_mb = 0
          try {
            const pageCountResult = await db.get('PRAGMA page_count')
            const pageSizeResult = await db.get('PRAGMA page_size')
            if (pageCountResult && pageSizeResult) {
              const totalBytes = pageCountResult.page_count * pageSizeResult.page_size
              total_size_mb = totalBytes / (1024 * 1024)
            }
          } catch (e) {
            // Size calculation is optional
          }

          return {
            database_path: this.sqliteConfig.data_source.database_path,
            tables: tableSchemas,
            total_size_mb: total_size_mb > 0 ? total_size_mb : undefined
          }

        } catch (error) {
          console.error('Failed to introspect SQLite database:', error)
          throw error
        }
      }
    })
  }

  private setupAgent() {
    const getSchemaTool = this.createGetSchemaTool()

    this.agent = new Agent({
      name: 'SQLite Agent',
      instructions: `You are a SQLite expert agent that assists users with database operations on ${this.sqliteConfig.data_source.name} and questions about SQLite in general.

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
3. SQLite has limited ALTER TABLE support - be aware of these limitations
4. Use indexes effectively by filtering on indexed columns
5. Apply WHERE clauses to reduce result sets early
6. Use LIMIT to prevent excessive data retrieval
7. Consider using aggregate functions (COUNT, SUM, AVG) for summaries
8. Be aware that SQLite uses dynamic typing

SQLITE-SPECIFIC CONSIDERATIONS:
- SQLite uses dynamic typing - columns can store values of any type
- No native BOOLEAN type - use INTEGER 0/1 instead
- Limited ALTER TABLE capabilities
- No RIGHT JOIN or FULL OUTER JOIN support
- Case-insensitive LIKE by default
- AUTOINCREMENT behavior differs from other databases

RESPONSE GUIDELINES:
- "message": Provide helpful, informative responses about SQLite operations, best practices, or answers to user questions. Do NOT mention parameters or explain that you're providing them - the UI handles this automatically
- "suggestChartType": Suggest "Table" for tabular data, "Pie" for categorical distributions, "LineGraph" for time series data, or null if no visualization is appropriate
- "query_parameters": Include relevant SQLite query parameters when suggesting a query, or null if not applicable. The UI will automatically present these to the user

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
  "message": "I'll retrieve all active records from the database.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT * FROM users WHERE active = 1 LIMIT 50"
  }
}

For a JOIN query:
{
  "message": "Here's a query to get orders with customer information.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT o.order_id, o.order_date, c.customer_name, c.email FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id WHERE o.order_date >= date('now', '-30 days') LIMIT 100"
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

For date operations:
{
  "message": "I'll get records from the last week using SQLite's date functions.",
  "suggestChartType": "LineGraph",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT date(created_at) as day, COUNT(*) as daily_count FROM events WHERE created_at >= datetime('now', '-7 days') GROUP BY date(created_at) ORDER BY day"
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
          database_path: this.sqliteConfig.data_source.database_path,
          created_at: new Date().toISOString(),
          auto_created: true
        }
      })
      threadId = thread.id
      try { console.log('SQLiteAgent: created new threadId:', threadId) } catch {}
    }
    
    const generateOptions = {
      threadId: threadId,
      resourceId: this.data_source_id
    }
    
    const result = await this.agent.generate(query, generateOptions)
    try { console.log('SQLiteAgent: agent.generate returned, threadId:', threadId) } catch {}
    return { ...result, threadId }
  }

  public getAgent(): Agent {
    return this.agent
  }

  public async disconnect() {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }
}
