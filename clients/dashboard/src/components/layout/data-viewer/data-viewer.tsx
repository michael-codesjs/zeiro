"use client";

import React, { useState } from 'react';
import { useDataSourceWithData } from "../../../hooks/use-data-sources";
import { type ChartData } from "../../../hooks/use-natural-language-query";
import { useSelectedDataSourceStore } from "../../../hooks/use-selected-data-source-store";
import { useDataViewerColumns } from "../../../hooks/use-data-viewer-columns";
import { useDataViewerQuery } from "../../../hooks/use-data-viewer-query";
import Filters, { getValidFilters, type Filter } from "./filters";
import Chart from "./chart";

interface DataViewerProps {
  chartData?: ChartData | null;
}

export default function DataViewer({ chartData }: DataViewerProps) {
  // Get selected data source from store
  const { selectedDataSource } = useSelectedDataSourceStore();

  // Fetch data for the selected data source
  const { data: dataSourceData, isLoading: loading, error } = useDataSourceWithData(selectedDataSource?.id || null);


  
  // Use the fetched data source - no fallback to store
  const database = dataSourceData?.dataSource;

  // Simple filters state
  const [filters, setFilters] = useState<Filter[]>([]);

  const {
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
  } = useDataViewerQuery(database);

  const { columns } = useDataViewerColumns(
    dataSourceData,
    database,
    activeExecutionId,
    results
  );

  // Create hierarchical field structure
  const createHierarchicalFields = () => {
    const fieldMap = new Map<string, string[]>();
    
    columns.forEach(col => {
      const parts = col.key.split('.');
      if (parts.length > 1) {
        // This is a nested field
        const parent = parts[0];
        const child = parts.slice(1).join('.');
        
        if (!fieldMap.has(parent)) {
          fieldMap.set(parent, []);
        }
        fieldMap.get(parent)!.push(child);
      } else {
        // This is a top-level field
        if (!fieldMap.has(col.key)) {
          fieldMap.set(col.key, []);
        }
      }
    });
    
    return fieldMap;
  };

  const hierarchicalFields = createHierarchicalFields();

  // Convert simple filters to FilterCondition format for the API
  const convertToFilterConditions = (simpleFilters: Filter[]) => {
    return getValidFilters(simpleFilters).map(filter => ({
      field: filter.key,
      operator: filter.operator as any,
      value: Array.isArray(filter.value) ? undefined : filter.value,
      values: Array.isArray(filter.value) ? filter.value : undefined,
    }));
  };

  // Handle manual query execution
  const handleExecuteManualQuery = async () => {
    const validFilterConditions = convertToFilterConditions(filters);
    
    if (validFilterConditions.length > 0) {
      await executeQueryWithFilters(validFilterConditions);
    } else {
      await executeManualQuery(validFilterConditions);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters([]);
    clearManualQuery();
  };

  const items = getCurrentItems();

  // Show error state if data source fetch failed
  if (error || (selectedDataSource && !loading && !dataSourceData)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900">Data source unavailable</h3>
          <p className="text-sm text-slate-500">
            {error 
              ? "Failed to load data source. It may have been deleted or you may not have access."
              : "The selected data source could not be found."
            }
          </p>
        </div>
      </div>
    );
  }

  // Show loading state if no selected data source yet
  if (!selectedDataSource) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 text-slate-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900">No data source selected</h3>
          <p className="text-sm text-slate-500">Select a data source to start exploring your data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header - Always show filter interface */}
      <div className="w-full flex flex-col px-4 py-2 border-b border-slate-200 relative z-10">
          {/* Filter Interface */}
          <Filters
            filters={filters}
            hierarchicalFields={hierarchicalFields}
            loading={loading}
            onFiltersChange={setFilters}
            onApplyFilters={handleExecuteManualQuery}
            onClearFilters={handleClearFilters}
          />
        </div>

      {/* Chart and Table Display */}
      <Chart
        chartData={chartData}
        manualData={items}
        isInitialLoad={isInitialLoad}
        hasPendingExecution={hasPendingExecution}
        onRowSelect={handleRowSelect}
        metadata={{
          count: activeResult?.metadata?.count || items.length,
          scannedCount: activeResult?.metadata?.scanned_count,
          operation: activeResult?.metadata?.operation,
          timeTaken: activeResult?.metadata?.time_taken_ms
        }}
      />
    </div>
  );
}
