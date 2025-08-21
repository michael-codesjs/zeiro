import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dataSources } from '@adapters/secondary/one-table';

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('🚀 Starting get-data-source-internal handler');
  console.log('📋 Event details:', {
    httpMethod: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
    headers: event.headers ? Object.keys(event.headers) : 'none',
    body: event.body ? 'present' : 'missing'
  });

  try {
    const dataSourceId = event.pathParameters?.id;
    
    if (!dataSourceId) {
      console.error('❌ Missing data source ID in path parameters');
      console.log('📋 Available path parameters:', event.pathParameters);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'Data source ID is required',
          message: 'Missing data source ID in path parameters'
        })
      };
    }

    // Parse request body to get user_id
    let requestBody: { user_id?: string } = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
        console.log('📋 Parsed request body:', { user_id: requestBody.user_id });
      } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError);
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
          },
          body: JSON.stringify({ 
            error: 'Invalid JSON in request body',
            message: 'Request body must be valid JSON'
          })
        };
      }
    }

    const userId = requestBody.user_id;
    if (!userId) {
      console.error('❌ Missing user_id in request body');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'user_id is required',
          message: 'user_id must be provided in request body for internal data source lookup'
        })
      };
    }

    console.log(`🔍 Retrieving data source with ID: ${dataSourceId} for user: ${userId}`);
    console.log(`📊 Using OneTable data source model`);
    console.log(`🏗️ Environment variables:`, {
      DATA_SOURCES_DYNAMODB_TABLE_NAME: process.env.DATA_SOURCES_DYNAMODB_TABLE_NAME,
      AWS_REGION: process.env.AWS_REGION
    });

    // Log the exact parameters we're using for the lookup
    const lookupParams = {
      user_id: userId,
      id: dataSourceId
    };
    console.log('🔑 Lookup parameters:', lookupParams);
    console.log('🔑 Expected DynamoDB keys:', {
      pk: `USER#${userId}`,
      sk: `DATA_SOURCE#${dataSourceId}`
    });

    // Use OneTable to get the data source with proper key structure
    console.log('🔄 Executing OneTable get operation...');
    
    let dataSource;
    try {
      dataSource = await dataSources.get(lookupParams);
      console.log('✅ OneTable get operation completed');
      console.log('📊 Raw data source result:', dataSource ? 'found' : 'null');
      
      if (dataSource) {
        console.log('📊 Data source object keys:', Object.keys(dataSource));
        console.log('📊 Data source basic info:', {
          id: dataSource.id,
          user_id: dataSource.user_id,
          name: dataSource.name,
          type: dataSource.type
        });
      }
    } catch (oneTableError) {
      console.error('❌ OneTable get operation failed:', oneTableError);
      console.error('📋 OneTable error details:', {
        name: oneTableError.name,
        message: oneTableError.message,
        stack: oneTableError.stack
      });
      
      // Try to provide more helpful error information
      throw new Error(`OneTable lookup failed: ${oneTableError.message}`);
    }

    if (!dataSource) {
      console.log('❌ Data source not found');
      console.log('🔍 Search performed with params:', lookupParams);
      console.log('🔍 Expected to find data source with:');
      console.log('  - user_id:', userId);
      console.log('  - id:', dataSourceId);
      
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'Data source not found',
          message: `No data source found with ID ${dataSourceId} for user ${userId}`,
          searchParams: {
            user_id: userId,
            data_source_id: dataSourceId
          }
        })
      };
    }

    console.log('✅ Data source found successfully');

    // Log the structure without sensitive data
    console.log('📊 Data source structure:', {
      id: dataSource.id,
      name: dataSource.name,
      type: dataSource.type,
      user_id: dataSource.user_id,
      credential_id: dataSource.credential_id,
      status: dataSource.status,
      environment: dataSource.environment,
      created_at: dataSource.created_at,
      updated_at: dataSource.updated_at
    });

    console.log('📤 Returning successful response');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(dataSource)
    };

  } catch (error) {
    console.error('❌ Error in get-data-source-internal handler:', error);
    console.error('📋 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to retrieve data source',
        details: error.message
      })
    };
  }
}; 