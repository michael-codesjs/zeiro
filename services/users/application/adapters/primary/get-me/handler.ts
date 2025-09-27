import { User } from '@typings/user'
import { users } from '@zeiro/domain'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

// Helper function to get CORS headers
const getCorsHeaders = (event: APIGatewayProxyEvent) => {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
  }
}

export const main = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2))

  // Handle OPTIONS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: '',
    }
  }

  try {
    // Extract cognito_user_id from authorizer claims
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub

    if (!cognito_user_id) {
      return {
        statusCode: 401,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    console.log('Fetching user with cognito_user_id:', cognito_user_id)

    // Query using ElectroDB's byCognitoUser index
    const result = await users.query
      .byCognitoUser({ cognito_user_id })
      .go()
    
    const user = result.data && result.data.length > 0 ? result.data[0] : null

    console.log('User:', user)
    
    if (!user) {
      return {
        statusCode: 404,
        headers: getCorsHeaders(event),
        body: JSON.stringify({ error: 'User not found' }),
      }
    }
    const responseUser: User = {
      id: user.id,
      cognito_user_id: user.cognito_user_id,
      email: user.email,
      name: user.name,
      workspace_id: user.workspace_id,
    }

    return {
      statusCode: 200,
      headers: getCorsHeaders(event),
      body: JSON.stringify(responseUser),
    }
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return {
      statusCode: 500,
      headers: getCorsHeaders(event),
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
