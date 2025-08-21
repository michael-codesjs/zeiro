import { AWS, handlerPath } from '@zeiro/sdk'

// 'manageThreads' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Manage conversation threads for the query agent with memory.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 30,
  events: [
    {
      http: {
        path: '/chat/threads',
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
          name: 'CognitoAuthorizerChatThreads',
          type: 'COGNITO_USER_POOLS',
          arn: '${ssm:/zeiro/${self:custom.stage}/infrastructure/authentication/user-pool/arn}',
        },
        private: false, // TODO: be true
      },
    },
    {
      http: {
        path: '/chat/threads',
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
        '${ssm:/zeiro/${self:custom.stage}/domain/chat/infrastructure/storage/mastra-single-table/arn}/index/*'
      ],
    },
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
    MASTRA_STORAGE_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/chat/infrastructure/storage/mastra-single-table/name}',
  },
} 