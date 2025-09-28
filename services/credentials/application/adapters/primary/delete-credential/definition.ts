import { AWS, handlerPath } from '@zeiro/sdk'

// 'deleteCredential' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Delete credential lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: '/credentials/{id}',
        method: 'DELETE',
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
          name: 'CognitoAuthorizerCredentials',
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
        'dynamodb:DeleteItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
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
    ZEIRO_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/name}',
    CREDENTIAL_KMS_KEY_ALIAS: '${ssm:/zeiro/${self:custom.stage}/infrastructure/security/kms/credentials-key/alias}',
    STAGE: '${self:custom.stage}',
  },
} 