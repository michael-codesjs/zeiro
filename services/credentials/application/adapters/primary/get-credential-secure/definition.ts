import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Get full credential details (including unmasked secrets) for internal service use.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/credentials/{id}/secure',
        cors: true,
        authorizer: 'AWS_IAM',
        private: false, // This should be private as it exposes sensitive data
      },
    },
  ],
  environment: {
    CREDENTIALS_DYNAMODB_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/name}',
    CREDENTIAL_ENCRYPTION_KEY: '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/encryption/key}',
  },
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
      ],
      Resource: '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/arn}',
    },
    {
      Effect: 'Allow',
      Action: [
        'ssm:GetParameter',
      ],
      Resource: [
        'arn:aws:ssm:${self:custom.region}:*:parameter/zeiro/${self:custom.stage}/domain/credentials/infrastructure/encryption/key',
      ],
    },
  ],
} 