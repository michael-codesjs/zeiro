import { AWS, handlerPath } from '@zeiro/sdk'

// 'createAuthChallenge' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      cognitoUserPool: {
        pool: 'zeiro-user-pool-${self:custom.stage}',
        trigger: 'CreateAuthChallenge',
        existing: true,
        forceDeploy: true,
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'ses:SendEmail',
        'ses:SendRawEmail',
        'sns:Publish',
        'ses:SendTemplatedEmail',
      ],
      Resource: ['*'],
    },
  ],
}
