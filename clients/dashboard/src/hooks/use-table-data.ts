import { useQuery } from '@tanstack/react-query';
import { post } from 'aws-amplify/api';
import { type Database } from './use-data-sources';
import { type ManualQueryParams, type CreateDynamodbQueryResponse } from './use-manual-query';
import { useQueryResultsStore } from './use-query-results-store';

export interface TableDataItem {
  [key: string]: any;
}

export interface TableDataResponse {
  success: boolean;
  data?: {
    items: TableDataItem[];
    count: number;
    scannedCount: number;
    lastEvaluatedKey?: Record<string, any>;
    tableInfo?: {
      tableName: string;
      keySchema: Array<{
        attributeName: string;
        keyType: 'HASH' | 'RANGE';
      }>;
      attributes: Array<{
        name: string;
        type: string;
      }>;
      itemCount?: number;
      tableStatus: string;
    };
  };
  error?: string;
}

const fetchTableData = async (database: Database, limit: number = 25): Promise<TableDataResponse> => {
  // 1) Create a manual scan execution for initial data
  const queryParams: ManualQueryParams = {
    database_id: database.id,
    operation: 'scan',
    table_name: database.name,
    limit,
  };

  const createOp = post({
    apiName: 'zeiro-api',
    path: '/executions/create-dynamodb-query',
    options: { body: queryParams as any },
  });

  const createRes = await createOp.response;
  const createJson = (await createRes.body.json()) as unknown as CreateDynamodbQueryResponse;

  if (!createJson.success || !createJson.data) {
    return { success: false, error: createJson.error || 'Failed to create initial execution' };
  }

  const executionId = createJson.data.execution_id;

  // Update global results store: mark pending and set active execution
  const store = useQueryResultsStore.getState();
  store.upsertPending(executionId, createJson.data.operation);
  store.setActiveExecution(executionId);

  // 2) Execute the created execution to start async processing
  const executeOp = post({
    apiName: 'zeiro-api',
    path: '/executions/execute',
    options: { body: { execution_id: executionId } as any },
  });

  const executeRes = await executeOp.response;
  const executeJson = (await executeRes.body.json()) as unknown as { success: boolean; error?: string };

  if (executeJson.success) {
    store.upsertQueued(executionId);
  }

  // We deliberately return without data; the UI will render once the WebSocket updates the store
  return { success: true };
};

export const useTableData = (database: Database | null, limit: number = 25) => {
  return useQuery({
    queryKey: ['table-data', database?.id, limit],
    queryFn: () => fetchTableData(database!, limit),
    enabled: !!database,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}; 