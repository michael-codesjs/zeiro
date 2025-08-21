"use client";

import { useDatabases, type Database, type DatabaseType } from "@/hooks/use-data-sources";

interface RecentDatabaseConnectionsProps {
  sidebarCollapsed: boolean;
  onDatabaseSelect?: (database: Database) => void;
}

export default function RecentDatabaseConnections({ 
  sidebarCollapsed, 
  onDatabaseSelect 
}: RecentDatabaseConnectionsProps) {
  const { data: databases = [], isLoading, error } = useDatabases();

  // Get the 5 most recently accessed databases (or 5 most recent if no last_accessed)
  const recentDatabases = databases
    .sort((a, b) => {
      const aTime = a.last_accessed || a.updated_at;
      const bTime = b.last_accessed || b.updated_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 5);

  const getDatabaseIcon = (type: DatabaseType, name: string) => {
    // For DynamoDB, use the actual DynamoDB logo
    if (type === 'DynamoDB') {
      return (
        <div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center p-1">
          <svg viewBox="0 0 256 289" className="w-4 h-4">
            <defs>
              <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="Gradient-0">
                <stop stopColor="#2E27AD" offset="0%"></stop>
                <stop stopColor="#527FFF" offset="100%"></stop>
              </linearGradient>
              <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="Gradient-1">
                <stop stopColor="#F58536" offset="0%"></stop>
                <stop stopColor="#F58536" offset="100%"></stop>
              </linearGradient>
            </defs>
            <path fill="url(#Gradient-0)" d="M165,0 L256,50 L256,100 L165,150 L74,100 L74,50 L165,0 Z"></path>
            <path fill="url(#Gradient-1)" d="M165,72 L256,122 L256,172 L165,222 L74,172 L74,122 L165,72 Z"></path>
            <path fill="url(#Gradient-0)" d="M165,144 L256,194 L256,244 L165,294 L74,244 L74,194 L165,144 Z"></path>
          </svg>
        </div>
      );
    }

    // For other database types, generate initials
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);

    // Database type specific colors
    const getColorClass = (type: DatabaseType) => {
      switch (type) {
        case 'PostgreSQL':
          return 'bg-blue-100 text-blue-600';
        case 'MySQL':
          return 'bg-green-100 text-green-600';
        case 'MongoDB':
          return 'bg-green-100 text-green-600';
        case 'Redis':
          return 'bg-red-100 text-red-600';
        case 'Cassandra':
          return 'bg-purple-100 text-purple-600';
        case 'InfluxDB':
          return 'bg-indigo-100 text-indigo-600';
        case 'Elasticsearch':
          return 'bg-yellow-100 text-yellow-600';
        default:
          return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getColorClass(type)}`}>
        <span className="text-xs font-semibold">{initials}</span>
      </div>
    );
  };

  const getMetadataText = (database: Database) => {
    if (database.type === 'DynamoDB') {
      const itemCount = database.connection_config?.item_count || 
                       database.metadata?.item_count || 
                       0;
      return `${database.type} • ${itemCount.toLocaleString()} items`;
    }
    
    // For other database types, show type and table/collection count
    const count = database.metadata?.table_count || 
                  database.metadata?.collection_count || 
                  0;
    const unit = database.type === 'MongoDB' ? 'collections' : 'tables';
    return `${database.type} • ${count.toLocaleString()} ${unit}`;
  };

  const handleDatabaseClick = (database: Database) => {
    if (onDatabaseSelect) {
      onDatabaseSelect(database);
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
            {sidebarCollapsed ? '⚠️' : 'Failed to load databases'}
          </p>
        </div>
      </div>
    );
  }

    if (recentDatabases.length === 0) {
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
        {recentDatabases.map((database) => (
        <div
          key={database.id}
          onClick={() => handleDatabaseClick(database)}
          className={`flex items-center h-11 transition-all duration-200 cursor-pointer group ${
            sidebarCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <div className="flex-shrink-0">
            {getDatabaseIcon(database.type, database.name)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 ml-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors duration-200">
                {database.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200">
                {getMetadataText(database)}
              </p>
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  );
} 