import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources, credentials } from '@zeiro/domain'
import { CreateDataSourceInput } from '@typings/data-source'
import { DATA_SOURCE_CREATED_DOMAIN_EVENT } from '@typings/data-source-events'
import { validateAuthenticatedUser } from '@zeiro/sdk'
import { EventBridgeAdapter } from '@adapters/secondary/event-bridge'
import { encryptCredentialSecrets } from '@zeiro/sdk'
import { v4 as uuidv4 } from 'uuid'

// Initialize EventBridge adapter outside the handler for better performance
const event_bridge_adapter = new EventBridgeAdapter()

// Updated input type to match what frontend actually sends
type CreateDataSourceWithConnectionInput = {
  name: string
  type: string
  connection_details: {
    // PostgreSQL/MySQL
    host?: string
    port?: number
    database?: string
    username?: string
    password?: string
    ssl?: boolean
    // DynamoDB
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
  }
}

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
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'User not authenticated' }),
      }
    }

    // Validate user and get workspace information
    let user: Awaited<ReturnType<typeof validateAuthenticatedUser>>
    try {
      user = await validateAuthenticatedUser(cognito_user_id)
      console.log('Authenticated user:', { user_id: user.id, workspace_id: user.workspace_id })
    } catch (authError) {
      console.error('Error validating user:', authError)
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ error: 'User authentication failed' }),
      }
    }

    // Parse request body
    let input: CreateDataSourceWithConnectionInput
    try {
      input = JSON.parse(event.body || '{}')
      console.log('Parsed input:', JSON.stringify(input, null, 2))
    } catch (parseError) {
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
    console.log('Validating fields:', { 
      name: !!input.name, 
      type: !!input.type,
      connection_details: !!input.connection_details
    })
    
    if (!input.name || !input.type || !input.connection_details) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: name, type, connection_details',
          received: { 
            name: !!input.name, 
            type: !!input.type,
            connection_details: !!input.connection_details
          },
          input_keys: Object.keys(input)
        }),
      }
    }

    // Create credential based on data source type
    const credential_id = uuidv4()
    let credential_data: any
    let connection_config: any

    switch (input.type) {
      case 'PostgreSQL':
      case 'MySQL':
        // Validate database connection fields
        if (!input.connection_details.host || !input.connection_details.port || 
            !input.connection_details.database || !input.connection_details.username || 
            !input.connection_details.password) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
              'Access-Control-Allow-Methods': 'POST,OPTIONS',
            },
            body: JSON.stringify({ error: 'Missing required database connection fields' }),
          }
        }

        credential_data = {
          id: credential_id,
          user_id: user.id,
          workspace_id: user.workspace_id,
          name: `${input.name} Credentials`,
          type: 'connection_details', // Changed from 'database_connection' to match ElectroDB schema
          status: 'active',
          host: input.connection_details.host,
          port: input.connection_details.port,
          database_name: input.connection_details.database,
          username: input.connection_details.username,
          password: input.connection_details.password,
          ssl_enabled: input.connection_details.ssl || false,
        }

        connection_config = {
          host: input.connection_details.host,
          port: input.connection_details.port,
          database_name: input.connection_details.database,
          ssl: input.connection_details.ssl || false
        }
        break

      case 'DynamoDB':
        // Validate DynamoDB connection fields
        if (!input.connection_details.region || !input.connection_details.accessKeyId || 
            !input.connection_details.secretAccessKey) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
              'Access-Control-Allow-Methods': 'POST,OPTIONS',
            },
            body: JSON.stringify({ error: 'Missing required DynamoDB connection fields' }),
          }
        }

        credential_data = {
          id: credential_id,
          user_id: user.id,
          workspace_id: user.workspace_id,
          name: `${input.name} Credentials`,
          type: 'iam_access_keys', // Changed from 'aws_access_keys' to match ElectroDB schema
          status: 'active',
          account_id: '', // Can be derived later if needed
          access_key_id: input.connection_details.accessKeyId,
          secret_access_key: input.connection_details.secretAccessKey,
          region: input.connection_details.region,
        }

        connection_config = {
          region: input.connection_details.region,
          account_id: '' // Can be derived later if needed
        }
        break

      default:
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
          },
          body: JSON.stringify({ error: `Unsupported data source type: ${input.type}` }),
        }
    }

    // Encrypt sensitive credential fields
    const encrypted_credential = await encryptCredentialSecrets(credential_data)
    console.log('Creating encrypted credential:', { credential_id, type: credential_data.type })

    // Create credential in database
    const credential_result = await credentials.create(encrypted_credential).go()
    console.log('Credential created:', { credential_id: credential_result.data.id })

    // Create data source record
    const data_source_id = uuidv4()
    
    const dataSource = {
      id: data_source_id,
      user_id: user.id,
      workspace_id: user.workspace_id,
      name: input.name,
      description: undefined, // Not provided in current input structure
      type: input.type,
      credential_id: credential_id,
      connection_config: connection_config,
    }

    // Save data source to database
    const result = await dataSources.create(dataSource).go()
    const savedDataSource = result.data
    console.log('Data source created:', savedDataSource)

    // Emit domain event
    const data_source_created_event: DATA_SOURCE_CREATED_DOMAIN_EVENT = {
      id: uuidv4(),
      source: 'data-sources.create-data-source',
      name: 'DATA_SOURCE_CREATED',
      payload: {
        id: data_source_id,
        user_id: user.id,
        workspace_id: user.workspace_id,
        name: input.name,
        type: input.type,
        credential_id: credential_id,
      },
      date: new Date(),
    }

    await event_bridge_adapter.publish([data_source_created_event])
    console.log('Domain event emitted:', data_source_created_event)

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({
        ...savedDataSource,
        credential: {
          id: credential_result.data.id,
          name: credential_result.data.name,
          type: credential_result.data.type,
          status: credential_result.data.status,
        }
      }),
    }
    
  } catch (error) {
    console.error('Error creating data source:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    }
  }
}

export const main = handler