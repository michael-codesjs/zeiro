import { AWS, handlerPath } from '@zeiro/sdk'

// 'updateCredential' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Update credential lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: '/credentials/{id}',
        method: 'PUT',
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
          name: 'CognitoAuthorizer',
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
        'dynamodb:UpdateItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/arn}',
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
    CREDENTIALS_DYNAMODB_TABLE_NAME:
      '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/name}',
    CREDENTIAL_ENCRYPTION_KEY:
      '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/encryption/key}',
  },
} 