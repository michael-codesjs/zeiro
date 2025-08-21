import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Create a DynamoDB query from form input and return execution_id for later execution.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 30,
  events: [
    {
      http: {
        method: 'post',
        path: '/executions/create-dynamodb-query',
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
        private: false,
      },
    },
    {
      http: {
        method: 'OPTIONS',
        path: '/executions/create-dynamodb-query',
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
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:BatchGetItem',
        'dynamodb:DescribeTable',
      ],
      Resource: '*', // In production, this should be more restrictive
    },
    {
      Effect: 'Allow',
      Action: [
        'ssm:GetParameter',
        'ssm:GetParameters',
      ],
      Resource: [
        'arn:aws:ssm:${aws:region}:${aws:accountId}:parameter/zeiro/${self:custom.stage}/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'execute-api:Invoke',
      ],
      Resource: [
        'arn:aws:execute-api:${aws:region}:${aws:accountId}:${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/id}/*/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/arn}/index/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:GetItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/arn}/index/*',
      ],
    },
  ],
  environment: {
    QUERY_EXECUTIONS_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/query/infrastructure/storage/query-executions-table/name}',
  },
} 