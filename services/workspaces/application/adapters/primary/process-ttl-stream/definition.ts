import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/stream-arn}',
        batchSize: 10,
        startingPosition: 'LATEST',
        filterPatterns: [
          {
            eventName: ['REMOVE'],
            dynamodb: {
              Keys: {
                PK: {
                  S: [{ prefix: 'INVITATION_REMINDER#' }]
                }
              }
            }
          }
        ]
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:DescribeStream',
        'dynamodb:GetRecords',
        'dynamodb:GetShardIterator',
        'dynamodb:ListStreams',
        'dynamodb:GetItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/stream-arn}'
      ]
    },
    {
      Effect: 'Allow',
      Action: ['events:PutEvents'],
      Resource: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/arn}'
    }
  ]
}
