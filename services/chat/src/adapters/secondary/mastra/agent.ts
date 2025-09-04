import { Agent } from '@mastra/core/agent'
import { openai } from '@ai-sdk/openai'
import { createDynamoDBTool, DynamoDBToolConfig } from './dynamodb-tool'
import { DynamoDBDatabaseSchema } from '@typings/query'

export interface QueryAgentConfig {
  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  schema: DynamoDBDatabaseSchema
  region?: string
}

export class DynamoDBQueryAgent {
  private agent: Agent
  private config: QueryAgentConfig

  constructor(config: QueryAgentConfig) {
    this.config = config
    // Create the DynamoDB tool with user credentials and schema
    const dynamoTool = createDynamoDBTool({
      credentials: config.credentials,
      schema: config.schema,
      region: config.region
    })

    // Create the Mastra agent with the DynamoDB tool
    this.agent = new Agent({
      name: 'DynamoDB Query Agent',
      instructions: `You are an expert DynamoDB query assistant. Your role is to help users query their DynamoDB data using natural language.

**Your Capabilities:**
- Convert natural language queries into efficient DynamoDB operations
- Use the dynamodb-query tool to execute queries against the user's database
- Provide helpful explanations and performance insights
- Suggest optimizations for better query performance

**DynamoDB Operation Guidelines:**
1. **Query Operation**: Use when you have partition key conditions. Most efficient for retrieving items.
2. **Scan Operation**: Use for full table scans when no partition key is available. Less efficient but sometimes necessary.
3. **GetItem Operation**: Use when you have the complete primary key (partition + sort key if applicable).

**Performance Best Practices:**
- Always prefer Query over Scan when possible
- Use Global Secondary Indexes (GSI) when querying on non-key attributes
- Apply filters to reduce data transfer
- Use projection expressions to limit returned attributes
- Set appropriate limits to prevent large result sets

**When responding:**
1. First, analyze the user's natural language query
2. Determine the most appropriate DynamoDB operation
3. Use the dynamodb-query tool to execute the query
4. Explain your reasoning and any performance considerations
5. Present the results in a clear, user-friendly format

Remember: You have access to the table schema through the tool description. Use this information to make informed decisions about the best query approach.`,
      model: openai('gpt-4o-mini'),
      tools: {
        dynamoTool
      }
    })
  }

  getAgent() {
    return this.agent
  }

  async processQuery(naturalLanguageQuery: string, context?: string): Promise<{
    response: string
    toolResults?: any[]
    reasoning: string
    confidence: number
    generatedQuery?: any
  }> {
    try {
      // Construct the prompt with context if provided
      let prompt = `Please help me query my DynamoDB database: "${naturalLanguageQuery}"`
      
      if (context) {
        prompt += `\n\nAdditional context: ${context}`
      }

      // Generate response using the agent with proper message format
      const result = await this.agent.generate([
        {
          role: 'user',
          content: prompt
        }
      ], {
        maxSteps: 3, // Allow up to 3 tool usage steps
      })
      
      // Extract tool results if any tools were called
      const toolResults = result.toolCalls?.map(call => ({
        toolName: call.toolName,
        parameters: call.args,
        result: call.result
      })) || []

      // Calculate confidence based on tool usage and results
      const confidence = this.calculateConfidence(result, toolResults)

      // Extract generated query from tool results
      const generatedQuery = toolResults.length > 0 ? toolResults[0].parameters : undefined

      return {
        response: result.text || 'I was unable to process your query.',
        toolResults,
        reasoning: this.extractReasoning(result.text || '', toolResults),
        confidence,
        generatedQuery
      }
    } catch (error) {
      console.error('Agent query processing error:', error)
      throw new Error(`Failed to process query: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractReasoning(response: string, toolResults: any[]): string {
    // Extract reasoning from the agent's response
    // This is a simple implementation - you could make it more sophisticated
    
    if (toolResults.length > 0) {
      const firstTool = toolResults[0]
      const operation = firstTool.parameters?.operation
      const performance = firstTool.result?.performance
      
      let reasoning = `I used a ${operation} operation to retrieve your data.`
      
      if (performance) {
        reasoning += ` ${performance.message}`
      }
      
      return reasoning
    }
    
    return 'I analyzed your query and provided a response based on the available information.'
  }

  private calculateConfidence(result: any, toolResults: any[]): number {
    // Calculate confidence score based on various factors
    let confidence = 0.5 // Base confidence
    
    // Higher confidence if tools were successfully used
    if (toolResults.length > 0) {
      confidence += 0.3
      
      // Check if the tool execution was successful
      const hasSuccessfulResults = toolResults.some(tool => 
        tool.result && !tool.result.error
      )
      
      if (hasSuccessfulResults) {
        confidence += 0.2
      }
    }
    
    // Higher confidence if the response contains specific information
    if (result.text && result.text.length > 50) {
      confidence += 0.1
    }
    
    // Cap confidence at 1.0
    return Math.min(confidence, 1.0)
  }

  // Method to get agent information for debugging
  getAgentInfo() {
    return {
      name: this.agent.name,
      instructions: this.agent.instructions,
      toolCount: this.agent.tools?.length || 0
    }
  }

  // Method to execute a query using stored parameters
  async executeStoredQuery(parameters: any): Promise<{
    response: string
    data?: any
    toolResults?: any[]
    reasoning: string
    confidence: number
  }> {
    try {
      console.log('Executing stored query with parameters:', parameters)
      
      // Create a DynamoDB tool with the stored parameters
      const dynamoTool = createDynamoDBTool({
        credentials: this.config.credentials,
        schema: this.config.schema,
        region: this.config.region
      })

      // Execute the tool directly with the stored parameters
      const toolResult = await dynamoTool.execute({ context: parameters })
      
      console.log('Tool execution result:', toolResult)

      // Format the response based on the results
      const items = toolResult.items || []
      const count = toolResult.count || 0
      
      let response = `Found ${count} result${count !== 1 ? 's' : ''}`
      if (toolResult.performance) {
        response += `. ${toolResult.performance.message}`
      }

      // Prepare chart data format
      const chartData = {
        message: response,
        data: items,
        count: count,
        operation: toolResult.operation,
        performance: toolResult.performance,
        suggestedChartType: 'Table', // Default fallback, should be overridden by AI agent
        title: this.generateTitle(parameters, count)
      }

      return {
        response,
        data: chartData,
        toolResults: [{ result: toolResult }],
        reasoning: `Executed ${toolResult.operation} operation directly using stored parameters`,
        confidence: toolResult.performance?.efficient ? 0.9 : 0.7
      }
    } catch (error) {
      console.error('Stored query execution error:', error)
      throw new Error(`Failed to execute stored query: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }



  private generateTitle(parameters: any, count: number): string {
    const operation = parameters.operation || 'Query'
    const tableName = parameters.table_name || 'Table'
    
    if (count === 0) {
      return `No results found in ${tableName}`
    } else if (count === 1) {
      return `1 result from ${tableName}`
    } else {
      return `${count} results from ${tableName}`
    }
  }
} 