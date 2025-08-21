import { AWS } from '@zeiro/sdk'
import { dataSources } from '../../secondary/one-table/data-source-model'
import { DeepDiscoveryService, AnalysisResult } from '../../../services/deep-discovery-service'

// Input validation schema
const analyzeDataSourceInputSchema = {
  type: 'object',
  properties: {
    table_name: {
      type: 'string',
      description: 'Specific table to analyze (optional - analyzes all tables if not provided)'
    },
    sample_size: {
      type: 'integer',
      minimum: 10,
      maximum: 1000,
      default: 100,
      description: 'Number of sample items to fetch for analysis'
    },
    enable_deep_discovery: {
      type: 'boolean',
      default: false,
      description: 'Whether to enable automatic deep discovery for this data source'
    },
    deep_discovery_config: {
      type: 'object',
      properties: {
        auto_analyze_new_tables: { type: 'boolean', default: false },
        analysis_schedule: { 
          type: 'string', 
          enum: ['manual', 'daily', 'weekly', 'monthly'],
          default: 'manual'
        },
        excluded_tables: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  },
  additionalProperties: false
}

// Response schema
const analyzeDataSourceResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data_source_id: { type: 'string' },
    analysis_results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          table_name: { type: 'string' },
          status: { type: 'string', enum: ['success', 'failed'] },
          discovered_info: { type: 'object' },
          error: { type: 'string' }
        }
      }
    },
    query_context: { type: 'string' },
    analysis_timestamp: { type: 'string' },
    tables_analyzed: { type: 'integer' },
    tables_failed: { type: 'integer' }
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

    if (!user_id) {
      return AWS.createErrorResponse(401, 'Unauthorized', 'User not authenticated')
    }

    if (!data_source_id) {
      return AWS.createErrorResponse(400, 'Bad Request', 'Data source ID is required')
    }

    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {}
    
    // Validate input
    const validation = AWS.validateInput(body, analyzeDataSourceInputSchema)
    if (!validation.isValid) {
      return AWS.createErrorResponse(400, 'Validation Error', validation.errors.join(', '))
    }

    const {
      table_name,
      sample_size = 100,
      enable_deep_discovery = false,
      deep_discovery_config
    } = body

    // Get the data source
    const dataSource = await dataSources.get({
      pk: `USER#${user_id}`,
      sk: `DATA_SOURCE#${data_source_id}`
    })

    if (!dataSource) {
      return AWS.createErrorResponse(404, 'Not Found', 'Data source not found')
    }

    // Verify it's a DynamoDB data source
    if (dataSource.type !== 'DynamoDB') {
      return AWS.createErrorResponse(400, 'Bad Request', 'Deep discovery analysis is only available for DynamoDB data sources')
    }

    // Get credentials for the data source
    const credentialsResponse = await fetch(
      `${process.env.CREDENTIALS_SERVICE_URL}/credentials/${dataSource.credential_id}`,
      {
        headers: {
          'Authorization': event.headers.Authorization || '',
          'Content-Type': 'application/json'
        }
      }
    )

    if (!credentialsResponse.ok) {
      return AWS.createErrorResponse(400, 'Credentials Error', 'Failed to retrieve credentials for data source')
    }

    const credentials = await credentialsResponse.json()

    // Initialize the deep discovery service
    const deepDiscoveryService = new DeepDiscoveryService({
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
        sessionToken: credentials.session_token
      },
      region: dataSource.connection_config.region || 'eu-central-1',
      model: 'gpt-4o' // Could be configurable
    })

    let analysisResults: AnalysisResult[]

    // Perform analysis
    if (table_name) {
      // Analyze specific table
      const result = await deepDiscoveryService.analyzeTable(dataSource, table_name, sample_size)
      analysisResults = [result]
    } else {
      // Analyze all tables in the data source
      analysisResults = await deepDiscoveryService.analyzeDataSource(dataSource, sample_size)
    }

    // Update deep discovery settings if requested
    if (enable_deep_discovery) {
      const updateData: any = {
        deep_discovery_enabled: true,
        updated_at: new Date().toISOString()
      }

      if (deep_discovery_config) {
        updateData.deep_discovery_config = {
          sample_size,
          include_documentation: true,
          generate_rag_content: true,
          ...deep_discovery_config
        }
      }

      await dataSources.update(
        {
          pk: `USER#${user_id}`,
          sk: `DATA_SOURCE#${data_source_id}`
        },
        updateData
      )
    }

    // Get updated data source for context generation
    const updatedDataSource = await dataSources.get({
      pk: `USER#${user_id}`,
      sk: `DATA_SOURCE#${data_source_id}`
    })

    // Generate query context from the analysis
    const queryContext = deepDiscoveryService.generateQueryContext(updatedDataSource!)

    // Publish event for analysis completion
    const successfulAnalyses = analysisResults.filter(r => r.status === 'success')
    if (successfulAnalyses.length > 0) {
      await AWS.publishEvent({
        eventBusName: process.env.CENTRAL_EVENT_BUS_NAME!,
        source: 'zeiro.data-sources',
        detailType: 'Deep Discovery Analysis Completed',
        detail: {
          user_id,
          data_source_id,
          tables_analyzed: successfulAnalyses.map(r => r.table_name),
          analysis_timestamp: new Date().toISOString(),
          total_tables: analysisResults.length,
          successful_tables: successfulAnalyses.length
        }
      })
    }

    // Return the analysis results
    const response = {
      success: true,
      data_source_id,
      analysis_results: analysisResults.map(result => ({
        table_name: result.table_name,
        status: result.status,
        discovered_info: result.status === 'success' ? result.discovered_info : undefined,
        error: result.error
      })),
      query_context: queryContext,
      analysis_timestamp: new Date().toISOString(),
      tables_analyzed: analysisResults.filter(r => r.status === 'success').length,
      tables_failed: analysisResults.filter(r => r.status === 'failed').length
    }

    return AWS.createSuccessResponse(response, analyzeDataSourceResponseSchema)

  } catch (error) {
    console.error('Data source analysis error:', error)
    return AWS.createErrorResponse(
      500,
      'Internal Server Error',
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

export const main = AWS.wrapHandler(handler) 