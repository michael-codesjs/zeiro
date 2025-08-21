import { Agent } from "@mastra/core/agent";
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { DynamoDBClient, DescribeTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

// Helper function to configure model based on the model string
function getModelConfig(model: string) {
  if (model.includes('claude') || model.includes('anthropic')) {
    return anthropic(model);
  }
  return openai(model);
}

// Configuration for the deep discovery agent
export type DeepDiscoveryAgentConfig = {
  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  region?: string
  model?: string
}

// Schema for discovered table information
export type DiscoveredTableInfo = {
  table_name: string
  primary_key: {
    partition_key: string
    sort_key?: string
  }
  global_secondary_indexes?: Array<{
    index_name: string
    partition_key: string
    sort_key?: string
  }>
  discovered_fields: Array<{
    name: string
    type: string
    frequency: number
    sample_values: any[]
    is_nullable: boolean
    description?: string
  }>
  query_patterns: string[]
  table_description: string
  optimal_queries: Array<{
    pattern: string
    use_case: string
    example: string
  }>
}

export class DynamoDBDeepDiscoveryAgent {
  private config: DeepDiscoveryAgentConfig
  private dynamoClient: DynamoDBClient
  private docClient: DynamoDBDocumentClient
  private agent: Agent

  constructor(config: DeepDiscoveryAgentConfig) {
    this.config = config
    this.dynamoClient = new DynamoDBClient({ 
      region: config.region || 'eu-central-1', 
      credentials: config.credentials 
    })
    this.docClient = DynamoDBDocumentClient.from(this.dynamoClient)
    this.agent = this.createAgent()
  }

  private createAgent(): Agent {
    const modelConfig = getModelConfig(this.config.model || 'gpt-4o')

    const analyzeTableTool = createTool({
      id: 'analyze-dynamodb-table',
      description: 'Analyze a DynamoDB table structure and generate query context information',
      
      inputSchema: z.object({
        table_name: z.string(),
        sample_data: z.array(z.any()),
        table_metadata: z.object({
          primary_key: z.object({
            partition_key: z.string(),
            sort_key: z.string().optional()
          }),
          global_secondary_indexes: z.array(z.object({
            index_name: z.string(),
            partition_key: z.string(),
            sort_key: z.string().optional()
          })).optional(),
          item_count: z.number()
        })
      }),
      
      outputSchema: z.object({
        table_description: z.string(),
        discovered_fields: z.array(z.object({
          name: z.string(),
          type: z.string(),
          frequency: z.number(),
          sample_values: z.array(z.any()),
          is_nullable: z.boolean(),
          description: z.string()
        })),
        query_patterns: z.array(z.string()),
        optimal_queries: z.array(z.object({
          pattern: z.string(),
          use_case: z.string(),
          example: z.string()
        }))
      }),
      
      execute: async ({ context: params }) => {
        // This tool will be executed by the agent to process the analysis
        return params // The agent will handle the actual analysis
      }
    })

    return new Agent({
      name: 'DynamoDB Deep Discovery Agent',
      instructions: `You are a specialized DynamoDB analysis agent. Your job is to analyze DynamoDB table structures and sample data to generate comprehensive information that will help other agents understand and query the data effectively.

When analyzing a table, you should:

1. **Understand the Table Structure**:
   - Identify the primary key components (partition key and sort key if present)
   - Document Global Secondary Indexes and their use cases
   - Analyze the overall data organization pattern

2. **Analyze Sample Data**:
   - Examine field patterns, types, and frequency of occurrence
   - Identify common data structures and nested objects
   - Determine which fields are nullable vs required
   - Extract meaningful sample values for each field

3. **Generate Field Descriptions**:
   - Provide clear, concise descriptions for each discovered field
   - Explain the purpose and typical use of each field
   - Note any patterns in the data (e.g., email formats, timestamps, IDs)

4. **Create Query Patterns**:
   - Identify the most common and efficient query patterns
   - Document when to use GetItem vs Query vs Scan operations
   - Explain how to leverage GSIs for optimal performance

5. **Generate Optimal Query Examples**:
   - Provide specific query examples with use cases
   - Show how to construct efficient key conditions
   - Demonstrate proper use of filter expressions

Your analysis should be thorough but concise, focusing on information that will help query agents understand:
- What data is available in the table
- How the data is structured and organized
- The best ways to query for specific information
- Common patterns and use cases

Always provide practical, actionable insights that improve query efficiency and accuracy.`,

      model: modelConfig,
      tools: {
        'analyze-dynamodb-table': analyzeTableTool
      }
    })
  }

  // Main method to discover and analyze a table
  async discoverTable(tableName: string, sampleSize: number = 100): Promise<DiscoveredTableInfo> {
    try {
      // 1. Get table metadata
      const tableDescription = await this.dynamoClient.send(new DescribeTableCommand({
        TableName: tableName
      }))

      const table = tableDescription.Table!
      
      const primaryKey = {
        partition_key: table.KeySchema!.find(key => key.KeyType === 'HASH')!.AttributeName!,
        sort_key: table.KeySchema!.find(key => key.KeyType === 'RANGE')?.AttributeName
      }

      const globalSecondaryIndexes = table.GlobalSecondaryIndexes?.map(gsi => ({
        index_name: gsi.IndexName!,
        partition_key: gsi.KeySchema!.find(key => key.KeyType === 'HASH')!.AttributeName!,
        sort_key: gsi.KeySchema!.find(key => key.KeyType === 'RANGE')?.AttributeName
      }))

      // 2. Fetch sample data
      const scanResult = await this.docClient.send(new ScanCommand({
        TableName: tableName,
        Limit: sampleSize
      }))

      const sampleData = scanResult.Items || []

      // 3. Analyze field patterns
      const fieldAnalysis = this.analyzeFields(sampleData)

      // 4. Use the agent to generate comprehensive analysis
      const analysisPrompt = `Analyze this DynamoDB table and generate comprehensive information for query optimization:

Table: ${tableName}
Primary Key: ${primaryKey.partition_key}${primaryKey.sort_key ? ` (partition), ${primaryKey.sort_key} (sort)` : ''}
${globalSecondaryIndexes?.length ? `Global Secondary Indexes: ${globalSecondaryIndexes.map(gsi => `${gsi.index_name} (${gsi.partition_key}${gsi.sort_key ? `, ${gsi.sort_key}` : ''})`).join(', ')}` : 'No GSIs'}
Item Count: ${table.ItemCount || 0}

Sample Data Analysis:
${JSON.stringify(fieldAnalysis, null, 2)}

Sample Records (first 3):
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

Please provide:
1. A clear description of what this table stores and its purpose
2. Detailed field descriptions explaining each field's role and typical values
3. Common query patterns users would want to perform
4. Optimal query examples with specific use cases`

      const agentResponse = await this.agent.generate(analysisPrompt)

      // Parse the agent's analysis
      let analysisResult: any = {}
      
      if (agentResponse.toolResults && agentResponse.toolResults.length > 0) {
        analysisResult = agentResponse.toolResults[0].result
      } else {
        // Fallback: parse from text response
        analysisResult = this.parseAgentResponse(agentResponse.text, fieldAnalysis)
      }

      // 5. Combine everything into the final result
      return {
        table_name: tableName,
        primary_key: primaryKey,
        global_secondary_indexes: globalSecondaryIndexes,
        discovered_fields: analysisResult.discovered_fields || this.convertFieldAnalysis(fieldAnalysis),
        query_patterns: analysisResult.query_patterns || this.generateDefaultQueryPatterns(primaryKey, globalSecondaryIndexes),
        table_description: analysisResult.table_description || `DynamoDB table ${tableName} with ${table.ItemCount || 0} items`,
        optimal_queries: analysisResult.optimal_queries || this.generateDefaultOptimalQueries(primaryKey, globalSecondaryIndexes)
      }

    } catch (error) {
      console.error('Table discovery failed:', error)
      throw new Error(`Failed to discover table ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Analyze field patterns from sample data
  private analyzeFields(sampleData: any[]) {
    const fieldStats = new Map<string, {
      type: string
      frequency: number
      sampleValues: Set<any>
      nullCount: number
    }>()

    sampleData.forEach(item => {
      this.processObject(item, '', fieldStats)
    })

    const result: any = {}
    fieldStats.forEach((stats, fieldName) => {
      result[fieldName] = {
        type: stats.type,
        frequency: stats.frequency / sampleData.length,
        sample_values: Array.from(stats.sampleValues).slice(0, 3),
        is_nullable: stats.nullCount > 0,
        occurrence_count: stats.frequency
      }
    })

    return result
  }

  private processObject(obj: any, prefix: string, fieldStats: Map<string, any>, depth = 0) {
    if (depth > 3) return

    Object.entries(obj).forEach(([key, value]) => {
      const fieldName = prefix ? `${prefix}.${key}` : key
      
      if (!fieldStats.has(fieldName)) {
        fieldStats.set(fieldName, {
          type: this.getDataType(value),
          frequency: 0,
          sampleValues: new Set(),
          nullCount: 0
        })
      }

      const stats = fieldStats.get(fieldName)!
      stats.frequency++
      
      if (value === null || value === undefined) {
        stats.nullCount++
      } else {
        if (stats.sampleValues.size < 5) {
          stats.sampleValues.add(value)
        }
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.processObject(value, fieldName, fieldStats, depth + 1)
      }
    })
  }

  private getDataType(value: any): string {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number'
    if (typeof value === 'string') return 'string'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    return 'unknown'
  }

  // Fallback methods for when agent doesn't provide structured output
  private parseAgentResponse(text: string, fieldAnalysis: any) {
    // Simple parsing logic - in practice, you might want more sophisticated parsing
    return {
      table_description: this.extractSection(text, 'description') || 'DynamoDB table',
      discovered_fields: this.convertFieldAnalysis(fieldAnalysis),
      query_patterns: this.extractList(text, 'patterns') || [],
      optimal_queries: this.extractQueries(text) || []
    }
  }

  private extractSection(text: string, sectionName: string): string | null {
    const regex = new RegExp(`${sectionName}[:\\s]*([^\\n]+)`, 'i')
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  private extractList(text: string, listType: string): string[] {
    const lines = text.split('\n')
    const items: string[] = []
    let inSection = false
    
    lines.forEach(line => {
      if (line.toLowerCase().includes(listType)) {
        inSection = true
      } else if (inSection && line.trim().startsWith('-')) {
        items.push(line.trim().substring(1).trim())
      } else if (inSection && line.trim() === '') {
        inSection = false
      }
    })
    
    return items
  }

  private extractQueries(text: string) {
    // Extract query examples from text
    return []
  }

  private convertFieldAnalysis(fieldAnalysis: any) {
    return Object.entries(fieldAnalysis).map(([name, stats]: [string, any]) => ({
      name,
      type: stats.type,
      frequency: stats.frequency,
      sample_values: stats.sample_values,
      is_nullable: stats.is_nullable,
      description: `${name} field of type ${stats.type}`
    }))
  }

  private generateDefaultQueryPatterns(primaryKey: any, gsis?: any[]) {
    const patterns = [
      `Get item by ${primaryKey.partition_key}${primaryKey.sort_key ? ` and ${primaryKey.sort_key}` : ''}`,
      `Query items by ${primaryKey.partition_key}`,
    ]

    if (gsis?.length) {
      gsis.forEach(gsi => {
        patterns.push(`Query using ${gsi.index_name} index`)
      })
    }

    return patterns
  }

  private generateDefaultOptimalQueries(primaryKey: any, gsis?: any[]) {
    const queries = [
      {
        pattern: 'GetItem',
        use_case: 'Retrieve a specific item',
        example: `GetItem with ${primaryKey.partition_key}${primaryKey.sort_key ? ` and ${primaryKey.sort_key}` : ''}`
      },
      {
        pattern: 'Query',
        use_case: 'Get multiple items with same partition key',
        example: `Query by ${primaryKey.partition_key}`
      }
    ]

    if (gsis?.length) {
      gsis.forEach(gsi => {
        queries.push({
          pattern: 'Query with GSI',
          use_case: `Query using ${gsi.index_name}`,
          example: `Query ${gsi.index_name} with ${gsi.partition_key}`
        })
      })
    }

    return queries
  }

  // Get list of tables for discovery
  async listTables(): Promise<string[]> {
    try {
      const result = await this.dynamoClient.send(new ListTablesCommand({}))
      return result.TableNames || []
    } catch (error) {
      console.error('Failed to list tables:', error)
      return []
    }
  }
} 