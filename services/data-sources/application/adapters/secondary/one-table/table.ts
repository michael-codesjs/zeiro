import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
})

export const data_sources_table = new Table({
  name: process.env.DATA_SOURCES_DYNAMODB_TABLE_NAME || 'zeiro-data-sources-table',
  client,
  partial: false,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'pk', sort: 'sk' },
      gs1: { hash: 'gs1pk', sort: 'gs1sk', project: 'all' }, // By data source type
      gs2: { hash: 'gs2pk', sort: 'gs2sk', project: 'all' }, // By user and type
      gs3: { hash: 'gs3pk', sort: 'gs3sk', project: 'all' }, // By user and environment
    },
    models: {
      DataSource: {
        pk: { type: String, value: 'USER#${user_id}' },
        sk: { type: String, value: 'DATA_SOURCE#${id}' },
        gs1pk: { type: String, value: 'DATA_SOURCE#${type}' },
        gs1sk: { type: String, value: '${created_at}' },
        gs2pk: { type: String, value: 'USER#${user_id}#TYPE#${type}' },
        gs2sk: { type: String, value: '${created_at}' },
        gs3pk: { type: String, value: 'USER#${user_id}#ENV#${environment}' },
        gs3sk: { type: String, value: '${created_at}' },
        id: { type: String, required: true },
        user_id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        type: { type: String, required: true },
        status: { type: String, required: true, default: 'disconnected' },
        environment: { type: String, required: true, default: 'development' },
        credential_id: { type: String, required: true },
        connection_config: { type: Object, required: true },
        auto_connect: { type: Boolean, required: true, default: false },
        created_at: { type: String, required: true },
        updated_at: { type: String, required: true },
        last_accessed: { type: String },
        metadata: { type: Object },
      },
    },
    params: {
      isoDates: true,
      timestamps: true,
    },
  },
})
