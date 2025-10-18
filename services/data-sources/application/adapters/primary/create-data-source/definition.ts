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
    ZEIRO_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/name}',
    KMS_KEY_ALIAS: '${ssm:/zeiro/${self:custom.stage}/infrastructure/security/kms/credentials-key/alias}',
    STAGE: '${self:custom.stage}',
  },
} 