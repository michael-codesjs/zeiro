export const main = (event) => {

  console.log('Manage threads handler received event:', event)
}
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// // import { getCognitoContext } from '@zeiro/sdk'
// import { DynamoDBQueryAgent } from '../../../mastra/agents/dynamodb-agent-old'
// import { IntegrationService } from '../../secondary/integration/services'

// // Cognito integration
// interface CognitoContext {
//   sub: string
//   email: string
//   username?: string
// }

// interface ThreadManagementInput {
//   action: 'create' | 'list' | 'get' | 'delete' | 'update'
//   thread_id?: string
//   resource_id?: string
//   database_id: string // Required for all operations to maintain database-scoped conversations
//   title?: string // For create and update operations
//   metadata?: Record<string, unknown> // For create and update operations
// }

// interface ThreadManagementResponse {
//   success: boolean
//   data?: {
//     thread_id?: string
//     threads?: any[]
//     thread?: any
//     message?: string
//   }
//   error?: string
// }

// export const main = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   console.log('Thread management handler received event:', JSON.stringify(event, null, 2))

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

//     let input: ThreadManagementInput
//     try {
//       input = JSON.parse(event.body)
//       console.log('Parsed input:', JSON.stringify(input, null, 2))
//     } catch (error) {
//       console.log('ERROR: JSON parsing failed:', error)
//       return createErrorResponse(400, 'Invalid JSON in request body')
//     }

//     // Validate required fields
//     if (!input.action) {
//       return createErrorResponse(400, 'action is required')
//     }

//     // All operations now require database_id for consistency
//     if (!input.database_id) {
//       return createErrorResponse(400, 'database_id is required for all thread operations')
//     }

//     // For database-specific operations, we need database_id to get credentials
//     let queryAgent: DynamoDBQueryAgent | null = null;
//     let database: any = null;
//     let credentials: any = null;
//     let schema: any = null;
    
//     if (['create', 'get', 'list', 'update'].includes(input.action)) {
//       // Initialize integration service
//       const integrationService = new IntegrationService()

//       // Get database, credentials, and schema
//       const result = await integrationService.getDatabaseWithCredentials(
//         input.database_id,
//         userContext.sub
//       )
//       database = result.database;
//       credentials = result.credentials;
//       schema = result.schema;

//       // Create a DynamoDBQueryAgent instance
//       queryAgent = new DynamoDBQueryAgent({
//         credentials: {
//           accessKeyId: credentials.accessKeyId,
//           secretAccessKey: credentials.secretAccessKey,
//           sessionToken: credentials.sessionToken
//         },
//         region: credentials.region,
//         table_name: schema.table_name,
//         model: 'gpt-4o-mini', // Default model for thread management
//         database: {
//           id: input.database_id,
//           name: database.name
//         }
//       })
//     }

//     let response: ThreadManagementResponse;

//     switch (input.action) {
//       case 'create':
//         if (!queryAgent) {
//           return createErrorResponse(400, 'database_id is required for creating threads')
//         }
        
//         // Use Mastra's memory directly to create thread
//         const memory = queryAgent.getMemory();
//         if (!memory) {
//           return createErrorResponse(500, 'Memory not available for thread creation')
//         }
        
//         const threadOptions: any = {
//           resourceId: input.database_id
//         };
        
//         if (input.title) {
//           threadOptions.title = input.title;
//         }
        
//         threadOptions.metadata = {
//           database_id: input.database_id,
//           table_name: schema.table_name,
//           createdAt: new Date().toISOString(),
//           ...input.metadata
//         };
        
//         const thread = await memory.createThread(threadOptions);
        
//         response = {
//           success: true,
//           data: {
//             thread_id: thread.id,
//             message: 'Thread created successfully'
//           }
//         };
//         break;

//       case 'list':
//         if (!queryAgent) {
//           throw new Error('QueryAgent should have been initialized for list action')
//         }
        
//         // Use Mastra's memory directly to get threads
//         const listMemory = queryAgent.getMemory();
//         if (!listMemory) {
//           return createErrorResponse(500, 'Memory not available for thread listing')
//         }
        
//         const threads = await listMemory.getThreadsByResourceId({ resourceId: input.database_id });
        
//         // Transform threads to match expected format
//         const transformedThreads = threads.map(thread => ({
//           id: thread.id,
//           title: thread.title || 'Untitled Conversation',
//           created_at: thread.createdAt,
//           updated_at: thread.updatedAt,
//           database_id: thread.metadata?.database_id || input.database_id,
//           table_name: thread.metadata?.table_name,
//           metadata: thread.metadata || {},
//           message_count: 0 // Not available from thread object
//         }));
        
//         response = {
//           success: true,
//           data: {
//             threads: transformedThreads,
//             message: `Found ${transformedThreads.length} threads`
//           }
//         };
//         break;

//       case 'get':
//         if (!input.thread_id) {
//           return createErrorResponse(400, 'thread_id is required for getting thread details')
//         }
        
//         if (!queryAgent) {
//           throw new Error('QueryAgent should have been initialized for get action')
//         }
        
//         // Use Mastra's memory directly to get thread
//         const getMemory = queryAgent.getMemory();
//         if (!getMemory) {
//           return createErrorResponse(500, 'Memory not available for thread retrieval')
//         }
        
//         const threadData = await getMemory.getThreadById({ threadId: input.thread_id });
        
//         // Transform thread to match expected format
//         const transformedThread = {
//           ...threadData,
//           title: threadData.title || 'Untitled Conversation',
//           metadata: threadData.metadata || {},
//           database_id: threadData.metadata?.database_id || input.database_id,
//           table_name: threadData.metadata?.table_name
//         };
        
//         response = {
//           success: true,
//           data: {
//             thread: transformedThread,
//             message: 'Thread retrieved successfully'
//           }
//         };
//         break;

//       case 'update':
//         if (!input.thread_id) {
//           return createErrorResponse(400, 'thread_id is required for updating thread')
//         }
        
//         if (!input.title) {
//           return createErrorResponse(400, 'title is required for updating thread')
//         }
        
//         if (!queryAgent) {
//           throw new Error('QueryAgent should have been initialized for update action')
//         }
        
//         // Update the thread title using the query agent
//         await queryAgent.updateThreadTitle(input.thread_id, input.title);
        
//         response = {
//           success: true,
//           data: {
//             thread_id: input.thread_id,
//             message: 'Thread title updated successfully'
//           }
//         };
//         break;

//       default:
//         return createErrorResponse(400, `Unsupported action: ${input.action}`)
//     }

//     return createSuccessResponse(response)

//   } catch (error) {
//     console.error('Thread management handler error:', error)
    
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
//     return createErrorResponse(500, errorMessage)
//   }
// }

// function createSuccessResponse(data: any): APIGatewayProxyResult {
//   return {
//     statusCode: 200,
//     headers: {
//       'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
//       'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
//     },
//     body: JSON.stringify(data)
//   }
// }

// function getCognitoContext(event: APIGatewayProxyEvent): CognitoContext | null {
//   try {
//     const claims = event.requestContext.authorizer?.claims
//     if (!claims) {
//       console.log('No claims found in request context')
//       return null
//     }

//     return {
//       sub: claims.sub,
//       email: claims.email,
//       username: claims.preferred_username || claims.username
//     }
//   } catch (error) {
//     console.error('Error extracting Cognito context:', error)
//     return null
//   }
// }

// function createErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
//   return {
//     statusCode,
//     headers: {
//       'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
//       'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT'
//     },
//     body: JSON.stringify({
//       success: false,
//       error: message
//     })
//   }
// } 