"use client";

import { useState } from 'react';
import { FiDatabase, FiPlus, FiSearch, FiFilter, FiTrash2, FiCheckSquare, FiSquare, FiRefreshCw } from 'react-icons/fi';
import { Button, useDisclosure, Input, Select, type SelectOption } from '@/components/ui';
import { useDataSources, useDeleteDatabase } from '@/hooks/use-data-sources';
import AddDatasourceModal from '../(workbench)/add-datasource-modal';
import DataSourceCard from './data-source-card';
import QueryProvider from '@/providers/query-client-provider';

const DATABASE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'DynamoDB', label: 'DynamoDB' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'MongoDB', label: 'MongoDB' },
  { value: 'Redis', label: 'Redis' },
  { value: 'Elasticsearch', label: 'Elasticsearch' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'connected', label: 'Connected' },
  { value: 'disconnected', label: 'Disconnected' },
  { value: 'error', label: 'Error' },
  { value: 'connecting', label: 'Connecting' },
];

const ENVIRONMENT_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Environments' },
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
];

const GROUP_BY_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'All' },
  { value: 'type', label: 'Database Type' },
  { value: 'environment', label: 'Environment' },
  { value: 'status', label: 'Status' },
  { value: 'region', label: 'Region' },
];

function DataSourcesPageContent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [groupBy, setGroupBy] = useState('none');
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // React Query hooks
  const { data: dataSources = [], isLoading, error, refetch, isRefetching } = useDataSources();
  const { mutate: deleteDatabase } = useDeleteDatabase();

  // Filter data sources based on search and filters
  const filteredDataSources = dataSources.filter(dataSource => {
    const matchesSearch = dataSource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataSource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || dataSource.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || dataSource.status === selectedStatus;
    const matchesEnvironment = selectedEnvironment === 'all' || dataSource.environment === selectedEnvironment;
    
    return matchesSearch && matchesType && matchesStatus && matchesEnvironment;
  });

  // Group data sources
  const getRegionForDataSource = (dataSource: any) => {
    switch (dataSource.type) {
      case 'DynamoDB':
        return dataSource.connection_config.region || 'us-east-1';
      case 'PostgreSQL':
      case 'MySQL':
        return dataSource.connection_config.host ? dataSource.connection_config.host.split('.')[0] : 'Unknown';
      case 'MongoDB':
        return dataSource.connection_config.region || 'Global';
      default:
        return 'N/A';
    }
  };

  const groupedDataSources = (() => {
    if (groupBy === 'none') {
      return { 'All Data Sources': filteredDataSources };
    }

    const groups: Record<string, typeof filteredDataSources> = {};
    
    filteredDataSources.forEach(dataSource => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'type':
          groupKey = dataSource.type;
          break;
        case 'environment':
          groupKey = dataSource.environment;
          break;
        case 'status':
          groupKey = dataSource.status;
          break;
        case 'region':
          groupKey = getRegionForDataSource(dataSource);
          break;
        default:
          groupKey = 'Other';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(dataSource);
    });

    // Sort groups alphabetically
    const sortedGroups: Record<string, typeof filteredDataSources> = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  })();

  // Selection handlers
  const handleSelectDataSource = (id: string) => {
    const newSelected = new Set(selectedDataSources);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDataSources(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDataSources.size === filteredDataSources.length) {
      setSelectedDataSources(new Set());
    } else {
      setSelectedDataSources(new Set(filteredDataSources.map(ds => ds.id)));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedDataSources.size} data source(s)? This action cannot be undone.`)) {
      selectedDataSources.forEach(id => {
        deleteDatabase(id);
      });
      setSelectedDataSources(new Set());
      setIsSelectionMode(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDataSources(new Set());
  };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Data Sources</h1>
              <p className="text-slate-600 mt-2">Manage your database connections and data sources</p>
            </div>
            <div className="flex items-center space-x-3">
              {isSelectionMode && selectedDataSources.size > 0 && (
                <Button
                  variant="danger"
                  onClick={handleBulkDelete}
                  leftIcon={<FiTrash2 />}
                >
                  Delete ({selectedDataSources.size})
                </Button>
              )}
              
              <Button
                onClick={onOpen}
                variant="primary"
                leftIcon={<FiPlus />}
                className="shadow-lg"
              >
                Add Data Source
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {isSelectionMode && filteredDataSources.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      leftIcon={selectedDataSources.size === filteredDataSources.length ? <FiCheckSquare /> : <FiSquare />}
                    >
                      {selectedDataSources.size === filteredDataSources.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                  <div className="flex-1">
                    <Input
                      placeholder="Search data sources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      leftIcon={<FiSearch className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <Select
                  options={GROUP_BY_OPTIONS}
                  value={groupBy}
                  onValueChange={setGroupBy}
                  placeholder="Group By"
                  className="w-40"
                />
                <Select
                  options={DATABASE_TYPE_OPTIONS}
                  value={selectedType}
                  onValueChange={setSelectedType}
                  placeholder="Type"
                  className="w-40"
                />
                <Select
                  options={STATUS_OPTIONS}
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  placeholder="Status"
                  className="w-40"
                />
                <Select
                  options={ENVIRONMENT_OPTIONS}
                  value={selectedEnvironment}
                  onValueChange={setSelectedEnvironment}
                  placeholder="Environment"
                  className="w-40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-32"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-full"></div>
                      <div className="flex space-x-3">
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                        <div className="h-3 bg-slate-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load data sources</h3>
            <p className="text-slate-500">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        ) : filteredDataSources.length === 0 ? (
          dataSources.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiDatabase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No data sources yet</h3>
              <p className="text-slate-500 mb-6">
                Connect your first data source to start exploring and analyzing your data.
              </p>
              <Button
                onClick={onOpen}
                variant="primary"
                leftIcon={<FiPlus />}
              >
                Add Your First Data Source
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No data sources found</h3>
              <p className="text-slate-500 mb-6">
                Try adjusting your search criteria or filters to find the data sources you're looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSelectedEnvironment('all');
                  setGroupBy('none');
                }}
                variant="ghost"
              >
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedDataSources).map(([groupName, groupDataSources]) => (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      {groupName}
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        ({groupDataSources.length} {groupDataSources.length === 1 ? 'source' : 'sources'})
                      </span>
                    </h2>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groupDataSources.map((dataSource) => (
                    <div key={dataSource.id} className="relative">
                      {isSelectionMode && (
                        <div className="absolute top-3 left-3 z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectDataSource(dataSource.id)}
                            className="p-1 h-8 w-8 bg-white shadow-sm hover:bg-slate-50"
                          >
                            {selectedDataSources.has(dataSource.id) ? (
                              <FiCheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <FiSquare className="w-4 h-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      )}
                      <DataSourceCard
                        dataSource={dataSource}
                        isSelected={selectedDataSources.has(dataSource.id)}
                        isSelectionMode={isSelectionMode}
                        onSelect={() => handleSelectDataSource(dataSource.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddDatasourceModal
        isOpen={isOpen}
        onClose={onClose}
      />
    </div>
  );
}

export default function DataSourcesPage() {
  return (
    <QueryProvider>
      <DataSourcesPageContent />
    </QueryProvider>
  );
} 