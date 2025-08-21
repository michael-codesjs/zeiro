import { AWS } from '@zeiro/sdk'

export const definition: AWS.Function = {
  handler: './src/application/adapters/primary/analyze-data-source/handler.main',
  name: 'zeiro-data-sources-analyze',
  description: 'Perform deep discovery analysis on a DynamoDB data source',
  timeout: 900, // 15 minutes for analysis
  memorySize: 1024,
  events: [
    {
      http: {
        method: 'post',
        path: '/data-sources/{id}/analyze',
        cors: true,
        request: {
          parameters: {
            paths: {
              id: true,
            },
          },
        },
      },
    },
  ],
  environment: {
    DATA_SOURCES_DYNAMODB_TABLE_NAME:
      '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/name}',
    CREDENTIALS_SERVICE_URL: '${self:provider.environment.CREDENTIALS_SERVICE_URL}',
  },
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:GetItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:DescribeTable',
        'dynamodb:ListTables',
      ],
      Resource: '*', // Allow access to any DynamoDB table for analysis
    },
    {
      Effect: 'Allow',
      Action: ['ssm:GetParameter', 'ssm:GetParameters'],
      Resource: [
        'arn:aws:ssm:${self:custom.region}:*:parameter/zeiro/${self:custom.stage}/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: [
        'events:PutEvents',
      ],
      Resource: [
        '${self:provider.environment.CENTRAL_EVENT_BUS_ARN}',
      ],
    },
  ],
} 