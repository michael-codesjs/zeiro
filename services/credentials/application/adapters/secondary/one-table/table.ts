import { Table } from 'dynamodb-onetable'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-central-1',
})

export const credentials_table = new Table({
  name: process.env.CREDENTIALS_DYNAMODB_TABLE_NAME || 'zeiro-credentials-table',
  client,
  partial: false,
  schema: {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
      primary: { hash: 'pk', sort: 'sk' },
      gs1: { hash: 'gs1pk', sort: 'gs1sk', project: 'all' },
      gs2: { hash: 'gs2pk', sort: 'gs2sk', project: 'all' },
    },
    models: {
      Credential: {
        pk: { type: String, value: 'USER#${user_id}' },
        sk: { type: String, value: 'CREDENTIAL#${id}' },
        gs1pk: { type: String, value: 'CREDENTIAL#${type}' },
        gs1sk: { type: String, value: '${created_at}' },
        gs2pk: { type: String, value: 'USER#${user_id}#TYPE#${type}' },
        gs2sk: { type: String, value: '${created_at}' },
        id: { type: String, required: true },
        user_id: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        status: { type: String, required: true, default: 'active' },
        account_id: { type: String },
        created_at: { type: String, required: true },
        updated_at: { type: String, required: true },
        last_used: { type: String },
        // AWS specific fields
        access_key_id: { type: String },
        secret_access_key: { type: String }, // Encrypted
        region: { type: String },
        // GCP specific fields
        service_account_key: { type: String }, // Encrypted
        project_id: { type: String },
        // Azure specific fields
        client_id: { type: String },
        client_secret: { type: String }, // Encrypted
        tenant_id: { type: String },
        subscription_id: { type: String },
        // Database specific fields
        host: { type: String },
        port: { type: Number },
        database: { type: String },
        username: { type: String },
        password: { type: String }, // Encrypted
        ssl: { type: Boolean },
      },
    },
    params: {
      isoDates: true,
      timestamps: true,
    },
  },
})
