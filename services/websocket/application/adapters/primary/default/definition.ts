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
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/zeiro-main-table',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/zeiro-main-table/index/*',
      ],
    },
  ],
}
