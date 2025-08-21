import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
    handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: '/credentials',
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
        '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/arn}',
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
  environment: {
    CREDENTIALS_DYNAMODB_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/name}',
    CREDENTIAL_ENCRYPTION_KEY: '${ssm:/zeiro/${self:custom.stage}/domain/credentials/infrastructure/encryption/key}',
  },
}

export default definition 