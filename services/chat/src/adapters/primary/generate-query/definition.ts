import { AWS, handlerPath } from '@zeiro/sdk'

// 'generateQuery' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Generate DynamoDB query parameters from natural language and queue for execution if auto-approved.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 30, // Shorter timeout since we're not executing queries
  events: [
    {
      http: {
        path: '/chat/generate',
        method: 'POST',
        cors: {
          origin: '*',
          headers: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
            'X-Amz-Security-Token',
            'X-Amz-User-Agent'
          ],
          allowCredentials: false
        },
        authorizer: {
          name: 'CognitoAuthorizerChatGenerate',
          type: 'COGNITO_USER_POOLS',
          arn: '${ssm:/zeiro/${self:custom.stage}/infrastructure/authentication/user-pool/arn}',
        },
        private: false, // TODO: be true
      },
    },
    {
      http: {
        path: '/chat/generate',
        method: 'OPTIONS',
        cors: {
          origin: '*',
          headers: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
            'X-Amz-Security-Token',
            'X-Amz-User-Agent'
          ],
          allowCredentials: false
        },
        private: false,
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:DescribeTable',
        'dynamodb:DescribeTimeToLive',
      ],
      Resource: '*', // Only need describe permissions for schema analysis
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
        '${ssm:/zeiro/${self:custom.stage}/domain/chat/infrastructure/storage/mastra-single-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/chat/infrastructure/storage/mastra-single-table/arn}/index/*',
      ],
    },
    // {
    //   Effect: 'Allow',
    //   Action: [
    //     'sqs:SendMessage',
    //   ],
    //   Resource: [
    //     '${ssm:/zeiro/${self:custom.stage}/domain/executions/infrastructure/storage/query-execution-queue/arn}',
    //   ],
    // },
    {
        Effect: 'Allow',
        Action: ['execute-api:Invoke'],
        Resource: ['*'],
    },
  ],
  environment: {
    OPENAI_API_KEY: '${ssm:/zeiro/${self:custom.stage}/external/openai/api-key}',
    ANTHROPIC_API_KEY: '${ssm:/zeiro/${self:custom.stage}/external/anthropic/api-key}',
    CREDENTIALS_SERVICE_URL: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/url}',
    EXECUTIONS_SERVICE_URL: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/url}',
    MASTRA_STORAGE_TABLE_ARN: '${ssm:/zeiro/${self:custom.stage}/domain/chat/infrastructure/storage/mastra-single-table/arn}',
    MASTRA_STORAGE_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/chat/infrastructure/storage/mastra-single-table/name}',
  },
} 