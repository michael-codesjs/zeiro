import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials } from '@zeiro/domain'
import { CredentialListResponse } from '@typings/credential'
import { validateAuthenticatedUser } from '@zeiro/sdk'

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // Validate authenticated user using SDK utility
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub
    const user = await validateAuthenticatedUser(cognito_user_id)

    // Extract query parameters
    const queryParams = event.queryStringParameters || {}
    const type = queryParams.type as 'aws_access_keys' | 'database_connection' | undefined
    const page = parseInt(queryParams.page || '1', 10)
    const limit = parseInt(queryParams.limit || '10', 10)
    
    // Query credentials by workspace
    let result
    if (type) {
      // Filter by type using byType index
      result = await credentials.query.byType({
        workspace_id: user.workspace_id,
        type: type
      }).go()
    } else {
      // Get all credentials in workspace using byWorkspace index
      result = await credentials.query.byWorkspace({
        workspace_id: user.workspace_id
      }).go()
    }
    
    const all_credentials = result.data || []
    
    // Apply pagination
    const start_index = (page - 1) * limit
    const end_index = start_index + limit
    const paginated_credentials = all_credentials.slice(start_index, end_index)
    
    // Mask sensitive fields in response for security
    const masked_credentials = paginated_credentials.map((credential) => {
      const masked = { ...credential } as any
      
      // Mask all sensitive fields
      if (masked.secret_access_key) masked.secret_access_key = '<MASKED>'
      if (masked.password) masked.password = '<MASKED>'
      
      return masked
    })
    
    const response: CredentialListResponse = {
      credentials: masked_credentials,
      total: all_credentials.length,
      page,
      limit,
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error fetching credentials:', error)
    
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return {
          statusCode: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
          },
          body: JSON.stringify({ error: 'User not authenticated' }),
        }
      }
      
      if (error.message === 'User not found') {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
          },
          body: JSON.stringify({ error: 'User not found' }),
        }
      }
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({ error: 'Failed to fetch credentials' }),
    }
  }
}

/** 'getCredentials' lambda function handler wrapped in required middleware. */
export const main = handler