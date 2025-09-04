import { useState, useEffect } from 'react';
import { useCreateDynamodbQuery, buildScanQuery, type FilterCondition } from './use-manual-query';
import { useQueryResultsStore, mapWebSocketMessageToStoreUpdate } from './use-query-results-store';
import { useWebSocketStore } from '../stores/websocket-store';
import { type Database } from './use-data-sources';

export const useDataViewerQuery = (database: Database | null | undefined) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [applyVersion, setApplyVersion] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const createQuery = useCreateDynamodbQuery();
  const {
    results,
    activeExecutionId,
    setActiveExecution,
    upsertPending,
    upsertQueued,
    upsertExecuting,
    upsertCompleted,
    upsertFailed,
  } = useQueryResultsStore();

  // WebSocket subscription: update global results store
  const execution_results = useWebSocketStore(state => state.execution_results);
  
  useEffect(() => {
    if (execution_results.length === 0) return;
    
    // Get the latest result
    const latestMessage = execution_results[execution_results.length - 1];
    
    // Update results store
    mapWebSocketMessageToStoreUpdate(latestMessage, {
      upsertQueued,
      upsertExecuting,
      upsertCompleted,
      upsertFailed,
    });

    // Set initial load to false when any query completes (success or failure)
    if (latestMessage.payload?.status === 'executed' || latestMessage.payload?.status === 'failed') {
      setIsInitialLoad(false);
    }
  }, [execution_results, upsertQueued, upsertExecuting, upsertCompleted, upsertFailed]);

  // Initial load: when a data source is selected, kick off a simple scan
  useEffect(() => {
    if (!database) return;

    // Reset to initial loading state and clear any previous active execution
    setIsInitialLoad(true);
    setActiveExecution(null);

    const params = buildScanQuery(database.id, database.name, { limit: 25 });

    (async () => {
      try {
        const createResult = await createQuery.mutateAsync(params);
        if (createResult.success && createResult.data) {
          const { execution_id, operation } = createResult.data;
          upsertPending(execution_id, operation);
          setActiveExecution(execution_id);
          // The mutation auto-executes; status updates come via WebSocket
        } else {
          throw new Error(createResult.error || 'Failed to create initial scan');
        }
      } catch (error) {
        console.error('Initial scan failed:', error);
        setIsInitialLoad(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database?.id]);

  // Execute manual query with filters
  const executeManualQuery = async (validFilters: FilterCondition[]) => {
    console.log('🚀 executeManualQuery called!');
    if (!database) {
      console.log('❌ No database selected');
      return;
    }

    if (validFilters.length === 0) {
      setActiveExecution(null);
      setSelectedRows(new Set());
      return;
    }

    // Clear previous execution and trigger effect
    setActiveExecution(null);
    setApplyVersion(v => v + 1);
  };

  // Clear manual query results and return to default view
  const clearManualQuery = () => {
    setSelectedRows(new Set());
    setActiveExecution(null);
  };

  // On apply trigger, create and execute manual query (mutation already executes)
  useEffect(() => {
    if (!database) return;
    if (applyVersion === 0) return;

    // This will be called from the component with valid filters
    // We need to pass the filters from the component
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyVersion, database?.id]);

  // Execute query with specific filters
  const executeQueryWithFilters = async (validFilters: FilterCondition[]) => {
    if (!database || validFilters.length === 0) return;

    const queryParams = buildScanQuery(database.id, database.name, {
      filters: validFilters,
      limit: 50,
    });

    try {
      const createResult = await createQuery.mutateAsync(queryParams);
      if (createResult.success && createResult.data) {
        const { execution_id, operation } = createResult.data;
        upsertPending(execution_id, operation);
        setActiveExecution(execution_id);
        // The mutation executed the query; queue status will arrive via WebSocket
      } else {
        throw new Error(createResult.error || 'Failed to create query');
      }
    } catch (error) {
      console.error('Manual query failed:', error);
      alert(`Filter failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setActiveExecution(null);
    }
  };

  // Current execution result from store
  const activeResult = activeExecutionId ? results[activeExecutionId] : undefined;

  // Get current items (either from execution result; no base table fetch)
  const getCurrentItems = () => {
    if (activeResult?.data && activeResult.data.length > 0) return activeResult.data;
    return [];
  };

  // Check if there's a pending execution (should show spinner instead of empty state)
  const hasPendingExecution = activeResult && ['pending_approval', 'queued', 'executing'].includes(activeResult.status);

  const handleRowSelect = (selectedRowsSet: Set<number>) => {
    setSelectedRows(selectedRowsSet);
  };

  return {
    selectedRows,
    isInitialLoad,
    activeResult,
    hasPendingExecution,
    executeManualQuery,
    executeQueryWithFilters,
    clearManualQuery,
    getCurrentItems,
    handleRowSelect,
    results,
    activeExecutionId,
  };
};
