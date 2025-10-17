import { DataSource, PostgreSQLConfig } from '../mastra/types';

export const mockPostgresDataSource: DataSource = {
  id: 'mock-datasource-id',
  user_id: 'mock-user-id',
  workspace_id: 'mock-workspace-id',
  name: 'Mock PostgreSQL Database',
  description: 'Mock PostgreSQL database for testing',
  type: 'PostgreSQL',
  credential_id: 'mock-credential-id',
  connection_config: {
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: process.env.POSTGRES_DATABASE,
    ssl: false
  } as PostgreSQLConfig,
  entity_type: 'data-source',
  creator_id: 'mock-user-id',
  creator_type: 'user',
  discontinued: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  credential: {
    id: 'mock-credential-id',
    user_id: 'mock-user-id',
    workspace_id: 'mock-workspace-id',
    name: 'Mock PostgreSQL Credentials',
    type: 'connection_details',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    secrets: {
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
    }
  }
}
