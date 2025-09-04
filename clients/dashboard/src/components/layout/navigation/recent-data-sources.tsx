"use client";

import { useDataSources, type DataSource, type DataSourceType } from "@/hooks/use-data-sources";
import { getDataSourceImageUrl, getDataSourceImageAlt } from "@/utils/data-source-utils";

interface RecentDataSourceConnectionsProps {
  sidebarCollapsed: boolean;
  onDataSourceSelect?: (dataSource: DataSource) => void;
}

export default function RecentDataSourceConnections({ 
  sidebarCollapsed, 
  onDataSourceSelect 
}: RecentDataSourceConnectionsProps) {
  const { data: dataSources = [], isLoading, error } = useDataSources();

  // Get the 5 most recently accessed data sources (or 5 most recent if no last_accessed)
  const recentDataSources = dataSources
    .sort((a, b) => {
      const aTime = a.last_accessed || a.updated_at;
      const bTime = b.last_accessed || b.updated_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 5);

  const getDataSourceIcon = (type: DataSourceType) => {
    return (
      <div className="w-6 h-6 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center p-1 border border-slate-200 dark:border-slate-600">
        <img 
          src={getDataSourceImageUrl(type)} 
          alt={getDataSourceImageAlt(type)}
          className="w-4 h-4 object-contain"
        />
      </div>
    );
  };

  const getMetadataText = (dataSource: DataSource) => {
    if (dataSource.type === 'DynamoDB') {
      const itemCount = dataSource.connection_config?.item_count || 
                       dataSource.metadata?.item_count || 
                       0;
      return `${dataSource.type} • ${itemCount.toLocaleString()} items`;
    }
    
    // For other data source types, show type and table/collection count
    const count = dataSource.metadata?.table_count || 
                  dataSource.metadata?.collection_count || 
                  0;
    const unit = dataSource.type === 'MongoDB' ? 'collections' : 'tables';
    return `${dataSource.type} • ${count.toLocaleString()} ${unit}`;
  };

  const handleDataSourceClick = (dataSource: DataSource) => {
    if (onDataSourceSelect) {
      onDataSourceSelect(dataSource);
    }
  };

  if (isLoading) {
    return (
      <div className={sidebarCollapsed ? "space-y-1" : "bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3"}>
        <div className={sidebarCollapsed ? "" : "space-y-1"}>
          {/* Loading skeleton */}
          {[...Array(5)].map((_, index) => (
          <div key={index} className={`flex items-center h-11 ${
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}>
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded-lg animate-pulse"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 ml-3">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-1.5"></div>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse w-2/3"></div>
              </div>
            )}
          </div>
        ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={sidebarCollapsed ? "" : "bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3"}>
        <div className={`text-center py-2 ${sidebarCollapsed ? 'px-1' : 'px-2'}`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
              {sidebarCollapsed ? '⚠️' : 'Failed to load data sources'}
            </p>
        </div>
      </div>
    );
  }

    if (recentDataSources.length === 0) {
    return (
      <div className={sidebarCollapsed ? "h-full flex items-center justify-center" : "bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 h-full flex items-center justify-center"}>
        <div className={`text-center py-2 ${sidebarCollapsed ? 'px-1' : 'px-1'}`}>
          {!sidebarCollapsed && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Your data sources will appear here
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={sidebarCollapsed ? "space-y-1" : "bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3"}>
      <div className={sidebarCollapsed ? "" : "space-y-1"}>
        {recentDataSources.map((dataSource) => (
        <div
          key={dataSource.id}
          onClick={() => handleDataSourceClick(dataSource)}
          className={`flex items-center h-11 transition-all duration-200 cursor-pointer group ${
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <div className="flex-shrink-0">
            {getDataSourceIcon(dataSource.type)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors duration-200">
                {dataSource.name}
              </p>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 truncate group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200">
                {getMetadataText(dataSource)}
              </p>
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
} 