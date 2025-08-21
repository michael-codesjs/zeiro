import { AWS, handlerPath } from '@zeiro/sdk'

export const defaultRoute: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  description: 'Handle WebSocket $default route (catch-all)',
  events: [
    {
      websocket: {
        route: '$default',
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
