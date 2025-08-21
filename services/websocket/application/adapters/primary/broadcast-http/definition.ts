import { AWS, handlerPath } from '@zeiro/sdk'

export const broadcastHttp: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  description: 'HTTP endpoint to broadcast WebSocket messages',
  events: [
    {
      http: {
        method: 'post',
        path: '/websocket/broadcast',
        cors: true,
      },
    },
    {
      http: {
        method: 'options',
        path: '/websocket/broadcast',
        cors: true,
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['dynamodb:Query', 'dynamodb:Scan', 'dynamodb:UpdateItem'],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/domain/websocket/infrastructure/storage/connections-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/domain/websocket/infrastructure/storage/connections-table/arn}/index/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: ['execute-api:ManageConnections'],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/websocket/api/execution-arn}/*',
      ],
    },
    {
      Effect: 'Allow',
      Action: ['ssm:GetParameter'],
      Resource: [
        'arn:aws:ssm:${aws:region}:${aws:accountId}:parameter/zeiro/${self:custom.stage}/infrastructure/io/central/websocket/api/stage-url',
      ],
    },
  ],
}
