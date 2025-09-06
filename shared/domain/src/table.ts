import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { User, Workspace } from './models'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

export const table = new Table({
  name: process.env.ZEIRO_TABLE_NAME,
  client,
  logger: true,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'pk', sort: 'sk' },
      gsi1: { hash: 'GS1PK', sort: 'GS1SK' },
      gsi2: { hash: 'GS2PK', sort: 'GS2SK' },
      gsi3: { hash: 'GS3PK', sort: 'GS3SK' },
    },
    models: {
      User,
      Workspace
    },
  },
})

export const users = table.getModel('User')
export const workspaces = table.getModel('Workspace')