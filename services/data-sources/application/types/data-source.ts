export type DataSourceType = 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB'

export type DataSourceStatus = 'connected' | 'disconnected' | 'error' | 'connecting'

export type DataSourceEnvironment = 'development' | 'staging' | 'production'

export type DataSource = {
  id: string
  user_id: string
  name: string
  description?: string
  type: DataSourceType
  status: DataSourceStatus
  environment: DataSourceEnvironment
  credential_id: string
  connection_config: DataSourceConnectionConfig
  auto_connect: boolean
  created_at: string
  updated_at: string
  last_accessed?: string
  metadata?: DataSourceMetadata
}

export type DataSourceConnectionConfig = {
  // DynamoDB specific
  region?: string
  account_id?: string
  
  // SQL Database specific
  host?: string
  port?: number
  database_name?: string
  ssl?: boolean
  
  // MongoDB specific
  connection_string?: string
  
  // Additional configuration
  timeout?: number
  max_connections?: number
  [key: string]: any
}

export type DataSourceMetadata = {
  table_count?: number
  collection_count?: number
  size_bytes?: number
  last_backup?: string
  version?: string
  [key: string]: any
}

export type CreateDataSourceInput = Omit<DataSource, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_accessed' | 'metadata'>

export type UpdateDataSourceInput = Partial<Pick<DataSource, 'name' | 'description' | 'environment' | 'connection_config' | 'auto_connect'>>

export type DataSourceListQuery = {
  user_id: string
  type?: DataSourceType
  status?: DataSourceStatus
  environment?: DataSourceEnvironment
  page?: number
  limit?: number
}

export type DataSourceTestConnectionInput = {
  data_source_id: string
  user_id: string
}

export type DataSourceTestConnectionResult = {
  success: boolean
  message: string
  metadata?: DataSourceMetadata
} 