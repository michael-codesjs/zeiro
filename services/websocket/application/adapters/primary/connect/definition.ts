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
      Action: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Query'],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/zeiro-main-table',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/zeiro-main-table/index/*',
      ],
    },
  ],
}
