import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@zeiro/domain'
import { DataSource, DataSourceListQuery } from '@typings/data-source'
import { validateAuthenticatedUser } from '@zeiro/sdk'

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  console.log('event', JSON.stringify(event, null, 2))
  
  try {
    // Extract cognito_user_id from Cognito authorizer context
    const cognito_user_id = event.requestContext?.authorizer?.claims?.sub
    if (!cognito_user_id) {
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

    // Validate user and get workspace information
    let user
    try {
      user = await validateAuthenticatedUser(cognito_user_id)
      console.log('Authenticated user:', { user_id: user.user_id, workspace_id: user.workspace_id })
    } catch (authError) {
      console.error('Error validating user:', authError)
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'User authentication failed' }),
      }
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {}
    const query = {
      type: queryParams.type as any,
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
    }

    // Query data sources by workspace
    let queryBuilder = dataSources.query.byWorkspace({ workspace_id: user.workspace_id })

    // Apply type filter if provided
    if (query.type) {
      // Use byWorkspaceAndType index for type filtering
      queryBuilder = dataSources.query.byWorkspaceAndType({
        workspace_id: user.workspace_id,
        type: query.type,
      })
    }

    // Execute query with limit
    const result = await queryBuilder.go({ limit: query.limit })
    const userDataSources = result.data || []

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({
        dataSources: userDataSources,
        total: userDataSources.length,
        page: query.page,
        limit: query.limit,
      }),
    }
    
  } catch (error) {
    console.error('Error fetching data sources:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler