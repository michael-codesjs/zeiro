import { IDataSourceAgent, DataSourceAgentConfig } from './base-agent'
import { DynamoDBAgent } from '../dynamodb-agent'
import { MySQLAgent, MySQLAgentConfig } from '../mysql-agent'
import { PostgreSQLAgent, PostgreSQLAgentConfig } from '../postgres-agent'
import { SQLiteAgent, SQLiteAgentConfig } from '../sqlite-agent'

export type DataSourceType = 'dynamodb' | 'postgres' | 'mysql' | 'sqlite'

export interface AgentFactoryConfig extends DataSourceAgentConfig {
  dataSourceType: DataSourceType
}

export class AgentFactory {
  /**
   * Create a data source agent based on the data source type
   */
  static createAgent(config: AgentFactoryConfig | MySQLAgentConfig | PostgreSQLAgentConfig | SQLiteAgentConfig): IDataSourceAgent {
    const dataSourceType = (config as any).dataSourceType || this.inferDataSourceType(config)
    
    switch (dataSourceType) {
      case 'dynamodb':
        return new DynamoDBAgent(config as DataSourceAgentConfig)
      
      case 'postgres':
        return new PostgreSQLAgent(config as PostgreSQLAgentConfig)
      
      case 'mysql':
        return new MySQLAgent(config as MySQLAgentConfig)
      
      case 'sqlite':
        return new SQLiteAgent(config as SQLiteAgentConfig)
      
      default:
        throw new Error(`Unsupported data source type: ${dataSourceType}`)
    }
  }

  /**
   * Infer data source type from config structure
   */
  private static inferDataSourceType(config: any): DataSourceType | null {
    if (config.data_source?.table_name) return 'dynamodb'
    if (config.data_source?.database_path) return 'sqlite'
    if (config.data_source?.database_name && config.credentials?.username) {
      // Could be MySQL or PostgreSQL, need additional context
      return null
    }
    return null
  }

  /**
   * Get supported data source types
   */
  static getSupportedTypes(): DataSourceType[] {
    return ['dynamodb', 'postgres', 'mysql', 'sqlite']
  }

  /**
   * Check if a data source type is supported
   */
  static isSupported(dataSourceType: string): dataSourceType is DataSourceType {
    return this.getSupportedTypes().includes(dataSourceType as DataSourceType)
  }
}
