import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { credentials } from '@adapters/secondary/one-table'
import { CredentialListResponse } from '@typings/credential'

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // Extract user_id from Cognito authorizer context
    const user_id = event.requestContext?.authorizer?.claims?.sub
    if (!user_id) {
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

    // Extract query parameters
    const queryParams = event.queryStringParameters || {}
    const type = queryParams.type
    const page = parseInt(queryParams.page || '1', 10)
    const limit = parseInt(queryParams.limit || '10', 10)
    
    let query_options: any = {
      // user_id,
      // limit,
      // offset: (page - 1) * limit,
      pk: `USER#${user_id}`,
    }
    
    const result = await credentials.find(query_options, { limit })
    
    // Mask sensitive fields in response for security
    const masked_credentials = result.map((credential) => {
      const masked = { ...credential } as any
      
      // Mask all sensitive fields
      if (masked.secret_access_key) masked.secret_access_key = '<MASKED>'
      if (masked.service_account_key) masked.service_account_key = '<MASKED>'
      if (masked.client_secret) masked.client_secret = '<MASKED>'
      if (masked.password) masked.password = '<MASKED>'
      
      return masked
    })
    
    // Get total count for pagination
    const total_result = await credentials.find({
      user_id,
      count: true,
    } as never)
    
    const response: CredentialListResponse = {
      credentials: masked_credentials,
      total: total_result.count || 0,
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