import { AWS } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  handler: 'src/adapters/primary/chat/handler.main',
  events: [
    {
      http: {
        method: 'post',
        path: '/chat',
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
          name: 'CognitoAuthorizerChat',
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
        'ssm:GetParameter',
        'ssm:GetParameters',
      ],
      Resource: [
        'arn:aws:ssm:${self:custom.region}:${aws:accountId}:parameter/zeiro/${self:custom.stage}/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:Query',
        'dynamodb:GetItem',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
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
        'kms:Encrypt',
        'kms:Decrypt',
        'kms:ReEncrypt*',
        'kms:GenerateDataKey*',
        'kms:DescribeKey',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/security/kms/credentials-key/arn}',
      ],
    },
  ],
  environment: {
    ZEIRO_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/name}',
    EVENT_BUS_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/name}',
    CREDENTIAL_KMS_KEY_ALIAS: '${ssm:/zeiro/${self:custom.stage}/infrastructure/security/kms/credentials-key/alias}',
    STAGE: '${self:custom.stage}',
  },
}