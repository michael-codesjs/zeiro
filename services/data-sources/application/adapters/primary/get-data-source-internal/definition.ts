import { AWS, handlerPath } from '@zeiro/sdk'

// 'getDataSourceInternal' lambda function sls definition for internal service-to-service calls
export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Get single data source by ID for internal service use (IAM authorized).',
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        path: '/internal/data-sources/{id}',
        method: 'POST', // Changed from GET to POST to allow request body
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
        authorizer: 'AWS_IAM', // IAM authorization for service-to-service calls
        private: false,
      },
    },
  ],
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
  environment: {
    DATA_SOURCES_DYNAMODB_TABLE_NAME:
      '${ssm:/zeiro/${self:custom.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/name}',
  },
} 