import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: '/invitations/accept',
        cors: true,
        // No authorizer needed - this is called during the sign-up process
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:PutItem',
        'dynamodb:GetItem',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
        'dynamodb:Scan',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*'
      ]
    },
    {
      Effect: 'Allow',
      Action: ['events:PutEvents'],
      Resource: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/arn}'
    }
  ]
}
