/**
 * Database types supported by Zeiro
 */
export type DatabaseType = 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'DynamoDB' | 'Cassandra' | 'InfluxDB' | 'Elasticsearch'

/**
 * PostgreSQL connection configuration
 */
export interface PostgreSQLConfig {
  host: string
  port: number
  database: string
  schema?: string
}

/**
 * MySQL connection configuration
 */
export interface MySQLConfig {
  host: string
  port: number
  database: string
  ssl?: boolean
}

/**
 * MongoDB connection configuration
 */
export interface MongoDBConfig {
  host: string
  port: number
  database: string
  authSource?: string
  ssl?: boolean
}

/**
 * Redis connection configuration
 */
export interface RedisConfig {
  host: string
  port: number
  database?: number
  ssl?: boolean
}

/**
 * DynamoDB connection configuration
 */
export interface DynamoDBConfig {
  region: string
  endpoint?: string
}

/**
 * Connection configuration union type
 */
export type ConnectionConfig = PostgreSQLConfig | MySQLConfig | MongoDBConfig | RedisConfig | DynamoDBConfig

/**
 * Decrypted credential interface (matches SDK DecryptedCredential)
 */
export interface DecryptedCredential {
  id: string
  user_id: string
  workspace_id: string
  name: string
  type: 'iam_access_keys' | 'service_account_keys' | 'service_principals' | 'connection_details'
  status: 'active' | 'inactive' | 'expired'
  created_at: string
  updated_at: string
  // Decrypted secrets - this is what the agent actually needs
  secrets?: {
    username?: string
    password?: string
    accessKeyId?: string
    secretAccessKey?: string
    connectionString?: string
    [key: string]: any
  }
}

/**
 * DataSource interface that matches SDK's DataSourceWithDecryptedCredential
 * but simplified for agent use
 */
export interface DataSource {
  id: string
  user_id: string
  workspace_id: string
  name: string
  description?: string
  type: DatabaseType
  credential_id: string
  connection_config: ConnectionConfig
  entity_type: string
  creator_id: string
  creator_type: string
  discontinued: boolean
  created_at: string
  updated_at: string
  // Decrypted credential data
  credential: DecryptedCredential | null
}
