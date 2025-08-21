import { DatabaseSchema } from '../../../types/query'
import { apiGatewaySignedFetch } from '@zeiro/sdk'

export interface SecureCredential {
  id: string
  user_id: string
  name: string
  type: string
  connection_details: {
    access_key_id: string
    secret_access_key: string
    session_token?: string
    region?: string
  }
  created_at: string
  updated_at: string
}

export interface Database {
  id: string
  user_id: string
  name: string
  type: string
  credential_id: string
  connection_config: any
  status: string
  created_at: string
  updated_at: string
}

export class CredentialsService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.CREDENTIALS_SERVICE_URL || ''
  }

  async getSecureCredential(credentialId: string, userId: string): Promise<SecureCredential | null> {
    try {
      const response = await apiGatewaySignedFetch(
        `${this.baseUrl}/credentials/${credentialId}/secure?user_id=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
        }
      )

      console.log('apiGatewaySignedFetch response status:', response.status)
      console.log('apiGatewaySignedFetch response:', JSON.stringify(response, null, 2))

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const error_text = await response.text()
        console.error('Failed to fetch secure credential:', response.status, response.statusText, error_text)
        throw new Error(`Failed to fetch secure credential: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in apiGatewaySignedFetch:', error)
      throw new Error(`Failed to retrieve secure credential: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


}

export class DatabasesService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.CREDENTIALS_SERVICE_URL || 'https://n41c4yh7z4.execute-api.eu-central-1.amazonaws.com/dev'
  }

  async getDatabase(databaseId: string, userId: string): Promise<Database | null> {
    try {
      // Use the internal endpoint for service-to-service calls with POST method
      const response = await apiGatewaySignedFetch(
        `${this.baseUrl}/internal/data-sources/${databaseId}`,
        {
          method: 'POST',
          body: JSON.stringify({ user_id: userId }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('apiGatewaySignedFetch database internal response status:', response.status)

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        const error_text = await response.text()
        console.error('Failed to fetch database:', response.status, response.statusText, error_text)
        throw new Error(`Failed to fetch database: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error in apiGatewaySignedFetch for database:', error)
      throw new Error(`Failed to retrieve database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getDatabaseSchema(database: Database, credentials: any): Promise<DatabaseSchema> {
    // In a real implementation, this would introspect the DynamoDB table
    // For now, we'll return a basic schema structure
    
    const tableName = database.connection_config.table || database.name

    // This is a simplified schema - in production you'd use DynamoDB describe operations
    return {
      table_name: tableName,
      primary_key: {
        partition_key: 'pk',
        sort_key: 'sk'
      },
      global_secondary_indexes: [
        {
          index_name: 'GSI1',
          partition_key: 'gsi1pk',
          sort_key: 'gsi1sk'
        }
      ],
      attributes: [
        { name: 'pk', type: 'S', description: 'Partition key' },
        { name: 'sk', type: 'S', description: 'Sort key' },
        { name: 'gsi1pk', type: 'S', description: 'GSI1 partition key' },
        { name: 'gsi1sk', type: 'S', description: 'GSI1 sort key' },
        { name: 'created_at', type: 'S', description: 'Creation timestamp' },
        { name: 'updated_at', type: 'S', description: 'Last updated timestamp' }
      ]
    }
  }
}

export class IntegrationService {
  private credentialsService: CredentialsService
  private databasesService: DatabasesService

  constructor() {
    this.credentialsService = new CredentialsService()
    this.databasesService = new DatabasesService()
  }

  async getDatabaseWithCredentials(databaseId: string, userId: string): Promise<{
    database: Database
    credentials: {
      accessKeyId: string
      secretAccessKey: string
      sessionToken?: string
      region?: string
    }
    schema: DatabaseSchema
  }> {
    // Get database information
    const database = await this.databasesService.getDatabase(databaseId, userId)
    if (!database) {
      throw new Error('Database not found')
    }

    if (database.user_id !== userId) {
      throw new Error('Unauthorized access to database')
    }

    // Get decrypted credentials from the secure endpoint
    const secureCredential = await this.credentialsService.getSecureCredential(database.credential_id, userId)
    if (!secureCredential) {
      throw new Error('Credentials not found for database')
    }

    // Extract credentials from the secure response
    const credentials = {
      accessKeyId: secureCredential.connection_details.access_key_id,
      secretAccessKey: secureCredential.connection_details.secret_access_key,
      sessionToken: secureCredential.connection_details.session_token,
      region: secureCredential.connection_details.region || database.connection_config?.region || 'eu-central-1'
    }

    // Get database schema
    const schema = await this.databasesService.getDatabaseSchema(database, credentials)

    return {
      database,
      credentials,
      schema
    }
  }
} 