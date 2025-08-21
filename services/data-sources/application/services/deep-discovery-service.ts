import { DynamoDBDeepDiscoveryAgent, DiscoveredTableInfo } from '../mastra/agents/dynamodb-deep-discovery-agent'
import { dataSources } from '../adapters/secondary/one-table/data-source-model'
import { DataSource } from '../types/data-source'

export type DeepDiscoveryServiceConfig = {
  credentials: {
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  region?: string
  model?: string
}

export type AnalysisResult = {
  data_source_id: string
  table_name: string
  discovered_info: DiscoveredTableInfo
  analysis_timestamp: string
  status: 'success' | 'failed'
  error?: string
}

export class DeepDiscoveryService {
  private agent: DynamoDBDeepDiscoveryAgent

  constructor(config: DeepDiscoveryServiceConfig) {
    this.agent = new DynamoDBDeepDiscoveryAgent(config)
  }

  // Analyze a specific table for a data source
  async analyzeTable(
    dataSource: DataSource, 
    tableName: string, 
    sampleSize: number = 100
  ): Promise<AnalysisResult> {
    try {
      // Perform the deep discovery analysis
      const discoveredInfo = await this.agent.discoverTable(tableName, sampleSize)

      // Update the data source metadata with the discovered information
      await this.updateDataSourceMetadata(dataSource, tableName, discoveredInfo)

      return {
        data_source_id: dataSource.id,
        table_name: tableName,
        discovered_info: discoveredInfo,
        analysis_timestamp: new Date().toISOString(),
        status: 'success'
      }

    } catch (error) {
      console.error(`Deep discovery failed for table ${tableName}:`, error)
      
      return {
        data_source_id: dataSource.id,
        table_name: tableName,
        discovered_info: {} as DiscoveredTableInfo,
        analysis_timestamp: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Analyze all tables in a DynamoDB data source
  async analyzeDataSource(dataSource: DataSource, sampleSize: number = 100): Promise<AnalysisResult[]> {
    if (dataSource.type !== 'DynamoDB') {
      throw new Error('Deep discovery is only supported for DynamoDB data sources')
    }

    try {
      // Get list of tables
      const tables = await this.agent.listTables()
      
      // Analyze each table
      const results: AnalysisResult[] = []
      
      for (const tableName of tables) {
        // Skip excluded tables if configured
        if (dataSource.deep_discovery_config?.excluded_tables?.includes(tableName)) {
          continue
        }

        const result = await this.analyzeTable(dataSource, tableName, sampleSize)
        results.push(result)
      }

      // Update overall data source metadata
      await this.updateDataSourceAnalysisMetadata(dataSource, results)

      return results

    } catch (error) {
      console.error(`Failed to analyze data source ${dataSource.id}:`, error)
      throw error
    }
  }

  // Update data source metadata with discovered table information
  private async updateDataSourceMetadata(
    dataSource: DataSource, 
    tableName: string, 
    discoveredInfo: DiscoveredTableInfo
  ) {
    try {
      const currentMetadata = dataSource.metadata || {}
      const discoveredTables = currentMetadata.discovered_tables || {}

      // Store the discovered information for this table
      discoveredTables[tableName] = {
        ...discoveredInfo,
        last_analyzed: new Date().toISOString()
      }

      // Update the data source
      await dataSources.update(
        {
          pk: `USER#${dataSource.user_id}`,
          sk: `DATA_SOURCE#${dataSource.id}`
        },
        {
          metadata: {
            ...currentMetadata,
            discovered_tables: discoveredTables,
            deep_discovery: {
              ...currentMetadata.deep_discovery,
              last_analyzed: new Date().toISOString(),
              tables_analyzed: [
                ...(currentMetadata.deep_discovery?.tables_analyzed || []),
                tableName
              ].filter((table, index, arr) => arr.indexOf(table) === index) // Remove duplicates
            }
          },
          updated_at: new Date().toISOString()
        }
      )

    } catch (error) {
      console.error('Failed to update data source metadata:', error)
      throw error
    }
  }

  // Update overall analysis metadata for the data source
  private async updateDataSourceAnalysisMetadata(
    dataSource: DataSource, 
    results: AnalysisResult[]
  ) {
    try {
      const successfulAnalyses = results.filter(r => r.status === 'success')
      const failedAnalyses = results.filter(r => r.status === 'failed')

      const currentMetadata = dataSource.metadata || {}

      await dataSources.update(
        {
          pk: `USER#${dataSource.user_id}`,
          sk: `DATA_SOURCE#${dataSource.id}`
        },
        {
          metadata: {
            ...currentMetadata,
            deep_discovery: {
              last_analyzed: new Date().toISOString(),
              tables_analyzed: successfulAnalyses.map(r => r.table_name),
              total_tables_discovered: successfulAnalyses.length,
              failed_analyses: failedAnalyses.length,
              analysis_summary: {
                successful: successfulAnalyses.length,
                failed: failedAnalyses.length,
                total: results.length
              }
            }
          },
          updated_at: new Date().toISOString()
        }
      )

    } catch (error) {
      console.error('Failed to update analysis metadata:', error)
      throw error
    }
  }

  // Get discovered information for a specific table
  async getTableDiscoveryInfo(dataSource: DataSource, tableName: string): Promise<DiscoveredTableInfo | null> {
    const discoveredTables = dataSource.metadata?.discovered_tables
    if (!discoveredTables || !discoveredTables[tableName]) {
      return null
    }

    return discoveredTables[tableName]
  }

  // Get all discovered tables for a data source
  getDiscoveredTables(dataSource: DataSource): Record<string, DiscoveredTableInfo> {
    return dataSource.metadata?.discovered_tables || {}
  }

  // Generate query context that can be used by query agents
  generateQueryContext(dataSource: DataSource): string {
    const discoveredTables = this.getDiscoveredTables(dataSource)
    
    if (Object.keys(discoveredTables).length === 0) {
      return `Data source ${dataSource.name} has not been analyzed yet. Run deep discovery first.`
    }

    const context = [`DATA SOURCE: ${dataSource.name} (${dataSource.type})`]
    
    Object.entries(discoveredTables).forEach(([tableName, info]) => {
      context.push(`\nTABLE: ${tableName}`)
      context.push(`Description: ${info.table_description}`)
      context.push(`Primary Key: ${info.primary_key.partition_key}${info.primary_key.sort_key ? `, ${info.primary_key.sort_key}` : ''}`)
      
      if (info.global_secondary_indexes?.length) {
        context.push(`Indexes: ${info.global_secondary_indexes.map(gsi => gsi.index_name).join(', ')}`)
      }

      context.push(`Fields:`)
      info.discovered_fields.forEach(field => {
        context.push(`  - ${field.name}: ${field.type} (${(field.frequency * 100).toFixed(1)}% frequency) - ${field.description}`)
      })

      context.push(`Query Patterns:`)
      info.query_patterns.forEach(pattern => {
        context.push(`  - ${pattern}`)
      })

      context.push(`Optimal Queries:`)
      info.optimal_queries.forEach(query => {
        context.push(`  - ${query.use_case}: ${query.example}`)
      })
    })

    return context.join('\n')
  }

  // Check if a data source needs analysis
  shouldAnalyze(dataSource: DataSource): boolean {
    if (!dataSource.deep_discovery_enabled) {
      return false
    }

    const config = dataSource.deep_discovery_config
    if (!config || config.analysis_schedule === 'manual') {
      return false
    }

    const lastAnalyzed = dataSource.metadata?.deep_discovery?.last_analyzed
    if (!lastAnalyzed) {
      return true // Never analyzed
    }

    const lastAnalyzedDate = new Date(lastAnalyzed)
    const now = new Date()
    const daysSinceAnalysis = (now.getTime() - lastAnalyzedDate.getTime()) / (1000 * 60 * 60 * 24)

    switch (config.analysis_schedule) {
      case 'daily':
        return daysSinceAnalysis >= 1
      case 'weekly':
        return daysSinceAnalysis >= 7
      case 'monthly':
        return daysSinceAnalysis >= 30
      default:
        return false
    }
  }
} 