import { AWS, handlerPath } from '@zeiro/sdk'

/** 'defineAuthChallenge' sls definition. */
export const definition: AWS.ServerlessLambdaFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      cognitoUserPool: {
        pool: 'zeiro-user-pool-${self:custom.stage}',
        trigger: 'DefineAuthChallenge',
        existing: true,
        forceDeploy: true,
      },
    },
  ],
}
