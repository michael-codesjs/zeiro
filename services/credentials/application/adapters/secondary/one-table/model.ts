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
        // AWS Access Keys specific fields
        account_id: { type: String },
        access_key_id: { type: String },
        secret_access_key: { type: String },
        region: { type: String },
        // Database Connection specific fields
        host: { type: String },
        port: { type: Number },
        database_name: { type: String },
        username: { type: String },
        password: { type: String },
        ssl_enabled: { type: Boolean },
    },
  },
)
