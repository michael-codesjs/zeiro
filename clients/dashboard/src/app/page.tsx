"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DataSourceSelector from "./(workbench)/data-source-selector";
import AddDatasourceModal from "./(workbench)/add-datasource-modal";
import { Chat } from "../components/layout/chat";
import { DataViewer } from "../components/layout/data-viewer";
import { Button } from "../components/ui";
import { useDataSources, type DataSource } from "../hooks/use-data-sources";
import { type ChartData } from "../hooks/use-natural-language-query";
import { useSelectedDataSourceStore } from "../hooks/use-selected-data-source-store";
import { useDisclosure } from "@/hooks/use-disclosure";

export default function Dashboard() {

  const router = useRouter();
  const { selectedDataSource, setSelectedDataSource } = useSelectedDataSourceStore();
  const { data: dataSources = [] } = useDataSources();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isOpen: isChatCollapsed, onOpen: onChatOpen, onClose: onChatClose, onToggle: onChatToggle } = useDisclosure();
  const [chartData, setChartData] = useState<ChartData | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header with Database Selector and Add Button */}
        <div className="flex items-center justify-between min-h-20 px-6">
          
          {/* Left side - Data Source Selector */}
          <div className="flex items-center pt-4">
            <DataSourceSelector
              dataSources={dataSources}
              selectedDataSource={selectedDataSource}
              onSelectDataSource={setSelectedDataSource}
            />
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {selectedDataSource ? (
              <button
                onClick={() => router.push(`/data-sources/${selectedDataSource.id}`)}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors underline"
              >
                Settings
              </button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
                className="w-40"
              >
                Add Data Source
              </Button>
            )}
          </div>
        </div>

        {/* Main Content with AI Chat */}
        <div className="flex h-full w-full" id="main-content">
          {/* Main Content Area */}
          <div className="flex items-center justify-center p-0 w-full">
          {selectedDataSource ? (
            // Data Source Selected State - Show table viewer
            <div className="w-full h-full overflow-x-hidden">
              <DataViewer chartData={chartData} />
            </div>
          ) : (
            // Empty State - No Data Source Selected (clean text only)
            <div className="flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">No data source selected</h2>
                <p className="text-slate-500">
                  Choose a data source from the dropdown above to start exploring your tables and data.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Add Datasource Modal */}
        <AddDatasourceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onDataSourceCreated={setSelectedDataSource}
        />
      </div>

      {/* AI Chat */}
      <Chat 
        isCollapsed={isChatCollapsed}
        onToggleCollapse={onChatToggle}
        selectedDataSource={selectedDataSource}
        onChartDataUpdate={setChartData}
      />
    </div>
  );
}


