import { Model } from 'dynamodb-onetable'
import { query_executions_table } from './table'

export interface QueryExecution {
  // DynamoDB keys
  pk?: string
  sk?: string
  gsi1pk?: string
  gsi1sk?: string
  gsi2pk?: string
  gsi2sk?: string
  // Business fields
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
  results?: any
  error?: string
  autoApproved?: boolean
  createdAt: string
  updatedAt: string
  expiresAt: number
}

// Define the query execution model
export const queryExecutions = new Model<QueryExecution>(
  query_executions_table,
  'QueryExecution',
  {
        fields: {
        pk: { type: String, value: 'USER#${userId}' },
        sk: { type: String, value: 'EXECUTION#${executionId}' },
        gsi1pk: { type: String, value: 'USER#${userId}' },
        gsi1sk: { type: String, value: 'STATUS#${status}#${createdAt}' },
        gsi2pk: { type: String, value: 'EXECUTION#${executionId}' },
        gsi2sk: { type: String, value: 'USER#${userId}' },
        executionId: { type: String, required: true },
      userId: { type: String, required: true },
      databaseId: { type: String, required: true },
      naturalLanguageQuery: { type: String, required: true },
      generatedParameters: { type: Object, required: true },
      operation: { type: String },
      explanation: { type: String },
      suggestedChartType: { type: String },
              title: { type: String },
        status: { type: String, required: true, default: 'pending_approval' },
        threadId: { type: String },
        results: { type: Object },
      error: { type: String },
      autoApproved: { type: Boolean, default: false },
      createdAt: { type: String, required: true },
      updatedAt: { type: String, required: true },
      expiresAt: { type: Number, required: true },
    },
  },
) 