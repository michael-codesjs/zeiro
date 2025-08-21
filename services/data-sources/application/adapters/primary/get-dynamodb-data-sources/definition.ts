import { AWS, handlerPath } from '@zeiro/sdk'

export const definition: AWS.ServerlessLambdaFunction = {
  description: 'Discover DynamoDB tables using credentials lambda function/adapter.',
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 30, // Increased timeout for DynamoDB API calls
  events: [
    {
      http: {
        method: 'post',
        path: '/data-sources/discover/dynamodb',
        cors: {
          origin: '*',
          headers: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
            'X-Amz-Security-Token',
            'X-Amz-User-Agent'
          ],
          allowCredentials: false
        },
        authorizer: {
          name: 'CognitoAuthorizerDataSources',
          type: 'COGNITO_USER_POOLS',
          arn: '${ssm:/zeiro/${self:custom.stage}/infrastructure/authentication/user-pool/arn}',
        },
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:ListTables',
        'dynamodb:DescribeTable',
      ],
      Resource: '*', // Needed to discover tables in external accounts
    },
    {
        Effect: 'Allow',
        Action: ['execute-api:Invoke'],
        Resource: ['*'],
    },
  ],
} 