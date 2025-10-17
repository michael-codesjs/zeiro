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
      Action: ['dynamodb:UpdateItem', 'dynamodb:Query', 'dynamodb:DeleteItem'],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/zeiro-main-table',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/zeiro-main-table/index/*',
      ],
    },
  ],
}
