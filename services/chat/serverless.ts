import { AWS } from '@zeiro/sdk'
import * as functions from '@adapters/primary'

/** Serverless configuration for the 'chat' service. */
const serverlessConfiguration: AWS.Service = {
  service: 'zeiro-chat',
  frameworkVersion: '3',

  provider: {
    name: 'aws',
    region: 'eu-central-1',
    stage: 'dev',
    runtime: 'nodejs20.x',

    apiGateway: {
      restApiId:
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/id}',
      restApiRootResourceId:
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/root-resource-id}',
      websocketApiId: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/websocket/api/id}',
    },

    environment: {
      CENTRAL_EVENT_BUS_ARN:
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/arn}',
      CENTRAL_EVENT_BUS_NAME:
        '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/event-bus/central/name}',
      CREDENTIALS_SERVICE_URL: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/url}',
      EXECUTIONS_SERVICE_URL: '${ssm:/zeiro/${self:custom.stage}/infrastructure/io/central/api/url}',
      OPENAI_API_KEY: '${ssm:/zeiro/${self:custom.stage}/external/openai/api-key}',
      ANTHROPIC_API_KEY: '${ssm:/zeiro/${self:custom.stage}/external/anthropic/api-key}',
      ZEIRO_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/database/zeiro-table/name}',
      MASTRA_STORAGE_TABLE_NAME: '${ssm:/zeiro/${self:custom.stage}/infrastructure/storage/mastra-single-table/name}',
    },
  },

  package: {
    individually: true,
  },

  plugins: ['serverless-esbuild', 'serverless-iam-roles-per-function'],

  custom: {
    region: '${opt:region, self:provider.region}',
    stage: '${opt:stage, self:provider.stage}',

    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk', '@aws-sdk/*'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 1,
    },
  },

  functions,
}

module.exports = serverlessConfiguration