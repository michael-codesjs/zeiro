import { Model } from 'dynamodb-onetable'
import { data_sources_table } from './table'
import { DataSource } from '@typings/data-source'

// Define the data source model
export const dataSources = new Model<DataSource>(
  data_sources_table,
  'DataSource',
  {
    fields: {
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
) 