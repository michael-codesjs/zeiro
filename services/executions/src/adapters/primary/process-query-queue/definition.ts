import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Process query execution messages from SQS and send results via WebSocket service',
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 180, // 3 minutes for query execution (reduced for better performance)
  memorySize: 1024, // Increased memory for better performance
  events: [
    {
      sqs: {
        arn: '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-execution-queue/arn}',
        batchSize: 1, // Process one message at a time for optimal error handling
        maximumBatchingWindow: 0, // Process immediately
        functionResponseType: 'ReportBatchItemFailures'
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:BatchGetItem',
        'dynamodb:DescribeTable',
      ],
      Resource: '*', // In production, this should be more specific
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:BatchGetItem',
        'dynamodb:BatchWriteItem',
        'dynamodb:DescribeTable',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/arn}/index/*',
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/mastra-single-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/mastra-single-table/arn}/index/*'
      ],
    },

    {
      Effect: 'Allow',
      Action: [
        'execute-api:Invoke'
      ],
      Resource: [
        'arn:aws:execute-api:${self:custom.region}:*:*/*/POST/internal/databases/*',
        'arn:aws:execute-api:${self:custom.region}:*:*/*/GET/credentials/*/secure',
        'arn:aws:execute-api:${self:custom.region}:*:*/*/*'
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-execution-queue/arn}',
      ],
    },
  ],
  environment: {
    OPENAI_API_KEY: '${ssm:/zeiro/${self:custom.stage}/external/openai/api-key}',
    ANTHROPIC_API_KEY: '${ssm:/zeiro/${self:custom.stage}/external/anthropic/api-key}',
    CREDENTIALS_SERVICE_URL: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/url}',
    QUERY_EXECUTIONS_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/name}',
    MASTRA_STORAGE_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/mastra-single-table/name}',
    QUERY_AGENT_MODEL: 'gpt-4o-mini',
  },
} 