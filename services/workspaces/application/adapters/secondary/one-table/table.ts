import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
})

export const workspaces_table = new Table({
  name: process.env.ZEIRO_TABLE_NAME || 'zeiro-dev-table',
  client,
  partial: false,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'pk', sort: 'sk' },
      gsi1: { hash: 'gsi1pk', sort: 'gsi1sk', project: 'all' },
      gsi2: { hash: 'gsi2pk', sort: 'gsi2sk', project: 'all' },
      gsi3: { hash: 'gsi3pk', sort: 'gsi3sk', project: 'all' },
    },
    models: {
      Workspace: {
        pk: { type: String, value: 'WORKSPACE#${id}' },
        sk: { type: String, value: 'WORKSPACE#${id}' },
        gsi1pk: { type: String, value: 'USER#${creator_id}' },
        gsi1sk: { type: String, value: 'WORKSPACE#${created_at}' },
        id: { type: String, required: true },
        creator_id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        created_at: { type: String, required: true },
        updated_at: { type: String, required: true },
        discontinued: { type: Boolean, default: false },
        metadata: { type: Object },
      },
      WorkspaceMembership: {
        pk: { type: String, value: 'WORKSPACE#${workspace_id}' },
        sk: { type: String, value: 'USER#${user_id}' },
        gsi1pk: { type: String, value: 'USER#${user_id}' },
        gsi1sk: { type: String, value: 'WORKSPACE#${workspace_id}' },
        id: { type: String, required: true },
        workspace_id: { type: String, required: true },
        user_id: { type: String, required: true },
        role: { type: String, required: true },
        status: { type: String, required: true, default: 'active' },
        invited_by: { type: String },
        invited_at: { type: String },
        joined_at: { type: String },
        created_at: { type: String, required: true },
        updated_at: { type: String, required: true },
        discontinued: { type: Boolean, default: false },
        permissions: { type: Object },
        metadata: { type: Object },
      },
    },
    params: {
      isoDates: true,
      timestamps: true,
    },
  },
})