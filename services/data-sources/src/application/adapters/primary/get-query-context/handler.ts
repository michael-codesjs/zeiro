import { AWS } from '@zeiro/sdk'
import { dataSources } from '../../secondary/one-table/data-source-model'
import { DeepDiscoveryService } from '../../../services/deep-discovery-service'

// Response schema for structured format
const queryContextResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data_source_id: { type: 'string' },
    data_source_name: { type: 'string' },
    context: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['structured', 'text'] },
        content: { 
          oneOf: [
            { type: 'string' }, // text format
            { type: 'object' }   // structured format
          ]
        },
        last_analyzed: { type: 'string' },
        tables_available: { type: 'array', items: { type: 'string' } }
      }
    },
    analysis_available: { type: 'boolean' },
    message: { type: 'string' }
  },
  required: ['success', 'data_source_id'],
  additionalProperties: false
}

const handler = async (
  event: AWS.APIGatewayProxyEvent,
  context: AWS.LambdaContext
): Promise<AWS.APIGatewayProxyResult> => {
  try {
    // Extract user info and data source ID
    const user_id = event.requestContext.authorizer?.claims?.sub
    const data_source_id = event.pathParameters?.id
    const table_name = event.queryStringParameters?.table_name
    const format = event.queryStringParameters?.format || 'text'

    if (!user_id) {
      return AWS.createErrorResponse(401, 'Unauthorized', 'User not authenticated')
    }

    if (!data_source_id) {
      return AWS.createErrorResponse(400, 'Bad Request', 'Data source ID is required')
    }

    if (format !== 'structured' && format !== 'text') {
      return AWS.createErrorResponse(400, 'Bad Request', 'Format must be either "structured" or "text"')
    }

    // Get the data source
    const dataSource = await dataSources.get({
      pk: `USER#${user_id}`,
      sk: `DATA_SOURCE#${data_source_id}`
    })

    if (!dataSource) {
      return AWS.createErrorResponse(404, 'Not Found', 'Data source not found')
    }

    // Check if deep discovery analysis is available
    const discoveredTables = dataSource.metadata?.discovered_tables || {}
    const tablesAvailable = Object.keys(discoveredTables)
    const analysisAvailable = tablesAvailable.length > 0

    if (!analysisAvailable) {
      return AWS.createSuccessResponse({
        success: true,
        data_source_id,
        data_source_name: dataSource.name,
        context: {
          format,
          content: format === 'text' 
            ? `Data source "${dataSource.name}" has not been analyzed yet. Please run deep discovery analysis first to generate query context.`
            : { message: 'No analysis available', tables: [] },
          last_analyzed: null,
          tables_available: []
        },
        analysis_available: false,
        message: 'No deep discovery analysis available. Run analysis first.'
      }, queryContextResponseSchema)
    }

    // Initialize deep discovery service (no credentials needed for context generation)
    const deepDiscoveryService = new DeepDiscoveryService({
      credentials: { accessKeyId: '', secretAccessKey: '' }, // Not needed for context generation
      region: dataSource.connection_config.region || 'eu-central-1'
    })

    let contextContent: any

    if (format === 'text') {
      // Generate text-based context for query agents
      if (table_name && discoveredTables[table_name]) {
        // Generate context for specific table
        contextContent = generateTableContext(table_name, discoveredTables[table_name], dataSource)
      } else {
        // Generate context for entire data source
        contextContent = deepDiscoveryService.generateQueryContext(dataSource)
      }
    } else {
      // Generate structured context
      if (table_name && discoveredTables[table_name]) {
        // Structured context for specific table
        contextContent = {
          data_source: {
            name: dataSource.name,
            type: dataSource.type,
            region: dataSource.connection_config.region
          },
          table: discoveredTables[table_name],
          query_recommendations: generateQueryRecommendations(discoveredTables[table_name])
        }
      } else {
        // Structured context for entire data source
        contextContent = {
          data_source: {
            name: dataSource.name,
            type: dataSource.type,
            region: dataSource.connection_config.region
          },
          tables: discoveredTables,
          summary: {
            total_tables: tablesAvailable.length,
            last_analyzed: dataSource.metadata?.deep_discovery?.last_analyzed,
            available_tables: tablesAvailable
          }
        }
      }
    }

    const response = {
      success: true,
      data_source_id,
      data_source_name: dataSource.name,
      context: {
        format,
        content: contextContent,
        last_analyzed: dataSource.metadata?.deep_discovery?.last_analyzed,
        tables_available: tablesAvailable
      },
      analysis_available: true,
      message: table_name 
        ? `Query context for table "${table_name}"` 
        : 'Query context for entire data source'
    }

    return AWS.createSuccessResponse(response, queryContextResponseSchema)

  } catch (error) {
    console.error('Get query context error:', error)
    return AWS.createErrorResponse(
      500,
      'Internal Server Error',
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

// Helper function to generate context for a specific table
function generateTableContext(tableName: string, tableInfo: any, dataSource: any): string {
  const context = []
  
  context.push(`DATA SOURCE: ${dataSource.name} (${dataSource.type})`)
  context.push(`REGION: ${dataSource.connection_config.region || 'eu-central-1'}`)
  context.push(`\nTABLE: ${tableName}`)
  context.push(`Description: ${tableInfo.table_description}`)
  context.push(`Primary Key: ${tableInfo.primary_key.partition_key}${tableInfo.primary_key.sort_key ? `, ${tableInfo.primary_key.sort_key}` : ''}`)
  
  if (tableInfo.global_secondary_indexes?.length) {
    context.push(`Indexes: ${tableInfo.global_secondary_indexes.map((gsi: any) => gsi.index_name).join(', ')}`)
  }

  context.push(`\nFields:`)
  tableInfo.discovered_fields.forEach((field: any) => {
    context.push(`  - ${field.name}: ${field.type} (${(field.frequency * 100).toFixed(1)}% frequency) - ${field.description}`)
  })

  context.push(`\nQuery Patterns:`)
  tableInfo.query_patterns.forEach((pattern: any) => {
    context.push(`  - ${pattern}`)
  })

  context.push(`\nOptimal Queries:`)
  tableInfo.optimal_queries.forEach((query: any) => {
    context.push(`  - ${query.use_case}: ${query.example}`)
  })

  return context.join('\n')
}

// Helper function to generate query recommendations
function generateQueryRecommendations(tableInfo: any) {
  const recommendations = []

  // Primary key recommendations
  recommendations.push({
    type: 'GetItem',
    description: 'Use when you know the exact primary key',
    required_fields: [tableInfo.primary_key.partition_key],
    optional_fields: tableInfo.primary_key.sort_key ? [tableInfo.primary_key.sort_key] : [],
    performance: 'Excellent - Single item retrieval'
  })

  recommendations.push({
    type: 'Query',
    description: 'Use when you know the partition key',
    required_fields: [tableInfo.primary_key.partition_key],
    optional_fields: tableInfo.primary_key.sort_key ? [`${tableInfo.primary_key.sort_key} conditions`] : [],
    performance: 'Good - Retrieves multiple items efficiently'
  })

  // GSI recommendations
  if (tableInfo.global_secondary_indexes?.length) {
    tableInfo.global_secondary_indexes.forEach((gsi: any) => {
      recommendations.push({
        type: 'Query with GSI',
        description: `Use ${gsi.index_name} when querying by ${gsi.partition_key}`,
        required_fields: [gsi.partition_key],
        optional_fields: gsi.sort_key ? [`${gsi.sort_key} conditions`] : [],
        performance: 'Good - Efficient with proper key usage',
        index_name: gsi.index_name
      })
    })
  }

  // Filter recommendations based on frequent fields
  const frequentFields = tableInfo.discovered_fields
    .filter((field: any) => field.frequency > 0.8)
    .map((field: any) => field.name)

  if (frequentFields.length > 0) {
    recommendations.push({
      type: 'Scan with Filter',
      description: 'Use for complex queries that cannot use keys',
      recommended_filters: frequentFields,
      performance: 'Lower - Scans entire table, use sparingly',
      note: 'Consider if query can be restructured to use Query operations instead'
    })
  }

  return recommendations
}

export const main = AWS.wrapHandler(handler) 