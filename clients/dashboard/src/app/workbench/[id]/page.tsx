"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDataSourceWithData, type DataSource } from "../../../hooks/use-data-sources";
import { type ChartData } from "../../../hooks/use-natural-language-query";
import DataSourceSelector from "../../(workbench)/data-source-selector";
import AiChat from "../../(workbench)/ai-chat";
import { DataViewer } from "../../../components/layout/data-viewer";
import { Button } from "../../../components/ui";
import WebSocketProvider from "../../../providers/websocket-provider";

interface WorkbenchPageProps {
  params: { id: string };
}

function WorkbenchContent({ params }: WorkbenchPageProps) {
  const router = useRouter();
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [triggerSelectorOpen, setTriggerSelectorOpen] = useState(false);
  
  // Fetch the specific data source by ID
  const { data: dataSourceData, isLoading, error } = useDataSourceWithData(params.id);
  const selectedDataSource = dataSourceData?.dataSource || null;

  // Handle data source change from selector
  const handleDataSourceChange = (dataSource: DataSource | null) => {
    if (dataSource) {
      // Navigate to the new data source workbench
      router.push(`/workbench/${dataSource.id}`);
    } else {
      // No data source selected, go back to main dashboard
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  if (error || !selectedDataSource) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Data source not found</h2>
          <p className="text-slate-500 mb-4">
            The requested data source could not be found or no longer exists.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header with Database Selector */}
        <div className="flex items-center justify-between min-h-16 h-16 max-h-16 px-6 overflow-y-hidden">
          
          {/* Left side - Data Source Selector */}
          <div className="flex items-center">
            <DataSourceSelector
              selectedDataSource={selectedDataSource}
              onSelectDataSource={handleDataSourceChange}
              triggerOpen={triggerSelectorOpen}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setTriggerSelectorOpen(false);
                }
              }}
            />
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTriggerSelectorOpen(true)}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors underline"
            >
              Change Data Source
            </button>
          </div>
        </div>

        {/* Main Content with Data Viewer */}
        <div className="flex h-full w-full" id="main-content">
          {/* Data Viewer */}
          <div className="flex items-center justify-center p-0 w-full">
            <div className="w-full h-full overflow-x-hidden">
              <DataViewer chartData={chartData} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat */}
      <AiChat 
        isCollapsed={isChatCollapsed}
        onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
        selectedDatabase={selectedDataSource}
        onChartDataUpdate={setChartData}
      />
    </div>
  );
}

export default function WorkbenchPage({ params }: WorkbenchPageProps) {
  return (
    <WebSocketProvider>
      <WorkbenchContent params={params} />
    </WebSocketProvider>
  );
}
