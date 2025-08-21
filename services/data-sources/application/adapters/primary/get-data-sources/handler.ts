import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@adapters/secondary/one-table'
import { DataSource, DataSourceListQuery } from '@typings/data-source'
import { withLambdaIOStandard } from '@zeiro/sdk'

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

    // Parse query parameters
    const queryParams = event.queryStringParameters || {}
    const query: DataSourceListQuery = {
      user_id,
      type: queryParams.type as any,
      status: queryParams.status as any,
      environment: queryParams.environment as any,
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
    }

    // Build query conditions
    const queryConditions: any = {
      pk: `USER#${user_id}`,
      sk: { begins: 'DATA_SOURCE#' },
    }

    // Add filters if provided
    if (query.type) {
      queryConditions.type = query.type
    }
    if (query.status) {
      queryConditions.status = query.status
    }
    if (query.environment) {
      queryConditions.environment = query.environment
    }

    // Query data sources
    const result = await dataSources.find(queryConditions, {
      limit: query.limit,
      // Note: DynamoDB pagination would be implemented here in a real scenario
    })

    const userDataSources: DataSource[] = result || []

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