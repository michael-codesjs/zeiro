import { AWS } from '@zeiro/sdk'

export const definition: AWS.Function = {
  handler: './src/application/adapters/primary/get-query-context/handler.main',
  name: 'zeiro-data-sources-get-query-context',
  description: 'Get query context information for a data source to help with query generation',
  timeout: 30,
  memorySize: 256,
  events: [
    {
      http: {
        method: 'get',
        path: '/data-sources/{id}/query-context',
        cors: true,
        request: {
          parameters: {
            paths: {
              id: true,
            },
            querystrings: {
              table_name: false,
              format: false, // 'structured' or 'text'
            },
          },
        },
      },
    },
  ],
  environment: {
    DATA_SOURCES_DYNAMODB_TABLE_NAME:
      '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/name}',
  },
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
} 