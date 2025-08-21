"use client";

import React, { useState, useMemo } from 'react';
import { Button, Input } from "../../ui";
import { useCreateDynamodbQuery, type FilterCondition, buildScanQuery } from "../../../hooks/use-manual-query";
import { type Database, useDataSourceWithSchema } from "../../../hooks/use-data-sources";
import { ChartRenderer } from "../../charts/ChartRenderer";
import { Table } from "../../charts/Table";
import { type ChartData } from "../../../hooks/use-natural-language-query";
import { useWebSocketStore } from "../../../stores/websocket-store";
import { useQueryResultsStore, mapWebSocketMessageToStoreUpdate } from "../../../hooks/use-query-results-store";

interface ColumnInfo {
  key: string;
  type: string;
  isKey: boolean;
}

interface DataViewerProps {
  database: Database;
  chartData?: ChartData | null;
}

export default function DataViewer({ database, chartData }: DataViewerProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<(FilterCondition & { enabled: boolean })[]>([]);
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

  // Fetch schema for the selected data source
  const { data: dataSourceWithSchema, isLoading: schemaLoading } = useDataSourceWithSchema(database?.id || null);

  // Helper function to infer data type
  const inferType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  // Helper function to get nested values using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper function to detect if a column is a key (partition key or GSI key)
  const isKeyColumn = (columnName: string): boolean => {
    const keyPatterns = [
      /^PK$/i,           // Partition Key
      /^SK$/i,           // Sort Key
      /^GSI\d*PK$/i,     // GSI Partition Key (GSI1PK, GSI2PK, etc.)
      /^GSI\d*SK$/i,     // GSI Sort Key (GSI1SK, GSI2SK, etc.)
      /^id$/i,           // Common ID field
      /.*[Ii]d$/,        // Fields ending with 'id' or 'Id'
      /.*[Kk]ey$/        // Fields ending with 'key' or 'Key'
    ];
    
    return keyPatterns.some(pattern => pattern.test(columnName));
  };

  // Helper function to determine the display order of key columns
  const getKeyOrder = (columnName: string): number => {
    if (/^PK$/i.test(columnName)) return 1;        // Primary partition key first
    if (/^SK$/i.test(columnName)) return 2;        // Primary sort key second
    if (/^GSI1PK$/i.test(columnName)) return 3;    // GSI1 partition key
    if (/^GSI1SK$/i.test(columnName)) return 4;    // GSI1 sort key
    if (/^GSI2PK$/i.test(columnName)) return 5;    // GSI2 partition key
    if (/^GSI2SK$/i.test(columnName)) return 6;    // GSI2 sort key
    if (/^GSI\d+PK$/i.test(columnName)) return 7;  // Other GSI partition keys
    if (/^GSI\d+SK$/i.test(columnName)) return 8;  // Other GSI sort keys
    if (/^id$/i.test(columnName)) return 9;        // ID fields
    if (/.*[Ii]d$/.test(columnName)) return 10;    // Other ID fields
    if (/.*[Kk]ey$/.test(columnName)) return 11;   // Other key fields
    return 12; // Fallback for other keys
  };

  // Extract column information from schema or fallback to current result
  const columns = useMemo((): ColumnInfo[] => {
    // First priority: Use schema from get-data-source endpoint
    if (dataSourceWithSchema?.schema?.discoveredFields && dataSourceWithSchema.schema.discoveredFields.length > 0) {
      const schemaFields = dataSourceWithSchema.schema.discoveredFields;
      
      // Sort fields by importance (keys first, then alphabetical)
      const sortedFields = [...schemaFields].sort((a, b) => {
        const aIsKey = a.isKey || false;
        const bIsKey = b.isKey || false;

        // Keys come first
        if (aIsKey && !bIsKey) return -1;
        if (!aIsKey && bIsKey) return 1;

        // Within keys, sort by key hierarchy
        if (aIsKey && bIsKey) {
          const aOrder = getKeyOrder(a.name);
          const bOrder = getKeyOrder(b.name);
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        // For non-keys, alphabetical order
        return a.name.localeCompare(b.name);
      });

      return sortedFields.map(field => ({
        key: field.name,
        type: field.type,
        isKey: field.isKey || false
      }));
    }

    // Second priority: Use discovered fields from metadata (legacy)
    const discoveredTables = database?.metadata?.discovered_tables;
    if (discoveredTables && Object.keys(discoveredTables).length > 0) {
      // Extract all unique field names from all discovered tables
      const allFields = new Set<string>();
      const fieldDetails: Record<string, { type: string; frequency: number }> = {};

      Object.values(discoveredTables).forEach(tableInfo => {
        tableInfo.discovered_fields.forEach(field => {
          allFields.add(field.name);
          // Keep the field with highest frequency if there are duplicates across tables
          if (!fieldDetails[field.name] || field.frequency > fieldDetails[field.name].frequency) {
            fieldDetails[field.name] = {
              type: field.type,
              frequency: field.frequency
            };
          }
        });
      });

      // Sort fields by importance (keys first, then by frequency)
      const sortedFields = Array.from(allFields).sort((a, b) => {
        const aIsKey = isKeyColumn(a);
        const bIsKey = isKeyColumn(b);

        // Keys come first
        if (aIsKey && !bIsKey) return -1;
        if (!aIsKey && bIsKey) return 1;

        // Within keys, sort by key hierarchy
        if (aIsKey && bIsKey) {
          const aOrder = getKeyOrder(a);
          const bOrder = getKeyOrder(b);
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        // Within same category, sort by frequency (higher first)
        return fieldDetails[b].frequency - fieldDetails[a].frequency;
      });

      return sortedFields.map(fieldName => ({
        key: fieldName,
        type: fieldDetails[fieldName].type,
        isKey: isKeyColumn(fieldName)
      }));
    }

    // Fallback: Extract from current result data
    const items = activeExecutionId ? results[activeExecutionId]?.data || [] : [];
    if (!items.length) return [];

    const allKeys = new Set<string>();

    // Get only top-level keys from all items (no nested flattening)
    items.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => {
          allKeys.add(key);
        });
      }
    });

    // Convert to array and sort by key importance
    const columnArray = Array.from(allKeys).map(key => ({
      key,
      type: inferType(items[0]?.[key]),
      isKey: isKeyColumn(key)
    }));

    // Sort columns: keys first, then regular columns
    return columnArray.sort((a, b) => {
      // Primary keys and GSI keys come first
      if (a.isKey && !b.isKey) return -1;
      if (!a.isKey && b.isKey) return 1;
      
      // Within keys, sort by specific key hierarchy
      if (a.isKey && b.isKey) {
        const aOrder = getKeyOrder(a.key);
        const bOrder = getKeyOrder(b.key);
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      
      // For non-keys, alphabetical order
      return a.key.localeCompare(b.key);
    });
  }, [dataSourceWithSchema?.schema?.discoveredFields, database?.metadata?.discovered_tables, activeExecutionId, results]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '∅';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string':
        return <span className="text-blue-600">Aa</span>;
      case 'number':
        return <span className="text-green-600">123</span>;
      case 'boolean':
        return <span className="text-purple-600">⊤⊥</span>;
      case 'array':
        return <span className="text-orange-600">[]</span>;
      case 'object':
        return <span className="text-red-600">{}</span>;
      default:
        return <span className="text-slate-400">?</span>;
    }
  };

  const handleRowSelect = (selectedRowsSet: Set<number>) => {
    setSelectedRows(selectedRowsSet);
  };

  // Check if we have AI results first
  const hasAIResults = !!(chartData && chartData.data?.length > 0);
  
  // Check if the chart renderer is already showing a table
  const chartIsShowingTable = chartData?.chartType === 'Table';

  // Current execution result from store
  const activeResult = activeExecutionId ? results[activeExecutionId] : undefined;

  // Get current items (either from execution result; no base table fetch)
  const getCurrentItems = () => {
    if (hasAIResults) return [];
    if (activeResult?.data && activeResult.data.length > 0) return activeResult.data;
    return [];
  };

  // Add a new filter
  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '', enabled: true }]);
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters.length === 0 ? [{ field: '', operator: 'equals', value: '', enabled: true }] : newFilters);
  };

  // Update a filter
  const updateFilter = (index: number, updates: Partial<FilterCondition & { enabled: boolean }>) => {
    setFilters(filters.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  };

  // On mount and whenever filters are empty, ensure at least one filter exists
  React.useEffect(() => {
    if (filters.length === 0) {
      setFilters([{ field: '', operator: 'equals', value: '', enabled: true }]);
    }
  }, [filters]);

  // Apply filters: trigger useEffect to create+execute query
  const executeManualQuery = async () => {
    console.log('🚀 executeManualQuery called!');
    if (!database) {
      console.log('❌ No database selected');
      return;
    }

    const validFilters = filters.filter(f => {
      if (!f.enabled || !f.field || !f.operator) return false;
      if (["exists", "not_exists"].includes(f.operator)) return true;
      if (["between", "in"].includes(f.operator)) {
        return f.values && f.values.length > 0 && f.values.every(v => v !== "");
      }
      return f.value !== "" && f.value !== null && f.value !== undefined;
    });

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
    setFilters([]);
    setSelectedRows(new Set());
    setActiveExecution(null);
  };

  // WebSocket subscription: update global results store
  const execution_results = useWebSocketStore(state => state.execution_results);
  
  React.useEffect(() => {
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
  React.useEffect(() => {
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

  // On apply trigger, create and execute manual query (mutation already executes)
  React.useEffect(() => {
    if (!database) return;
    if (applyVersion === 0) return;

    const validFilters = filters.filter(f => {
      if (!f.enabled || !f.field || !f.operator) return false;
      if (["exists", "not_exists"].includes(f.operator)) return true;
      if (["between", "in"].includes(f.operator)) {
        return f.values && f.values.length > 0 && f.values.every(v => v !== "");
      }
      return f.value !== "" && f.value !== null && f.value !== undefined;
    });

    if (validFilters.length === 0) {
      return;
    }

    const queryParams = buildScanQuery(database.id, database.name, {
      filters: validFilters,
      limit: 50,
    });

    (async () => {
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
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyVersion, database?.id]);

  // Add keyboard shortcut for CTRL+F
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (filters.length > 0) {
          setFilters([]);
        } else {
          addFilter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filters]);

  const items = getCurrentItems();
  const tableInfo = undefined;
  const isManualQuery = !!activeResult && activeResult.status !== 'failed';
  
  // Check if there's a pending execution (should show spinner instead of empty state)
  const hasPendingExecution = activeResult && ['pending_approval', 'queued', 'executing'].includes(activeResult.status);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header - Always show filter interface */}
      <div className="w-full flex flex-col px-4 py-2 border-b border-slate-200 relative z-10">
        {/* Schema loading indicator */}
        {schemaLoading && (
          <div className="mb-2 text-xs text-slate-500 flex items-center space-x-2">
            <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            <span>Loading schema...</span>
          </div>
        )}
        
        {/* Schema status indicator */}
        {!schemaLoading && dataSourceWithSchema?.schema && (
          <div className="mb-2 text-xs text-green-600 flex items-center space-x-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Schema loaded ({dataSourceWithSchema.schema.discoveredFields.length} fields)</span>
          </div>
        )}
          {/* Filter Interface */}
          <div className="w-full space-y-2">
            {/* Filter Controls */}
            <div className="flex items-center justify-between mb-2">
              {/* Empty space for layout */}
              <div></div>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
              </div>
            </div>
            {filters.map((filter, index) => (
              <div key={index} className="w-full flex items-center space-x-2 overflow-visible">
                {/* Enable/Disable Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.enabled}
                    onChange={(e) => updateFilter(index, { enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>

                {/* Field Selection */}
                <div className="min-w-[100px] max-w-[120px]">
                  <select
                    value={filter.field}
                    onChange={(e) => updateFilter(index, { field: e.target.value })}
                    className="w-full h-6 px-2 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Field</option>
                    {columns.map((column) => (
                      <option key={column.key} value={column.key}>
                        {column.key}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operator Selection */}
                <div className="min-w-[100px] max-w-[120px]">
                  <select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                    className="w-full h-6 px-2 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Operator</option>
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="not_contains">Not Contains</option>
                    <option value="begins_with">Begins With</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="greater_equal">Greater Equal</option>
                    <option value="less_equal">Less Equal</option>
                    <option value="between">Between</option>
                    <option value="in">In</option>
                    <option value="exists">Exists</option>
                    <option value="not_exists">Not Exists</option>
                  </select>
                </div>

                {/* Value Input */}
                {!["exists", "not_exists"].includes(filter.operator) && (
                  <div className="flex-1 min-w-[100px]">
                    {["between", "in"].includes(filter.operator) ? (
                      <Input
                        type="text"
                        value={filter.values?.join(", ") || ""}
                        onChange={(e) => updateFilter(index, { values: e.target.value.split(", ").map(v => v.trim()) })}
                        placeholder={filter.operator === "between" ? "value1, value2" : "value1, value2, value3"}
                        size="xs"
                      />
                    ) : (
                      <Input
                        type="text"
                        value={filter.value || ""}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        placeholder="Value"
                        size="xs"
                      />
                    )}
                  </div>
                )}

                {/* Remove Filter Button */}
                <button
                  onClick={() => removeFilter(index)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove filter"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex items-center space-x-2 mt-3">
              <button
                type="button"
                onClick={addFilter}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Add Filter
              </button>
              <button
                type="button"
                onClick={clearManualQuery}
                className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={executeManualQuery}
                disabled={hasPendingExecution}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  hasPendingExecution
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-800'
                }`}
              >
                {hasPendingExecution ? 'Applying...' : 'Apply All'}
              </button>
            </div>
          </div>
        </div>

      {/* Chart Data Display */}
      {chartData && (
        <div className="w-full p-4 border-b border-slate-200 bg-slate-50">
          <div className="max-w-full">
            <ChartRenderer chartData={chartData} />
          </div>
        </div>
      )}

      {/* Table - Use Table component */}
      <div className="flex-1 overflow-hidden">
        {hasAIResults && !chartIsShowingTable ? (
          // Show AI results using Table (no selection, with type icons, no metadata bar)
          // Only when chart renderer is NOT showing a table to avoid duplicates
          <Table
            data={chartData!.data || []}
            showSelection={false}
            showTypeIcons={true}
          />
        ) : hasAIResults && chartIsShowingTable ? (
          // Chart renderer is already showing the table, show nothing
          <div className="hidden"></div>
        ) : isInitialLoad || hasPendingExecution ? (
          // Show spinner when initially loading or when there's a pending execution
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 text-slate-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-900">No data</h3>
              <p className="text-sm text-slate-500">Get started by adjusting your filters.</p>
            </div>
          </div>
        ) : (
          // Show manual query results using Table (with selection, with type icons, with metadata bar)
          <Table
            data={items}
            showSelection={true}
            showTypeIcons={true}
            onRowSelect={handleRowSelect}
            metadata={{
              count: activeResult?.metadata?.count || items.length,
              scannedCount: activeResult?.metadata?.scanned_count,
              operation: activeResult?.metadata?.operation,
              timeTaken: activeResult?.metadata?.time_taken_ms
            }}
          />
        )}
      </div>
    </div>
  );
} 