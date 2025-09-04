
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AgentFactory } from '../../../mastra/agents/abstracts/agent-factory'
import { ParsedAgentResponse } from '../../../mastra/agents/abstracts/base-agent'
import { IntegrationService } from '../../secondary/integration/services'
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"

interface CognitoContext {
  sub: string
  email: string
  username?: string
}

interface QueryGenerationInput {
  database_id: string
  natural_language_query: string
  thread_id?: string
  use_memory?: boolean
  model?: string
}

interface QueryGenerationResponse {
  success: boolean
  data?: {
    message: string
    suggestChartType: 'Table' | 'Pie' | 'LineGraph' | null
    query_parameters: any | null
    thread_id?: string
  }
  error?: string
}

function getCognitoContext(event: APIGatewayProxyEvent): CognitoContext | null {
  const claims = event.requestContext?.authorizer?.claims
  if (!claims) {
    return null
  }

  return {
    sub: claims.sub,
    email: claims.email,
    username: claims['cognito:username']
  }
}

function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: false,
      error: message
    })
  }
}

function createSuccessResponse(data: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      data
    })
  }
}

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Generate query handler received event:', JSON.stringify(event, null, 2))

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent'
      },
      body: ''
    }
  }

  try {
    // Validate authentication
    const userContext = getCognitoContext(event)
    if (!userContext) {
      return createErrorResponse(401, 'Unauthorized')
    }

    // Parse and validate request body
    if (!event.body) {
      console.log('ERROR: No request body provided')
      return createErrorResponse(400, 'Request body is required')
    }

    console.log('Request body:', event.body)

    let input: QueryGenerationInput
    try {
      input = JSON.parse(event.body)
      console.log('Parsed input:', JSON.stringify(input, null, 2))
    } catch (error) {
      console.log('ERROR: JSON parsing failed:', error)
      return createErrorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!input.database_id) {
      console.log('ERROR: Missing database_id field')
      return createErrorResponse(400, 'database_id is required')
    }
    
    if (!input.natural_language_query) {
      console.log('ERROR: Missing natural_language_query field. Available fields:', Object.keys(input))
      return createErrorResponse(400, 'natural_language_query field is required. Make sure you are sending: {"database_id": "...", "natural_language_query": "your query here"}')
    }

    // Initialize integration service
    const integrationService = new IntegrationService()

    // Get database, credentials, and schema
    console.log('Fetching database with credentials for database_id:', input.database_id, 'user:', userContext.sub)
    const { database, credentials, schema } = await integrationService.getDatabaseWithCredentials(
      input.database_id,
      userContext.sub
    )
    console.log('Database fetched successfully. Table name:', schema.table_name, 'Region:', credentials.region)

    // Determine model to use
    const modelProvider = input.model || process.env.QUERY_AGENT_MODEL || 'gpt-4o-mini'
    let model
    if (modelProvider.startsWith('claude')) {
      model = anthropic(modelProvider)
    } else {
      model = openai(modelProvider)
    }

    // Create data source agent using factory based on database type
    const dataSourceType = database.type.toLowerCase() as 'dynamodb' | 'mysql' | 'postgres' | 'sqlite'
    
    // Build agent config based on database type
    let agentConfig: any = {
      dataSourceType,
      model,
      user_id: userContext.sub
    }

    // Configure based on database type
    switch (dataSourceType) {
      case 'dynamodb':
        agentConfig.data_source = {
          id: input.database_id,
          name: database.name,
          table_name: schema.table_name
        }
        agentConfig.credentials = {
          access_key_id: credentials.accessKeyId,
          secret_access_key: credentials.secretAccessKey,
          session_token: credentials.sessionToken
        }
        agentConfig.region = credentials.region
        break
      
      case 'mysql':
      case 'postgres':
        agentConfig.data_source = {
          id: input.database_id,
          name: database.name,
          database_name: database.connection_config?.database || database.name,
          host: database.connection_config?.host || 'localhost',
          port: database.connection_config?.port
        }
        agentConfig.credentials = {
          username: credentials.accessKeyId, // Assuming access_key_id maps to username
          password: credentials.secretAccessKey // Assuming secret_access_key maps to password
        }
        break
      
      case 'sqlite':
        agentConfig.data_source = {
          id: input.database_id,
          name: database.name,
          database_path: database.connection_config?.path || database.connection_config?.database_path || './database.db'
        }
        // SQLite doesn't need credentials
        break
      
      default:
        throw new Error(`Unsupported database type: ${database.type}`)
    }

    const agent = AgentFactory.createAgent(agentConfig)
    
    // Generate response using the agent
    const result = await agent.generate(input.natural_language_query, {
      threadId: input.thread_id,
    })

    console.log('Agent response:', result)
    console.log('Handler observed threadId:', result.threadId)

    // Parse the JSON response from the agent
    let agentResponse: ParsedAgentResponse
    try {
      agentResponse = JSON.parse(result.text) as ParsedAgentResponse
    } catch (error) {
      console.error('Failed to parse agent response as JSON:', result.text)
      return createErrorResponse(500, 'Agent returned invalid JSON response')
    }

    // Validate the response structure
    if (!agentResponse.message) {
      console.error('Agent response missing required message field:', agentResponse)
      return createErrorResponse(500, 'Agent response missing required fields')
    }

    const responseData = {
      message: agentResponse.message,
      suggestChartType: agentResponse.suggestChartType || null,
      query_parameters: agentResponse.query_parameters || null,
      thread_id: result.threadId
    }

    console.log('Generated query response:', JSON.stringify(responseData, null, 2))

    return createSuccessResponse(responseData)

  } catch (error) {
    console.error('Error in generate query handler:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    if (errorMessage.includes('Database not found')) {
      return createErrorResponse(404, 'Database not found')
    }
    
    if (errorMessage.includes('Unauthorized access')) {
      return createErrorResponse(403, 'Unauthorized access to database')
    }
    
    return createErrorResponse(500, `Internal server error: ${errorMessage}`)
  }
} 