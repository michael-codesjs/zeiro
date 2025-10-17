import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from 'aws-amplify/api';
import { toast } from 'react-hot-toast';

export type DataSourceType = 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'Cassandra' | 'InfluxDB' | 'Elasticsearch';

export type DataSourceConnectionConfig = {
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

export type DataSourceMetadata = {
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

export type DataSource = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: DataSourceType;
  credential_id: string;
  connection_config: DataSourceConnectionConfig;
  auto_connect: boolean;
  created_at: string;
  updated_at: string;
  last_accessed?: string;
};

export type CreateDataSourceInput = Omit<DataSource, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_accessed'>;

const DATA_SOURCES_QUERY_KEY = ['data-sources'];

// Fetch data sources
const fetchDataSources = async (): Promise<DataSource[]> => {
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
  const data = await response.body.json() as unknown as { dataSources: DataSource[] };
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

export type DataSourceWithData = {
  dataSource: DataSource;
  schema: TableSchema | null;
};

// Fetch individual data source with data
const fetchDataSourceWithData = async (id: string): Promise<DataSourceWithData> => {
  const restOperation = get({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}`,
  });
  
  const response = await restOperation.response;
  const data = await response.body.json() as unknown as DataSourceWithData;
  return data;
};

// Create data source
const createDataSource = async (newDataSource: CreateDataSourceInput): Promise<DataSource> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: '/data-sources',
    options: {
      body: newDataSource
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as DataSource;
};

// Update data source
const updateDataSource = async (id: string, updatedDataSource: Partial<CreateDataSourceInput>): Promise<DataSource> => {
  const restOperation = post({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}`,
    options: {
      body: updatedDataSource
    }
  });
  
  const response = await restOperation.response;
  return await response.body.json() as unknown as DataSource;
};

// Delete data source
const deleteDataSource = async (id: string): Promise<void> => {
  const restOperation = del({
    apiName: 'zeiro-api',
    path: `/data-sources/${id}`,
  });
  
  await restOperation.response;
};

// Test data source connection
const testDataSourceConnection = async (id: string): Promise<{ success: boolean; message: string; latency?: number }> => {
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
    queryFn: fetchDataSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch individual data source with data
export const useDataSourceWithData = (id: string | null) => {
  return useQuery({
    queryKey: ['data-source-fetch', id],
    queryFn: () => fetchDataSourceWithData(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter than list since data can change)
  });
};

export const useCreateDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: (newDataSource) => {
      // Optimistically update the cache
      queryClient.setQueryData<DataSource[]>(DATA_SOURCES_QUERY_KEY, (old) => 
        old ? [...old, newDataSource] : [newDataSource]
      );
      toast.success('Data source created successfully');
    },
    onError: (error) => {
      console.error('Error creating data source:', error);
      toast.error('Failed to create data source');
    },
  });
};

export const useUpdateDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDataSourceInput> }) => updateDataSource(id, data),
    onSuccess: (updatedDataSource) => {
      // Optimistically update the cache
      queryClient.setQueryData<DataSource[]>(DATA_SOURCES_QUERY_KEY, (old) => 
        old ? old.map(d => d.id === updatedDataSource.id ? updatedDataSource : d) : [updatedDataSource]
      );
      toast.success('Data source updated successfully');
    },
    onError: (error) => {
      console.error('Error updating data source:', error);
      toast.error('Failed to update data source');
    },
  });
};

export const useDeleteDataSource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDataSource,
    onSuccess: (_, deletedId) => {
      // Optimistically update the cache
      queryClient.setQueryData<DataSource[]>(DATA_SOURCES_QUERY_KEY, (old) => 
        old ? old.filter(d => d.id !== deletedId) : []
      );
      toast.success('Data source deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting data source:', error);
      toast.error('Failed to delete data source');
    },
  });
};

export const useTestDataSourceConnection = () => {
  return useMutation({
    mutationFn: testDataSourceConnection,
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
export type DiscoveredDataSource = {
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
  databases: DiscoveredDataSource[];
  dataSources: DiscoveredDataSource[];
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
const discoverDynamoDBDataSources = async (input: DiscoverDynamoDBInput): Promise<DiscoverDynamoDBResponse> => {
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

export const useDiscoverDynamoDBDataSources = () => {
  return useMutation({
    mutationFn: discoverDynamoDBDataSources,
    onError: (error) => {
      console.error('Error discovering DynamoDB data sources:', error);
      toast.error('Failed to discover data sources');
    },
  });
};

// Backward compatibility aliases
export const useDatabases = useDataSources;
export const useCreateDatabase = useCreateDataSource;
export const useUpdateDatabase = useUpdateDataSource;
export const useDeleteDatabase = useDeleteDataSource;
export const useTestDatabaseConnection = useTestDataSourceConnection;
export const useDiscoverDynamoDBDatabases = useDiscoverDynamoDBDataSources;
export const useDataSourceWithSchema = useDataSourceWithData;

// Type aliases for backward compatibility
export type DatabaseType = DataSourceType;
export type DatabaseConnectionConfig = DataSourceConnectionConfig;
export type DatabaseMetadata = DataSourceMetadata;
export type Database = DataSource;
export type CreateDatabaseInput = CreateDataSourceInput;
export type DiscoveredDatabase = DiscoveredDataSource;
export type DataSourceWithSchema = DataSourceWithData; 