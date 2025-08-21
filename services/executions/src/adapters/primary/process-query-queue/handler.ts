import { SQSEvent, SQSRecord } from 'aws-lambda';
import { IntegrationService } from '../../secondary/integration/services';
import { QueryExecutionService } from '../../secondary/one-table';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand, GetCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { getWebSocketServiceClient } from '@zeiro/sdk';

// DynamoDB setup
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

// Use the SDK WebSocket service client to send messages
const websocketClient = getWebSocketServiceClient();

interface QueryExecution {
  userId: string;
  databaseId: string;
  naturalLanguageQuery: string;
  generatedParameters: any;
  operation?: string;
  explanation?: string;
  suggestedChartType?: string;
  title?: string;
  status: 'pending_approval' | 'queued' | 'executing' | 'executed' | 'failed';
  threadId?: string;
  executionId?: string;
  results?: any;
  error?: string;
  autoApproved?: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: number;
}

export const main = async (event: SQSEvent): Promise<void> => {
  console.log('🔧 Environment variables:');
  console.log('  WEBSOCKET_SERVICE_URL:', process.env.WEBSOCKET_SERVICE_URL);
  
  console.log('📨 Processing SQS event with', event.Records.length, 'records');

  for (const record of event.Records) {
    console.log(`\n📝 Processing SQS record: ${record.messageId}`);
    console.log(`📄 Message body: ${record.body}`);
    
    try {
      const messageBody = JSON.parse(record.body);
      console.log(`🎯 Parsed message:`, messageBody);
      
      const { executionId, userId, databaseId, query, parameters, operation, threadId, suggestedChartType } = messageBody;
      
      // Validate required fields
      if (!executionId || !userId || !databaseId || !parameters) {
        console.error('❌ Missing required fields in message:', { executionId, userId, databaseId, hasParameters: !!parameters });
        throw new Error('Missing required fields: executionId, userId, databaseId, or parameters');
      }

      // Validate parameters structure for performance
      if (!parameters.TableName) {
        console.error('❌ Invalid parameters: TableName is required');
        throw new Error('Invalid parameters: TableName is required');
      }

      // Performance validation - warn about potentially expensive operations
      if (operation === 'scan' && !parameters.Limit) {
        console.warn('⚠️ Scan operation without Limit - this could be expensive');
      }

      if (parameters.Limit && parameters.Limit > 1000) {
        console.warn(`⚠️ Large limit specified (${parameters.Limit}) - this could impact performance`);
      }

      console.log(`🔍 Processing query execution:`, {
        executionId,
        userId,
        databaseId,
        operation: operation || 'unknown',
        hasParameters: !!parameters,
        parameterKeys: parameters ? Object.keys(parameters) : [],
        threadId
      });

      // Track execution timing
      const startTime = Date.now();

      // Initialize services once
      const integrationService = new IntegrationService();
      const queryExecutionService = new QueryExecutionService();

      // Update status to executing
      console.log(`📝 Updating execution status to 'executing' for ID: ${executionId}`);
      await queryExecutionService.updateQueryExecutionStatus(userId, executionId, 'executing');
      
      // Parallel execution of database fetch and query execution retrieval for better performance
      console.log(`🔍 Fetching database credentials and query execution in parallel...`);
      const [{ database, credentials, schema }, queryExecution] = await Promise.all([
        integrationService.getDatabaseWithCredentials(databaseId, userId),
        queryExecutionService.getQueryExecutionByExecutionId(executionId)
      ]);
      
      const actualTableName = database.connection_config.table;
      console.log(`✅ Database and execution fetched successfully:`, {
        databaseName: database.name,
        actualTableName: actualTableName,
        region: credentials.region,
        executionStatus: queryExecution?.status
      });
      
      if (!queryExecution) {
        throw new Error(`Query execution with executionId ${executionId} not found`);
      }
      
      console.log(`✅ Query execution retrieved:`, {
        executionId: queryExecution.executionId,
        suggestedChartType: queryExecution.suggestedChartType,
        title: queryExecution.title,
        status: queryExecution.status
      });

      // Fix: Replace any table name with actual DynamoDB table name from connection config
      if (actualTableName !== parameters.TableName) {
        console.log(`🔧 Replacing table name '${parameters.TableName}' with actual table name '${actualTableName}'`);
        parameters.TableName = actualTableName;
      }
      
      // Execute the query directly using the corrected parameters
      console.log(`⚡ Executing query with pre-generated parameters:`, {
        operation: operation || 'unknown',
        tableName: parameters.TableName,
        hasKeyCondition: !!parameters.KeyConditionExpression,
        hasFilterExpression: !!parameters.FilterExpression,
        hasProjectionExpression: !!parameters.ProjectionExpression,
        limit: parameters.Limit,
        consistentRead: parameters.ConsistentRead
      });
      
      const queryResult = await executeQuery(parameters, credentials);
      console.log(`✅ Query executed successfully:`, {
        operation: queryResult.operation,
        itemCount: queryResult.count,
        hasItems: !!queryResult.items?.length,
        hasConsumedCapacity: !!queryResult.consumedCapacity,
        hasLastEvaluatedKey: !!queryResult.lastEvaluatedKey
      });

      // Performance monitoring: Log if query consumed significant capacity
      if (queryResult.consumedCapacity) {
        const capacity = queryResult.consumedCapacity.CapacityUnits || 0;
        if (capacity > 10) {
          console.warn(`⚠️ High capacity consumption: ${capacity} units`);
        }
      }

      // Use AI-suggested chart type only - no fallback determination
      const chartType = queryExecution.suggestedChartType || 'Table';
      
      console.log(`📊 Chart type selection:`, {
        suggestedChartType: queryExecution.suggestedChartType,
        finalChartType: chartType
      });
      
      // Format result for frontend consumption according to ChartData interface
      const metadata: any = {
        totalRecords: queryResult.count || 0,
        queryType: queryResult.operation,
        executionTime: `${Date.now() - startTime}ms`,
        dataSource: database.name,
        executionId,
        operation: queryResult.operation,
        tableName: parameters.TableName
      };

      // Only add optional fields if they exist
      if (queryResult.lastEvaluatedKey) {
        metadata.lastEvaluatedKey = queryResult.lastEvaluatedKey;
      }
      if (queryResult.consumedCapacity) {
        metadata.consumedCapacity = queryResult.consumedCapacity;
      }

      const formattedResult = {
        chartType,
        title: queryExecution.title || `Query Results (${queryResult.count} items)`,
        data: queryResult.items || [],
        message: `Found ${queryResult.count} result${queryResult.count !== 1 ? 's' : ''} using ${queryResult.operation} operation`,
        metadata
      };
      
      console.log(`📋 Final queryResult for frontend:`, {
        hasMessage: !!formattedResult.message,
        messagePreview: formattedResult.message?.substring(0, 100),
        hasData: !!formattedResult.data?.length,
        dataCount: formattedResult.data?.length || 0,
        chartType: formattedResult.chartType,
        title: formattedResult.title,
        totalRecords: formattedResult.metadata.totalRecords
      });
      
              // Update status to executed with result
        console.log(`📝 Updating execution status to 'executed' for ID: ${executionId}`);
        await queryExecutionService.updateQueryExecutionStatus(userId, executionId, 'executed', formattedResult);

      // Send result to all subscribed WebSocket connections
      await broadcastToSubscribers(executionId, {
        type: 'query.completed',
        timestamp: new Date().toISOString(),
        executionId: executionId,
        payload: {
          result: formattedResult,
          status: 'executed',
          userId: userId
        }
      });

    } catch (error) {
      console.error(`❌ Error processing record ${record.messageId}:`, error);
      
      // Try to update status to failed if we have the execution ID
      try {
        const messageBody = JSON.parse(record.body);
        const { executionId, userId } = messageBody;
        if (executionId && userId) {
          console.log(`📝 Updating execution status to 'failed' for ID: ${executionId}`);
          const failedQueryExecutionService = new QueryExecutionService();
          await failedQueryExecutionService.updateQueryExecutionStatus(
            userId, 
            executionId, 
            'failed', 
            undefined, 
            error instanceof Error ? error.message : 'Unknown error'
          );
          
          // Send error to WebSocket subscribers
          await broadcastToSubscribers(executionId, {
            type: 'query.error',
            timestamp: new Date().toISOString(),
            executionId: executionId,
            payload: {
              error: error instanceof Error ? error.message : 'Unknown error',
              status: 'failed',
              userId: userId
            }
          });
        }
      } catch (updateError) {
        console.error(`❌ Failed to update execution status to failed:`, updateError);
      }
      
      // Re-throw the error so SQS knows this message failed
      throw error;
    }
  }
};

async function broadcastToSubscribers(executionId: string, message: any): Promise<void> {
  console.log(`📡 Broadcasting to subscribers for execution: ${executionId}`);
  console.log(`📋 Full message being broadcast:`, JSON.stringify(message, null, 2));
  
  try {
    // We need to get the userId from the message payload to send to their WebSocket connections
    const userId = message.payload?.userId;
    if (!userId) {
      console.error('❌ No userId found in message payload, cannot broadcast');
      console.error('❌ Message structure:', JSON.stringify(message, null, 2));
      return;
    }

    console.log(`🔍 Sending message to user: ${userId} via WebSocket service`);
    
    // Use the WebSocket service to send the message to the user
    try {
      await websocketClient.sendToUser(userId, message);
      console.log(`✅ Successfully sent message to user ${userId} via WebSocket service`);
    } catch (error) {
      console.error(`❌ Failed to send message to user ${userId}:`, error);
      // The WebSocket service will handle connection cleanup
    }
    
    console.log(`📡 Broadcast completed for execution ${executionId} to user ${userId}`);
    
  } catch (error) {
    console.error(`❌ Failed to broadcast to subscribers for ${executionId}:`, error);
    // Don't throw - this shouldn't fail the main processing
  }
}

// Removed - now using WebSocket service to send messages

// Direct query execution function using AWS SDK
async function executeQuery(queryParams: any, credentials: any): Promise<any> {
  const dynamoClient = new DynamoDBClient({ 
    region: credentials.region || 'eu-central-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  });
  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  try {
    let result: any;

    // Determine operation type from parameters
    if (queryParams.Key) {
      // GetItem operation
      result = await docClient.send(new GetCommand(queryParams));
      return {
        items: result.Item ? [result.Item] : [],
        count: result.Item ? 1 : 0,
        operation: 'get-item',
        lastEvaluatedKey: null,
        consumedCapacity: result.ConsumedCapacity
      };
    } else if (queryParams.KeyConditionExpression) {
      // Query operation
      result = await docClient.send(new QueryCommand(queryParams));
    } else if (queryParams.RequestItems) {
      // BatchGet operation
      result = await docClient.send(new BatchGetCommand(queryParams));
      return {
        items: result.Responses?.[queryParams.RequestItems ? Object.keys(queryParams.RequestItems)[0] : ''] || [],
        count: result.Responses?.[queryParams.RequestItems ? Object.keys(queryParams.RequestItems)[0] : '']?.length || 0,
        operation: 'batch-get',
        lastEvaluatedKey: null,
        consumedCapacity: result.ConsumedCapacity?.[0]
      };
    } else {
      // Scan operation
      result = await docClient.send(new ScanCommand(queryParams));
    }

    return {
      items: result.Items || [],
      count: result.Count || 0,
      operation: queryParams.KeyConditionExpression ? 'query' : 'scan',
      lastEvaluatedKey: result.LastEvaluatedKey || null,
      consumedCapacity: result.ConsumedCapacity
    };
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
} 