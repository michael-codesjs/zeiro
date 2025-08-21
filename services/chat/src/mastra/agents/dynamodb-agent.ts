import { Agent } from "@mastra/core"
import { DynamoDBStore } from "@mastra/dynamodb"
import { Memory } from "@mastra/memory"
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

export type AgentConfig = {
  database: {
    id: string
    name: string
  }
  model: ReturnType<typeof openai> | ReturnType<typeof anthropic>
  region?: string
}


export class DynamoDBAgent {

  private agent: Agent
  private memory: Memory
  private config: AgentConfig

  private current_thread_id: string = null
  private database_id: string = null

  constructor(config: AgentConfig) {

    this.config = config
    this.database_id = config.database.id

    // Validate that database_id is provided when memory is available
    if (this.memory && !this.database_id) {
      throw new Error('database_id is required when memory functionality is enabled. The database ID serves as the resource identifier for organizing conversation threads.');
    }

     // Initialize DynamoDB storage for Mastra
     const storage = new DynamoDBStore({
      name: "dynamodb-storage",
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
          scope: 'thread', // TODO: change to resource when supported
        },
      },
    });

    this.setupAgent()
  }

  private setupAgent() {

    this.agent = new Agent({
      name: 'DynamoDB Agent',
      instructions: 'You are a helpful assistant that can answer questions about the database.',
      model: this.config.model,
      tools: {},
      memory: this.memory
    })
  }

  public getAgent() {
    return this.agent
  }

}