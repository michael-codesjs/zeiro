import { AWS, handlerPath } from '@zeiro/sdk'

// 'createUser' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Create user credentials lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: '/user/users',
        method: 'POST',
        cors: true,
        authorizer: 'AWS_IAM',
        private: false, // TODO: be true
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
        'dynamodb:PutItem',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/user/users/infrastructure/storage/zeiro-users-table/arn}',
      ],
    },
    {
      Effect: 'Allow',
      Action: ['events:PutEvents'],
      Resource:
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/arn}',
    },
  ],
  environment: {
    USERS_DYNAMODB_TABLE_NAME:
      '${ssm:/zeiro/${self:custom.stage}/domain/user/users/infrastructure/storage/zeiro-users-table/name}',
  },
}
