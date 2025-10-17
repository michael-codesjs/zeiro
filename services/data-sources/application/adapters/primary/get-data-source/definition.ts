import { AWS, handlerPath } from '@zeiro/sdk'

// 'getDataSource' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Get single data source with discovered fields lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: '/data-sources/{id}',
        method: 'GET',
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
            name: 'CognitoAuthorizerDataSources',
            type: 'COGNITO_USER_POOLS',
            arn: '${ssm:/zeiro/${self:custom.stage}/infrastructure/authentication/user-pool/arn}',
          },
        private: false, // TODO: be true
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:DescribeTable',
        'dynamodb:Scan',
      ],
      Resource: '*', // Needed to discover schema in external DynamoDB tables
    },
    {
      Effect: 'Allow',
      Action: ['execute-api:Invoke'],
      Resource: ['*'], // Needed to call credentials service
    },
  ],
  environment: {
    ZEIRO_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/name}',
    CREDENTIALS_SERVICE_URL: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/url}',
    STAGE: '${self:custom.stage}',
  },
}
