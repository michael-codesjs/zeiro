import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Create data source lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: '/data-sources',
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
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/arn}',
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
  ],
  environment: {
    DATA_SOURCES_DYNAMODB_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/name}',
  },
} 