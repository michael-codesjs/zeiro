import { AWS, handlerPath } from '@zeiro/sdk'

// 'preSignUp' lambda function sls definition.
export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      cognitoUserPool: {
        pool: 'zeiro-user-pool-${self:custom.stage}',
        trigger: 'PreSignUp',
        existing: true,
        forceDeploy: true,
      },
    },
  ],
}
