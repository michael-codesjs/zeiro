import { AWS, handlerPath } from '@zeiro/sdk'

export const disconnect: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  description: 'Handle WebSocket $disconnect route',
  events: [
    {
      websocket: {
        route: '$disconnect',
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:UpdateItem', 'dynamodb:Query'],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/websocket/infrastructure/storage/connections-table/arn}',
      ],
    },
  ],
}
