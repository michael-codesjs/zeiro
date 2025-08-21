import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from 'aws-amplify/api';
import { toast } from 'react-hot-toast';

export type DatabaseType = 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'Cassandra' | 'InfluxDB' | 'Elasticsearch';
export type DatabaseStatus = 'connected' | 'disconnected' | 'error' | 'connecting';
export type DatabaseEnvironment = 'development' | 'staging' | 'production';

export type DatabaseConnectionConfig = {
  // DynamoDB specific
  region?: string;
  account_id?: string;
  
  // SQL Database specific
  host?: string;
  port?: number;
  database_name?: string;
  ssl?: boolean;
  
  // MongoDB specific
  connection_string?: string;
  
  // Additional configuration
  timeout?: number;
  max_connections?: number;
  [key: string]: any;
};

export type DiscoveredField = {
  name: string;
  type: string;
  frequency: number;
  sample_values: any[];
  is_nullable: boolean;
  description?: string;
};

export type DiscoveredTableInfo = {
  table_name: string;
  primary_key: {
    partition_key: string;
    sort_key?: string;
  };
  global_secondary_indexes?: Array<{
    index_name: string;
    partition_key: string;
    sort_key?: string;
  }>;
  discovered_fields: DiscoveredField[];
  query_patterns: string[];
  table_description: string;
  optimal_queries: Array<{
    pattern: string;
    use_case: string;
    example: string;
  }>;
  last_analyzed: string;
};

export type DatabaseMetadata = {
  table_count?: number;
  collection_count?: number;
  size_bytes?: number;
  last_backup?: string;
  version?: string;
  discovered_tables?: Record<string, DiscoveredTableInfo>;
  deep_discovery?: {
    last_analyzed: string;
    tables_analyzed: string[];
    total_tables_discovered: number;
    failed_analyses: number;
    analysis_summary: {
      successful: number;
      failed: number;
      total: number;
    };
  };
  [key: string]: any;
};

export type Database = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: DatabaseType;
  status: DatabaseStatus;
  environment: DatabaseEnvironment;
  credential_id: string;
  connection_config: DatabaseConnectionConfig;
  auto_connect: boolean;
  created_at: string;
  updated_at: string;
  last_accessed?: string;
  metadata?: DatabaseMetadata;
};

export type CreateDatabaseInput = Omit<Database, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_accessed' | 'metadata'>;

const DATA_SOURCES_QUERY_KEY = ['data-sources'];

// Fetch databases
const fetchDatabases = async (): Promise<Database[]> => {
  const restOperation = get({
    apiName: 'zeiro-api',
    path: '/data-sources',
    options: {
      queryParams: {
        page: '1',
        limit: '50'
      }
    }
  });
  
  const response = await restOperation.response;
  const data = await response.body.json() as unknown as { dataSources: Database[] };
  return data.dataSources;
};

// Schema types for individual data source
export type TableSchema = {
  tableName: string;
  primaryKey: {
    partitionKey: string;
    sortKey?: string;
  };
  globalSecondaryIndexes: Array<{
    indexName: string;
    partitionKey: string;
    sortKey?: string;
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
    projectedAttributes?: string[];
  }>;
  localSecondaryIndexes: Array<{
    indexName: string;
    sortKey: string;
    projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
    projectedAttributes?: string[];
  }>;
  attributes: Array<{
    name: string;
    type: 'S' | 'N' | 'B' | 'SS' | 'NS' | 'BS' | 'M' | 'L' | 'NULL' | 'BOOL';
    isKey?: boolean;
    isIndexKey?: boolean;
  }>;
  discoveredFields: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
    isKey?: boolean;
    isIndexKey?: boolean;
    sampleValue?: any;
    nestedFields?: string[];
  }>;
  tableStatus: string;
  itemCount?: number;
  tableSizeBytes?: number;
  billingMode?: 'PROVISIONED' | 'PAY_PER_REQUEST';
  fieldDiscovery?: {
    sampleScanned: boolean;
    scanDate: string;
    totalFieldsFound: number;
  };
};

export type DataSourceWithSchema = {
  dataSource: Database;
  schema: TableSchema | null;
};

// Fetch individual data source with schema
const fetchDataSourceWithSchema = async (id: string): Promise<DataSourceWithSchema> => {
  const restOperation = get({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}`,
  });
  
  const response = await restOperation.response;
  const data = await response.body.json() as unknown as DataSourceWithSchema;
  return data;
};

// Create database
const createDatabase = async (newDatabase: CreateDatabaseInput): Promise<Database> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/data-sources',
    options: {
      body: newDatabase
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as Database;
};

// Update database
const updateDatabase = async (id: string, updatedDatabase: Partial<CreateDatabaseInput>): Promise<Database> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}`,
    options: {
      body: updatedDatabase
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as Database;
};

// Delete database
const deleteDatabase = async (id: string): Promise<void> => {
  const restOperation = del({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}`,
  });
  
  await restOperation.response;
};

// Test database connection
const testDatabaseConnection = async (id: string): Promise<{ success: boolean; message: string; latency?: number }> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}/test`,
    options: {
      body: {}
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as { success: boolean; message: string; latency?: number };
};

// Hooks
export const useDataSources = () => {
  return useQuery({
    queryKey: DATA_SOURCES_QUERY_KEY,
    queryFn: fetchDatabases,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Alias for backwards compatibility
export const useDatabases = () => {
  return useQuery({
    queryKey: DATA_SOURCES_QUERY_KEY,
    queryFn: fetchDatabases,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch individual data source with schema
export const useDataSourceWithSchema = (id: string | null) => {
  return useQuery({
    queryKey: ['data-source-with-schema', id],
    queryFn: () => fetchDataSourceWithSchema(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter than list since schema can change)
  });
};

export const useCreateDatabase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDatabase,
    onSuccess: (newDatabase) => {
      // Optimistically update the cache
      queryClient.setQueryData<Database[]>(DATA_SOURCES_QUERY_KEY, (old) => 
        old ? [...old, newDatabase] : [newDatabase]
      );
      toast.success('Data source created successfully');
    },
    onError: (error) => {
      console.error('Error creating database:', error);
      toast.error('Failed to create database');
    },
  });
};

export const useUpdateDatabase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDatabaseInput> }) => updateDatabase(id, data),
    onSuccess: (updatedDatabase) => {
      // Optimistically update the cache
      queryClient.setQueryData<Database[]>(DATA_SOURCES_QUERY_KEY, (old) => 
        old ? old.map(d => d.id === updatedDatabase.id ? updatedDatabase : d) : [updatedDatabase]
      );
      toast.success('Data source updated successfully');
    },
    onError: (error) => {
      console.error('Error updating database:', error);
      toast.error('Failed to update data source');
    },
  });
};

export const useDeleteDatabase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDatabase,
    onSuccess: (_, deletedId) => {
      // Optimistically update the cache
      queryClient.setQueryData<Database[]>(DATA_SOURCES_QUERY_KEY, (old) => 
        old ? old.filter(d => d.id !== deletedId) : []
      );
      toast.success('Data source deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting database:', error);
      toast.error('Failed to delete data source');
    },
  });
};

export const useTestDatabaseConnection = () => {
  return useMutation({
    mutationFn: testDatabaseConnection,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Connection successful${result.latency ? ` (${result.latency}ms)` : ''}`);
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    },
    onError: (error) => {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
    },
  });
};

// Types for DynamoDB discovery
export type DiscoveredDatabase = {
  name: string;
  arn?: string;
  status: string;
  item_count?: number;
  size_bytes?: number;
  creation_date?: string;
  billing_mode?: string;
  region: string;
  error?: string;
};

export type DiscoverDynamoDBInput = {
  credential_id: string;
  region?: string;
};

export type DiscoverDynamoDBResponse = {
  databases: DiscoveredDatabase[];
  dataSources: DiscoveredDatabase[];
  summary: {
    total_tables: number;
    described_tables: number;
    has_more: boolean;
    region: string;
    credential_id: string;
  };
  failed?: Array<{ error: string }>;
};

// Discover DynamoDB tables
const discoverDynamoDBDatabases = async (input: DiscoverDynamoDBInput): Promise<DiscoverDynamoDBResponse> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/data-sources/discover/dynamodb',
    options: {
      body: input
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as DiscoverDynamoDBResponse;
};

export const useDiscoverDynamoDBDatabases = () => {
  return useMutation({
    mutationFn: discoverDynamoDBDatabases,
    onError: (error) => {
      console.error('Error discovering DynamoDB databases:', error);
      toast.error('Failed to discover databases');
    },
  });
}; 