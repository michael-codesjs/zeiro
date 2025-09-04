"use client";

import React from 'react';
import { ChartRenderer } from "../../charts/ChartRenderer";
import { Table } from "../../charts/Table";
import { type ChartData } from "../../../hooks/use-natural-language-query";

export interface ChartProps {
  // Chart data from AI/natural language queries
  chartData?: ChartData | null;
  
  // Manual query data and state
  manualData: any[];
  isInitialLoad: boolean;
  hasPendingExecution: boolean;
  onRowSelect?: (selectedRows: Set<number>) => void;
  
  // Metadata for manual queries
  metadata?: {
    count?: number;
    scannedCount?: number;
    operation?: string;
    timeTaken?: number;
  };
}

export default function Chart({
  chartData,
  manualData,
  isInitialLoad,
  hasPendingExecution,
  onRowSelect,
  metadata,
}: ChartProps) {
  // Check if we have AI results first
  const hasAIResults = !!(chartData && chartData.data?.length > 0);
  
  // Check if the chart renderer is already showing a table
  const chartIsShowingTable = chartData?.chartType === 'Table';

  // Get current items but exclude AI results
  const getFilteredItems = () => {
    if (hasAIResults) return [];
    return manualData;
  };

  return (
    <>
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
        ) : getFilteredItems().length === 0 ? (
          // Show empty state when no data
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
            data={getFilteredItems()}
            showSelection={true}
            showTypeIcons={true}
            onRowSelect={onRowSelect}
            metadata={metadata}
          />
        )}
      </div>
    </>
  );
}
