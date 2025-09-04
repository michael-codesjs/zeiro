import { Agent } from "@mastra/core"
import { DynamoDBStore } from "@mastra/dynamodb"
import { Memory } from "@mastra/memory"
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import mysql from 'mysql2/promise'
import { DataSourceAgent, DataSourceAgentConfig } from './abstracts/base-agent'
import { generateThreadTitle } from './title-agent'

export interface MySQLAgentConfig extends Omit<DataSourceAgentConfig, 'data_source' | 'credentials'> {
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

export class MySQLAgent extends DataSourceAgent {
  
  private memory: Memory
  private data_source_id: string = null
  private connection: mysql.Connection | null = null
  private mysqlConfig: MySQLAgentConfig

  constructor(config: MySQLAgentConfig) {
    super(config as any)

    this.config = config as any
    this.mysqlConfig = config
    this.data_source_id = config.data_source.id

    // Validate that user_id is provided for user identification
    if (!config.user_id) {
      throw new Error('user_id is required for user identification');
    }

    // Initialize DynamoDB storage for Mastra
    const storage = new DynamoDBStore({
      name: "mysql-storage",
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

  private async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection({
        host: this.mysqlConfig.data_source.host,
        port: this.mysqlConfig.data_source.port || 3306,
        user: this.mysqlConfig.credentials.username,
        password: this.mysqlConfig.credentials.password,
        database: this.mysqlConfig.data_source.database_name
      })
    }
    return this.connection
  }

  private createGetSchemaTool() {
    return createTool({
      id: 'get-schema',
      description: 'Get the database schema information by introspecting MySQL tables, columns, indexes, and constraints',
      inputSchema: z.object({
        table_name: z.string().optional().describe('Optional specific table name to get schema for')
      }),
      outputSchema: z.object({
        database_name: z.string(),
        tables: z.array(z.object({
          table_name: z.string(),
          columns: z.array(z.object({
            name: z.string(),
            type: z.string(),
            nullable: z.boolean(),
            key: z.string().optional(),
            default: z.any().optional(),
            extra: z.string().optional()
          })),
          indexes: z.array(z.object({
            index_name: z.string(),
            column_name: z.string(),
            non_unique: z.boolean(),
            index_type: z.string()
          })).optional(),
          foreign_keys: z.array(z.object({
            constraint_name: z.string(),
            column_name: z.string(),
            referenced_table: z.string(),
            referenced_column: z.string()
          })).optional(),
          row_count: z.number().optional(),
          size_mb: z.number().optional()
        }))
      }),
      execute: async (context) => {
        const { table_name } = context.input
        const connection = await this.getConnection()

        try {
          // Get list of tables
          const tableQuery = table_name 
            ? `SELECT TABLE_NAME, TABLE_ROWS, ROUND(DATA_LENGTH / 1024 / 1024, 2) AS SIZE_MB 
               FROM information_schema.TABLES 
               WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`
            : `SELECT TABLE_NAME, TABLE_ROWS, ROUND(DATA_LENGTH / 1024 / 1024, 2) AS SIZE_MB 
               FROM information_schema.TABLES 
               WHERE TABLE_SCHEMA = ?`
          
          const tableParams = table_name 
            ? [this.mysqlConfig.data_source.database_name, table_name]
            : [this.mysqlConfig.data_source.database_name]
          
          const [tables] = await connection.execute(tableQuery, tableParams) as any

          const tableSchemas = await Promise.all(tables.map(async (table: any) => {
            // Get columns
            const [columns] = await connection.execute(
              `SELECT COLUMN_NAME as name, COLUMN_TYPE as type, IS_NULLABLE as nullable, 
                      COLUMN_KEY as \`key\`, COLUMN_DEFAULT as \`default\`, EXTRA as extra
               FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
               ORDER BY ORDINAL_POSITION`,
              [this.mysqlConfig.data_source.database_name, table.TABLE_NAME]
            ) as any

            // Get indexes
            const [indexes] = await connection.execute(
              `SELECT INDEX_NAME as index_name, COLUMN_NAME as column_name, 
                      NON_UNIQUE as non_unique, INDEX_TYPE as index_type
               FROM information_schema.STATISTICS 
               WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
              [this.mysqlConfig.data_source.database_name, table.TABLE_NAME]
            ) as any

            // Get foreign keys
            const [foreignKeys] = await connection.execute(
              `SELECT CONSTRAINT_NAME as constraint_name, COLUMN_NAME as column_name,
                      REFERENCED_TABLE_NAME as referenced_table, 
                      REFERENCED_COLUMN_NAME as referenced_column
               FROM information_schema.KEY_COLUMN_USAGE 
               WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? 
                 AND REFERENCED_TABLE_NAME IS NOT NULL`,
              [this.mysqlConfig.data_source.database_name, table.TABLE_NAME]
            ) as any

            return {
              table_name: table.TABLE_NAME,
              columns: columns.map((col: any) => ({
                name: col.name,
                type: col.type,
                nullable: col.nullable === 'YES',
                key: col.key || undefined,
                default: col.default,
                extra: col.extra || undefined
              })),
              indexes: indexes.length > 0 ? indexes.map((idx: any) => ({
                index_name: idx.index_name,
                column_name: idx.column_name,
                non_unique: idx.non_unique === 1,
                index_type: idx.index_type
              })) : undefined,
              foreign_keys: foreignKeys.length > 0 ? foreignKeys.map((fk: any) => ({
                constraint_name: fk.constraint_name,
                column_name: fk.column_name,
                referenced_table: fk.referenced_table,
                referenced_column: fk.referenced_column
              })) : undefined,
              row_count: table.TABLE_ROWS || 0,
              size_mb: parseFloat(table.SIZE_MB) || 0
            }
          }))

          return {
            database_name: this.mysqlConfig.data_source.database_name,
            tables: tableSchemas
          }

        } catch (error) {
          console.error('Failed to introspect MySQL database:', error)
          throw error
        }
      }
    })
  }

  private setupAgent() {
    const getSchemaTool = this.createGetSchemaTool()

    this.agent = new Agent({
      name: 'MySQL Agent',
      instructions: `You are a MySQL expert agent that assists users with database operations on ${this.mysqlConfig.data_source.database_name} and questions about MySQL in general.

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
3. Use indexes effectively by filtering on indexed columns
4. Apply WHERE clauses to reduce result sets early
5. Use LIMIT to prevent excessive data retrieval
6. Consider using aggregate functions (COUNT, SUM, AVG) for summaries
7. Use EXPLAIN to understand query performance when needed

RESPONSE GUIDELINES:
- "message": Provide helpful, informative responses about MySQL operations, best practices, or answers to user questions. Do NOT mention parameters or explain that you're providing them - the UI handles this automatically
- "suggestChartType": Suggest "Table" for tabular data, "Pie" for categorical distributions, "LineGraph" for time series data, or null if no visualization is appropriate
- "query_parameters": Include relevant MySQL query parameters when suggesting a query, or null if not applicable. The UI will automatically present these to the user

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

For a JOIN query:
{
  "message": "Here's a query to get orders with customer information.",
  "suggestChartType": "Table",
  "query_parameters": {
    "operation": "select",
    "query": "SELECT o.order_id, o.order_date, c.customer_name, c.email FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) LIMIT 100"
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
          database_name: this.mysqlConfig.data_source.database_name,
          created_at: new Date().toISOString(),
          auto_created: true
        }
      })
      threadId = thread.id
      try { console.log('MySQLAgent: created new threadId:', threadId) } catch {}
    }
    
    const generateOptions = {
      threadId: threadId,
      resourceId: this.data_source_id
    }
    
    const result = await this.agent.generate(query, generateOptions)
    try { console.log('MySQLAgent: agent.generate returned, threadId:', threadId) } catch {}
    return { ...result, threadId }
  }

  public getAgent(): Agent {
    return this.agent
  }

  public async disconnect() {
    if (this.connection) {
      await this.connection.end()
      this.connection = null
    }
  }
}
