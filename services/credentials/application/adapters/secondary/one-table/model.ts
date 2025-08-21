import { Model } from 'dynamodb-onetable'
import { credentials_table } from './table'
import { Credential } from '@typings/credential'

// Define the credential model
export const credentials = new Model<Credential>(
  credentials_table,
  'Credential',
  {
      fields: {
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
        created_at: { type: String, required: true },
        updated_at: { type: String, required: true },
        last_used: { type: String },
        // AWS specific fields
        account_id: { type: String },
        access_key_id: { type: String },
        secret_access_key: { type: String },
        region: { type: String },
        // GCP specific fields
        service_account_key: { type: String },
        project_id: { type: String },
        // Azure specific fields
        client_id: { type: String },
        client_secret: { type: String },
        tenant_id: { type: String },
        subscription_id: { type: String },
        // Database specific fields
        host: { type: String },
        port: { type: Number },
        database: { type: String },
        username: { type: String },
        password: { type: String },
        ssl: { type: Boolean },
    },
  },
)
