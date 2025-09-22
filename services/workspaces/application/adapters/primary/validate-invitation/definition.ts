import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: '/invitations/{token}/validate',
        cors: true,
        // No authorizer needed - this is a public endpoint for invitation validation
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:Scan',
        'dynamodb:GetItem',
        'dynamodb:Query',
      ],
      Resource: [
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}',
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/arn}/index/*'
      ]
    }
  ]
}
