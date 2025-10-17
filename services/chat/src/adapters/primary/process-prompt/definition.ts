import { AWS } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  handler: 'src/adapters/primary/process-prompt/handler.main',
  timeout: 900, // 15 minutes for long-running AI processing
  memorySize: 1024, // More memory for AI processing
  maximumRetryAttempts: 0, // Never retry on failure
  events: [
    {
      eventBridge: {
        eventBus: 'arn:aws:events:${self:custom.region}:${aws:accountId}:event-bus/zeiro-${self:custom.stage}-central',
        pattern: {
          source: ['zeiro.chat'],
          'detail-type': ['USER_PROMPTED'],
        },
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'ssm:GetParameter',
        'ssm:GetParameters',
      ],
      Resource: [
        'arn:aws:ssm:${self:custom.region}:${aws:accountId}:parameter/zeiro/${self:custom.stage}/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:Query',
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Scan',
        'dynamodb:DescribeTable',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/mastra-single-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/mastra-single-table/arn}/index/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'execute-api:ManageConnections',
      ],
      Resource: [
        'arn:aws:execute-api:${self:custom.region}:${aws:accountId}:${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/websocket/api/id}/*/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'events:PutEvents',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/arn}',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'kms:Encrypt',
        'kms:Decrypt',
        'kms:ReEncrypt*',
        'kms:GenerateDataKey*',
        'kms:DescribeKey',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/security/kms/credentials-key/arn}',
      ],
    },
  ],
  environment: {
    ZEIRO_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/name}',
    MASTRA_STORAGE_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/mastra-single-table/name}',
    CREDENTIAL_KMS_KEY_ALIAS: '${ssm:/zeiro/${self:custom.stage}/infrastructure/security/kms/credentials-key/alias}',
    STAGE: '${self:custom.stage}',
  },
}
