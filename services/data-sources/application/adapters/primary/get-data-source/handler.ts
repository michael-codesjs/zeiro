import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { dataSources } from '@adapters/secondary/one-table'
import { DataSource } from '@typings/data-source'
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { apiGatewaySignedFetch } from '@zeiro/sdk'

// Schema discovery types
type TableSchema = {
  tableName: string
  primaryKey: {
    partitionKey: string
    sortKey?: string
  }
  globalSecondaryIndexes: Array<{
    indexName: string
    partitionKey: string
    sortKey?: string
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
    projectedAttributes?: string[]
  }>
  localSecondaryIndexes: Array<{
    indexName: string
    sortKey: string
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE'
    projectedAttributes?: string[]
  }>
  attributes: Array<{
    name: string
    type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL'
    isKey?: boolean
    isIndexKey?: boolean
  }>
  discoveredFields: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
    isKey?: boolean
    isIndexKey?: boolean
    sampleValue?: any
    nestedFields?: string[]
  }>
  tableStatus: string
  itemCount?: number
  tableSizeBytes?: number
  billingMode?: 'PROVISIONED' | 'PAY_PER_REQUEST'
  fieldDiscovery?: {
    sampleScanned: boolean
    scanDate: string
    totalFieldsFound: number
  }
}

// Utility function to extract fields from a DynamoDB item
const extractFieldsFromItem = (
  item: Record<string, any>, 
  keyAttributes: Set<string>, 
  prefix: string = ''
): TableSchema['discoveredFields'] => {
  const fields: TableSchema['discoveredFields'] = []
  
  for (const [key, value] of Object.entries(item)) {
    const fieldName = prefix ? `${prefix}.${key}` : key
    const isKey = keyAttributes.has(key)
    const isIndexKey = keyAttributes.has(key)
    
    let fieldType: string
    let nestedFields: string[] | undefined
    let sampleValue: any = value
    
    if (value === null || value === undefined) {
      fieldType = 'null'
    } else if (typeof value === 'string') {
      fieldType = 'string'
    } else if (typeof value === 'number') {
      fieldType = 'number'
    } else if (typeof value === 'boolean') {
      fieldType = 'boolean'
    } else if (Array.isArray(value)) {
      fieldType = 'array'
      sampleValue = `Array[${value.length}]`
    } else if (typeof value === 'object') {
      fieldType = 'object'
      const nestedFieldData = extractFieldsFromItem(value, new Set(), fieldName)
      nestedFields = nestedFieldData.map(f => f.name)
      fields.push(...nestedFieldData)
      
      const keys = Object.keys(value)
      sampleValue = `Object {${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`
    } else {
      fieldType = 'string'
      sampleValue = String(value)
    }
    
    fields.push({
      name: fieldName,
      type: fieldType as any,
      isKey: prefix === '' ? isKey : false,
      isIndexKey: prefix === '' ? isIndexKey : false,
      sampleValue,
      nestedFields
    })
  }
  
  return fields
}

// Function to discover DynamoDB table schema
const discoverDynamoDBSchema = async (
  tableName: string,
  credentials: any,
  region: string = 'eu-central-1'
): Promise<TableSchema> => {
  console.log('Starting schema discovery for table:', tableName, 'in region:', region)
  
  const dynamoClient = new DynamoDBClient({ region, credentials })
  const docClient = DynamoDBDocumentClient.from(dynamoClient)

  // Get table description
  console.log('Describing table:', tableName)
  const tableDescription = await dynamoClient.send(new DescribeTableCommand({
    TableName: tableName
  }))
  
  console.log('Table description received:', {
    tableName: tableDescription.Table?.TableName,
    status: tableDescription.Table?.TableStatus,
    itemCount: tableDescription.Table?.ItemCount
  })

  const table = tableDescription.Table!
  
  // Extract primary key information
  const partitionKey = table.KeySchema!.find(key => key.KeyType === 'HASH')!.AttributeName!
  const sortKey = table.KeySchema!.find(key => key.KeyType === 'RANGE')?.AttributeName

  // Extract GSI information
  const globalSecondaryIndexes = table.GlobalSecondaryIndexes?.map(gsi => ({
    indexName: gsi.IndexName!,
    partitionKey: gsi.KeySchema!.find(key => key.KeyType === 'HASH')!.AttributeName!,
    sortKey: gsi.KeySchema!.find(key => key.KeyType === 'RANGE')?.AttributeName,
    projectionType: gsi.Projection!.ProjectionType! as 'ALL' | 'KEYS_ONLY' | 'INCLUDE',
    projectedAttributes: gsi.Projection!.NonKeyAttributes
  })) || []

  // Extract LSI information
  const localSecondaryIndexes = table.LocalSecondaryIndexes?.map(lsi => ({
    indexName: lsi.IndexName!,
    sortKey: lsi.KeySchema!.find(key => key.KeyType === 'RANGE')!.AttributeName!,
    projectionType: lsi.Projection!.ProjectionType! as 'ALL' | 'KEYS_ONLY' | 'INCLUDE',
    projectedAttributes: lsi.Projection!.NonKeyAttributes
  })) || []

  // Extract attribute definitions
  const attributes = table.AttributeDefinitions?.map(attr => {
    const keyAttributes = new Set([
      partitionKey,
      sortKey,
      ...globalSecondaryIndexes.map(gsi => gsi.partitionKey),
      ...globalSecondaryIndexes.map(gsi => gsi.sortKey).filter(Boolean),
      ...localSecondaryIndexes.map(lsi => lsi.sortKey)
    ].filter(Boolean))

    return {
      name: attr.AttributeName!,
      type: attr.AttributeType! as 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL',
      isKey: keyAttributes.has(attr.AttributeName!),
      isIndexKey: keyAttributes.has(attr.AttributeName!)
    }
  }) || []

  // Discover fields from sample data
  let discoveredFields: TableSchema['discoveredFields'] = []
  let fieldDiscovery: TableSchema['fieldDiscovery'] = {
    sampleScanned: false,
    scanDate: new Date().toISOString(),
    totalFieldsFound: 0
  }

  try {
    console.log('Scanning table for sample data:', tableName)
    const sampleResult = await docClient.send(new ScanCommand({
      TableName: tableName,
      Limit: 1
    }))

    console.log('Scan result:', {
      itemCount: sampleResult.Items?.length || 0,
      scannedCount: sampleResult.ScannedCount,
      count: sampleResult.Count
    })

    if (sampleResult.Items && sampleResult.Items.length > 0) {
      const sampleItem = sampleResult.Items[0]
      const keyAttributes = new Set([
        partitionKey,
        sortKey,
        ...globalSecondaryIndexes.map(gsi => gsi.partitionKey),
        ...globalSecondaryIndexes.map(gsi => gsi.sortKey).filter(Boolean),
        ...localSecondaryIndexes.map(lsi => lsi.sortKey)
      ].filter(Boolean))

      discoveredFields = extractFieldsFromItem(sampleItem, keyAttributes)
      fieldDiscovery = {
        sampleScanned: true,
        scanDate: new Date().toISOString(),
        totalFieldsFound: discoveredFields.length
      }
    }
  } catch (error) {
    console.warn('Failed to discover fields from sample item:', error)
  }

  return {
    tableName,
    primaryKey: { partitionKey, sortKey },
    globalSecondaryIndexes,
    localSecondaryIndexes,
    attributes,
    discoveredFields,
    tableStatus: table.TableStatus!,
    itemCount: table.ItemCount,
    tableSizeBytes: table.TableSizeBytes,
    billingMode: table.BillingModeSummary?.BillingMode,
    fieldDiscovery
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
    const data_source_id = event.pathParameters?.id

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

    if (!data_source_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source ID is required' }),
      }
    }

    // Get the data source
    const dataSource = await dataSources.get({
      user_id,
      id: data_source_id
    })

    if (!dataSource) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: JSON.stringify({ error: 'Data source not found' }),
      }
    }

    // Initialize schema as null
    let schema: TableSchema | null = null

    // If this is a DynamoDB data source, discover the schema
    if (dataSource.type === 'DynamoDB') {
      try {
        // Fetch credentials for the data source using signed request
        const credentialsResponse = await apiGatewaySignedFetch(
          `${process.env.CREDENTIALS_SERVICE_URL}/credentials/${dataSource.credential_id}/secure?user_id=${user_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!credentialsResponse.ok) {
          console.warn('Failed to fetch credentials for schema discovery:', credentialsResponse.status, await credentialsResponse.text())
        } else {
          const credentialData = await credentialsResponse.json()
          console.log('Fetched credential data for schema discovery')

          // Extract table name from connection config
          const tableName = dataSource.connection_config?.table_name || dataSource.connection_config?.table
          console.log('Table name extracted:', tableName, 'from config:', dataSource.connection_config)
          
          if (!tableName) {
            console.warn('No table name found in data source connection config:', dataSource.connection_config)
          } else {
            // Create AWS credentials object
            const awsCredentials = {
              accessKeyId: credentialData.connection_details?.access_key_id || credentialData.access_key_id,
              secretAccessKey: credentialData.connection_details?.secret_access_key || credentialData.secret_access_key,
            }

            const region = credentialData.connection_details?.region || credentialData.region || dataSource.connection_config?.region || 'eu-central-1'

            console.log('AWS credentials prepared:', {
              hasAccessKeyId: !!awsCredentials.accessKeyId,
              hasSecretAccessKey: !!awsCredentials.secretAccessKey,
              region
            })

            // Discover schema
            schema = await discoverDynamoDBSchema(tableName, awsCredentials, region)
            console.log('Successfully discovered schema for table:', tableName, 'with', schema?.discoveredFields?.length || 0, 'fields')
          }
        }
      } catch (error) {
        console.error('Error discovering schema:', error)
        // Continue without schema - don't fail the entire request
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
      },
      body: JSON.stringify({
        dataSource,
        schema
      }),
    }
    
  } catch (error) {
    console.error('Error fetching data source:', error)
    
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
