import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { withLambdaIOStandard, apiGatewaySignedFetch } from '@zeiro/sdk'

// Helper function to fetch credential details from credentials service
const fetchCredentialDetails = async (credential_id: string, user_id: string) => {
  const credentials_service_url = process.env.CREDENTIALS_SERVICE_URL || 'http://localhost:3000' // For local development
  
  try {
    const response = await apiGatewaySignedFetch(
        `${credentials_service_url}/credentials/${credential_id}/secure?user_id=${encodeURIComponent(user_id)}`,
        {
            method: 'GET',
        }
    )

    console.log('apiGatewaySignedFetch response status:', response.status)
    console.log('apiGatewaySignedFetch response:', JSON.stringify(response, null, 2))
    console.log('apiGatewaySignedFetch response body:', response)

    if (!response.ok) {
      const error_text = await response.text()
      console.error('Failed to fetch credential:', response.status, response.statusText, error_text)
      throw new Error(`Failed to fetch credential: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error in apiGatewaySignedFetch:', error)
    throw new Error(`Failed to fetch credential details: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

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
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Parse request body
    let request_body: {
      credential_id: string;
      region?: string;
    }
    
    try {
      request_body = JSON.parse(event.body || '{}')
    } catch (parse_error) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      }
    }

    // Validate required fields
    if (!request_body.credential_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Missing required field: credential_id' }),
      }
    }

    // Fetch full credential details securely from credentials service
    let credential
    try {
      credential = await fetchCredentialDetails(request_body.credential_id, user_id)
    } catch (credential_error) {
      console.error('Error fetching credential:', credential_error)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ 
          error: 'Failed to fetch credential details',
          message: credential_error instanceof Error ? credential_error.message : 'Unknown error'
        }),
      }
    }

    console.log('credential', JSON.stringify(credential, null, 2))

    // Validate credential type and extract AWS credentials
    if (credential.type !== 'aws' || !credential.connection_details) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Credential is not a valid AWS credential' }),
      }
    }

    if (credential.user_id !== user_id) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'Access denied: credential does not belong to authenticated user' }),
      }
    }

    const { access_key_id, secret_access_key } = credential.connection_details
    if (!access_key_id || !secret_access_key) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'AWS credential missing required access keys' }),
      }
    }

    const region = request_body.region || credential.connection_details.region || 'us-east-1'

    // Create DynamoDB client with credential details
    const dynamo_db_client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: access_key_id,
        secretAccessKey: secret_access_key,
      },
    })

    // List all tables
    const list_tables_command = new ListTablesCommand({ Limit: 100 })
    const tables_response = await dynamo_db_client.send(list_tables_command)
    
    const table_names = tables_response.TableNames || []
    
    // Get details for each table (limited to prevent timeouts)
    const MAX_TABLES_TO_DESCRIBE = 100
    const tables_to_describe = table_names.slice(0, MAX_TABLES_TO_DESCRIBE)
    
    const dataSources = await Promise.allSettled(
      tables_to_describe.map(async (table_name) => {
        try {
          const describe_command = new DescribeTableCommand({ TableName: table_name })
          const table_details = await dynamo_db_client.send(describe_command)
          
          return {
            name: table_name,
            arn: table_details.Table?.TableArn,
            status: table_details.Table?.TableStatus,
            item_count: table_details.Table?.ItemCount || 0,
            size_bytes: table_details.Table?.TableSizeBytes || 0,
            creation_date: table_details.Table?.CreationDateTime?.toISOString(),
            billing_mode: table_details.Table?.BillingModeSummary?.BillingMode || 'PROVISIONED',
            region,
          }
        } catch (error) {
          console.warn(`Failed to describe table ${table_name}:`, error)
          return {
            name: table_name,
            status: 'UNKNOWN',
            region,
            error: 'Failed to fetch details'
          }
        }
      })
    )

    const discovered_data_sources = dataSources
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)

    const failed_data_sources = dataSources
      .filter(result => result.status === 'rejected')
      .map(result => ({
        error: (result as PromiseRejectedResult).reason?.message || 'Unknown error'
      }))

    // If we have more tables than we described, include a summary
    const summary = {
      total_tables: table_names.length,
      described_tables: tables_to_describe.length,
      has_more: table_names.length > MAX_TABLES_TO_DESCRIBE,
      region,
      credential_id: request_body.credential_id,
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        dataSources: discovered_data_sources,
        summary,
        failed: failed_data_sources.length > 0 ? failed_data_sources : undefined,
      }),
    }
    
  } catch (error) {
    console.error('Error discovering DynamoDB tables:', error)
    
    let error_message = 'Internal server error'
    let status_code = 500
    
    // Handle specific AWS errors
    if (error instanceof Error) {
      if (error.name === 'UnrecognizedClientException' || error.name === 'InvalidSignatureException') {
        error_message = 'Invalid AWS credentials'
        status_code = 400
      } else if (error.name === 'AccessDeniedException') {
        error_message = 'AWS credentials do not have permission to list DynamoDB tables'
        status_code = 403
      }
    }
    
    return {
      statusCode: status_code,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ 
        error: error_message,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler 