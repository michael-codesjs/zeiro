import { AWS, handlerPath } from '@zeiro/sdk'

// 'getDataSources' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Get user data sources lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: '/data-sources',
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
        '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/arn}/index/*',
      ],
    },
  ],
  environment: {
    DATA_SOURCES_DYNAMODB_TABLE_NAME:
      '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/name}',
  },
} 