import { Agent } from "@mastra/core"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

export type DataSourceAgentResponse = {
  message: string
  suggestChartType: 'Table' | 'Pie' | 'LineGraph' | null
  query_parameters: any | null
}

export type ParsedAgentResponse = {
  message: string
  suggestChartType: 'Table' | 'Pie' | 'LineGraph' | null
  query_parameters: any | null
}

export type DataSourceAgentConfig = {
  data_source: {
    id: string
    name: string
    table_name: string
  }
  credentials: {
    access_key_id: string
    secret_access_key: string
    session_token?: string
  }
  model: ReturnType<typeof openai> | ReturnType<typeof anthropic>
  region?: string
  user_id: string // Required for user identification
}

export interface IDataSourceAgent {
  /**
   * Generate a response to a natural language query
   */
  generate(query: string, options?: { threadId?: string }): Promise<{
    text: string
    threadId?: string
  }>
  
  /**
   * Get the underlying Mastra agent instance
   */
  getAgent(): Agent
}

export abstract class DataSourceAgent implements IDataSourceAgent {
  protected agent: Agent
  protected config: DataSourceAgentConfig

  constructor(config: DataSourceAgentConfig) {
    this.config = config
  }

  abstract generate(query: string, options?: { threadId?: string }): Promise<{
    text: string
    threadId?: string
  }>

  abstract getAgent(): Agent
}
