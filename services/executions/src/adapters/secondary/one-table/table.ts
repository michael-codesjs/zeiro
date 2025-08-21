import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
})

export const query_executions_table = new Table({
  name: process.env.QUERY_EXECUTIONS_TABLE_NAME || 'zeiro-query-executions-dev',
  client,
  partial: false,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'pk', sort: 'sk' },
      gsi1: { hash: 'gsi1pk', sort: 'gsi1sk', project: 'all' }, // By user and status
      gsi2: { hash: 'gsi2pk', sort: 'gsi2sk', project: 'all' }, // By execution ID
    },
    models: {
      QueryExecution: {
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
  },
}) 