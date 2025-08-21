
export const main = (event) => {
  console.log('Generate query handler received event:', event)
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

  return {
    statusCode: 200,
    body: 'Hello, world!'
  }
}

// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// // import { DynamoDBQueryAgent } from '../../../mastra/agents/dynamodb-agent-old'
// import { IntegrationService } from '../../secondary/integration/services'
// import { apiGatewaySignedFetch } from '@zeiro/sdk'

// interface CognitoContext {
//   sub: string
//   email: string
//   username?: string
// }

// interface QueryGenerationInput {
//   database_id: string
//   natural_language_query: string
//   thread_id?: string
//   use_memory?: boolean
//   model?: string
// }

// interface QueryGenerationResponse {
//   success: boolean
//   data?: {
//     response_type: 'query' | 'conversation'
    
//     // For query responses
//     query_id?: string
//     operation?: string
//     parameters?: any
//     requiresApproval?: boolean
//     estimatedExecutionTime?: number
//     websocket_url?: string
//     status?: 'pending'
//     execution_url?: string
    
//     // For conversation responses
//     conversation_response?: string
    
//     // Common fields
//     explanation?: string
//     suggestedChartType?: string
//     title?: string
//     fieldValidation?: {
//       valid: boolean
//       availableFields?: string[]
//       message?: string
//     }
//     thread_id?: string
//     suggestions?: string[]
//   }
//   error?: string
// }

// function generateThreadMetadata(query: string, databaseId: string, tableName: string) {
//   return {
//     query_type: 'natural_language',
//     database_id: databaseId,
//     table_name: tableName,
//     initial_query: query,
//     created_via: 'generate_endpoint'
//   }
// }

// function getCognitoContext(event: APIGatewayProxyEvent): CognitoContext | null {
//   const claims = event.requestContext?.authorizer?.claims
//   if (!claims) {
//     return null
//   }

//   return {
//     sub: claims.sub,
//     email: claims.email,
//     username: claims['cognito:username']
//   }
// }

// function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
//   return {
//     statusCode,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       success: false,
//       error: message
//     })
//   }
// }

// function createSuccessResponse(data: any): APIGatewayProxyResult {
//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       success: true,
//       data
//     })
//   }
// }

// export const main = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   console.log('Generate query handler received event:', JSON.stringify(event, null, 2))

//   // Handle OPTIONS preflight request
//   if (event.httpMethod === 'OPTIONS') {
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent'
//       },
//       body: ''
//     }
//   }

//   try {
//     // Validate authentication
//     const userContext = getCognitoContext(event)
//     if (!userContext) {
//       return createErrorResponse(401, 'Unauthorized')
//     }

//     // Parse and validate request body
//     if (!event.body) {
//       console.log('ERROR: No request body provided')
//       return createErrorResponse(400, 'Request body is required')
//     }

//     console.log('Request body:', event.body)

//     let input: QueryGenerationInput
//     try {
//       input = JSON.parse(event.body)
//       console.log('Parsed input:', JSON.stringify(input, null, 2))
//     } catch (error) {
//       console.log('ERROR: JSON parsing failed:', error)
//       return createErrorResponse(400, 'Invalid JSON in request body')
//     }

//     // Validate required fields
//     if (!input.database_id) {
//       console.log('ERROR: Missing database_id field')
//       return createErrorResponse(400, 'database_id is required')
//     }
    
//     if (!input.natural_language_query) {
//       console.log('ERROR: Missing natural_language_query field. Available fields:', Object.keys(input))
//       return createErrorResponse(400, 'natural_language_query field is required. Make sure you are sending: {"database_id": "...", "natural_language_query": "your query here"}')
//     }

//     // Initialize integration service
//     const integrationService = new IntegrationService()

//     // Get database, credentials, and schema
//     console.log('Fetching database with credentials for database_id:', input.database_id, 'user:', userContext.sub)
//     const { database, credentials, schema } = await integrationService.getDatabaseWithCredentials(
//       input.database_id,
//       userContext.sub
//     )
//     console.log('Database fetched successfully. Table name:', schema.table_name, 'Region:', credentials.region)

//     // Use memory by default, allow opt-out with use_memory: false
//     const useMemory = input.use_memory !== false;
    
//     let threadId: string | undefined;

//     // // Create a QueryAgent instance with memory enabled by default
//     // const queryAgent = new DynamoDBQueryAgent({
//     //   credentials: {
//     //     accessKeyId: credentials.accessKeyId,
//     //     secretAccessKey: credentials.secretAccessKey,
//     //     sessionToken: credentials.sessionToken
//     //   },
//     //   region: credentials.region,
//     //   database: {
//     //     id: input.database_id,
//     //     name: database.name
//     //   },
//     //   table_name: schema.table_name,
//     //   model: input.model || (process.env.QUERY_AGENT_MODEL as any) || 'gpt-4o-mini',
//     // })

//     // Create or use existing thread
//     if (input.thread_id) {
//       await queryAgent.setThread(input.thread_id);
//       threadId = input.thread_id;
//     } else if (useMemory) {
//       const generatedTitle = await queryAgent.generateSmartTitle(input.natural_language_query);
//       const threadMetadata = generateThreadMetadata(input.natural_language_query, input.database_id, schema.table_name);
      
//       threadId = await queryAgent.createThread(generatedTitle, threadMetadata);
//       if (!threadId) {
//         console.warn('Failed to create thread, proceeding without memory');
//       }
//     }

//     // Generate query parameters using the AI agent
//     const result = await queryAgent.generateQuery(input.natural_language_query, {
//       threadId: threadId
//     });

//     // If it's a conversational response, return it directly
//     if (result.response_type === 'conversation') {
//       return createSuccessResponse({
//         response_type: 'conversation',
//         conversation_response: result.response,
//         thread_id: threadId,
//         suggestions: result.suggestions
//       })
//     }

//     // For query responses, prepare the response with execution URL
//     const executionUrl = `${process.env.EXECUTIONS_SERVICE_URL}/executions/execute`
    
//     const responseData = {
//       response_type: 'query' as const,
//       query_id: result.query_id,
//       operation: result.operation,
//       parameters: result.parameters,
//       requiresApproval: result.requiresApproval,
//       estimatedExecutionTime: result.estimatedExecutionTime,
//       execution_url: executionUrl,
//       status: 'pending' as const,
//       explanation: result.explanation,
//       suggestedChartType: result.suggestedChartType,
//       title: result.title,
//       thread_id: threadId,
//       fieldValidation: result.fieldValidation
//     }

//     console.log('Generated query response:', JSON.stringify(responseData, null, 2))

//     return createSuccessResponse(responseData)

//   } catch (error) {
//     console.error('Error in generate query handler:', error)
    
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
//     if (errorMessage.includes('Database not found')) {
//       return createErrorResponse(404, 'Database not found')
//     }
    
//     if (errorMessage.includes('Unauthorized access')) {
//       return createErrorResponse(403, 'Unauthorized access to database')
//     }
    
//     return createErrorResponse(500, `Internal server error: ${errorMessage}`)
//   }
// } 