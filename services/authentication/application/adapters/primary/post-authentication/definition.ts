import { AWS, handlerPath } from '@zeiro/sdk'

// 'postAuthentication' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      cognitoUserPool: {
        pool: 'zeiro-user-pool-${self:custom.stage}',
        trigger: 'PostAuthentication',
        existing: true,
        forceDeploy: true,
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['events:putEvents'],
      Resource:
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/arn}',
    },
  ],
  environment: {
    CENTRAL_EVENT_BUS_NAME:
      '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/name}',
  },
}
