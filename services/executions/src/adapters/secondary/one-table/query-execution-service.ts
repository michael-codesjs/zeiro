import { v4 as uuidv4 } from 'uuid'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { queryExecutions, QueryExecution } from './query-execution-model'

export class QueryExecutionService {
  private ssmClient: SSMClient

  constructor() {
    this.ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'eu-central-1' })
  }

  async createQueryExecution(params: {
    executionId: string
    userId: string
    databaseId: string
    naturalLanguageQuery: string
    generatedParameters: any
    operation?: string
    explanation?: string
    suggestedChartType?: string
    title?: string
    status: 'pending_approval' | 'queued' | 'executing' | 'executed' | 'failed'
    threadId?: string
    autoApproved?: boolean
  }): Promise<QueryExecution> {
    const now = new Date().toISOString()
    const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now

    const queryExecution: QueryExecution = {
      executionId: params.executionId,
      userId: params.userId,
      databaseId: params.databaseId,
      naturalLanguageQuery: params.naturalLanguageQuery,
      generatedParameters: params.generatedParameters,
      status: params.status,
      createdAt: now,
      updatedAt: now,
      expiresAt: expiresAt,
      autoApproved: params.autoApproved || false,
      ...params.operation && { operation: params.operation },
      ...params.explanation && { explanation: params.explanation },
      ...params.suggestedChartType && { suggestedChartType: params.suggestedChartType },
      ...params.title && { title: params.title },
      ...params.threadId && { threadId: params.threadId },
    }

    const savedExecution = await queryExecutions.create(queryExecution as never)
    return savedExecution as QueryExecution
  }

  async getQueryExecution(userId: string, executionId: string): Promise<QueryExecution | null> {
    try {
      const execution = await queryExecutions.get({
        pk: `USER#${userId}`,
        sk: `EXECUTION#${executionId}`,
      })
      return execution as QueryExecution | null
    } catch (error) {
      console.error('Error getting query execution:', error)
      return null
    }
  }

  async getQueryExecutionByExecutionId(executionId: string): Promise<QueryExecution | null> {
    try {
      const executions = await queryExecutions.find(
        {
          gsi2pk: `EXECUTION#${executionId}`,
        },
        {
          index: 'gsi2',
          limit: 1,
        }
      )
      return executions.length > 0 ? executions[0] as QueryExecution : null
    } catch (error) {
      console.error('Error getting query execution by execution ID:', error)
      return null
    }
  }

  async updateQueryExecutionStatus(
    userId: string,
    executionId: string,
    status: 'queued' | 'executing' | 'executed' | 'failed',
    results?: any,
    error?: string
  ): Promise<void> {
    // Validate required inputs
    if (!userId || !executionId) {
      throw new Error(`Missing required parameters: userId=${userId}, executionId=${executionId}`)
    }

    // First, get the existing execution to retrieve the createdAt value
    // This is needed because the gsi1sk template requires both status and createdAt
    const existingExecution = await this.getQueryExecution(userId, executionId)
    if (!existingExecution) {
      throw new Error(`Query execution not found: userId=${userId}, executionId=${executionId}`)
    }

    const now = new Date().toISOString()
    
    const updateData: Partial<QueryExecution> = {
      status,
      updatedAt: now,
      // Include createdAt to ensure GSI keys can be properly resolved
      createdAt: existingExecution.createdAt,
    }

    // Only add results if it's provided and not null/undefined
    if (results !== undefined && results !== null) {
      updateData.results = results
    }

    // Only add error if it's provided and not null/undefined/empty
    if (error !== undefined && error !== null && error !== '') {
      updateData.error = error
    }

    try {
      await queryExecutions.update(
        {
          pk: `USER#${userId}`,
          sk: `EXECUTION#${executionId}`,
          ...updateData,
        } as never,
      )
      console.log(`✅ Successfully updated query execution status to ${status} for executionId: ${executionId}`)
    } catch (updateError) {
      console.error(`❌ Failed to update query execution status:`, {
        userId,
        executionId,
        status,
        updateData,
        error: updateError
      })
      throw new Error(`Failed to update query execution status: ${updateError instanceof Error ? updateError.message : String(updateError)}`)
    }
  }

  async getUserQueryExecutions(userId: string, status?: string): Promise<QueryExecution[]> {
    try {
      const conditions: any = {
        gsi1pk: `USER#${userId}`,
      }

      if (status) {
        conditions.gsi1sk = { begins: `STATUS#${status}#` }
      }

      const executions = await queryExecutions.find(conditions, {
        index: 'gsi1',
        reverse: true, // Most recent first
      })

      return executions as QueryExecution[]
    } catch (error) {
      console.error('Error getting user query executions:', error)
      return []
    }
  }
} 