import { AWS, handlerPath } from '@zeiro/sdk'

// 'executeQuery' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Execute a query by execution_id.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 30, // Quick timeout since we're just queuing the execution
  events: [
    {
      http: {
        path: '/executions/execute',
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
          name: 'CognitoAuthorizerExecuteQuery',
          type: 'COGNITO_USER_POOLS',
          arn: '${ssm:/zeiro/${self:custom.stage}/infrastructure/authentication/user-pool/arn}',
        },
      },
    },
    {
      http: {
        path: '/executions/execute',
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
        'dynamodb:UpdateItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/arn}/index/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'sqs:SendMessage',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-execution-queue/arn}',
      ],
    },

  ],
  environment: {
    QUERY_EXECUTIONS_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/name}',
    QUERY_EXECUTION_QUEUE_URL: '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-execution-queue/url}',
  },
}; 