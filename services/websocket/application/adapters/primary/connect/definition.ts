import { AWS, handlerPath } from '@zeiro/sdk'

export const connect: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  description: 'Handle WebSocket $connect route',
  events: [
    {
      websocket: {
        route: '$connect',
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem'],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/websocket/infrastructure/storage/connections-table/arn}',
      ],
    },
  ],
}
