import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { Table } from 'dynamodb-onetable'
import { Dynamo } from 'dynamodb-onetable/Dynamo'
import { configureEnviromentVariables } from '@zeiro/sdk'

const {
  USERS_DYNAMODB_TABLE_NAME,
  REGION,
} = configureEnviromentVariables()

const client = new Dynamo({
  client: new DynamoDBClient({
    region: REGION || 'eu-central-1',
  }),
})

export const users_table = new Table({
  name: USERS_DYNAMODB_TABLE_NAME,
  client,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'id' },
    },
    models: {},
  },
  partial: true,
})
