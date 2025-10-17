"use client";

import { useState, useMemo } from "react";
import { 
  Button, 
  Input, 
  Popover, 
  ErrorState, 
  ConfirmationModal, 
  DataSourceTableSkeleton,
} from "../../components/ui";
import { 
  Add,
  SearchNormal1,
  Filter,
  Edit2,
  Trash,
  Data,
  Warning2,
  Eye,
  Refresh
} from "iconsax-react";
import UpsertDataSourceModal from "./upsert-data-source-modal";
import { 
  useDataSources, 
  useDeleteDataSource, 
  useTestDataSourceConnection,
  type DataSource,
  type DataSourceType
} from "../../hooks/use-data-sources";
import { DATA_SOURCE_TYPES } from "../../data/data-source-types";

type FilterType = 'all' | DataSourceType;

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get data source logo
const getDataSourceLogo = (type: DataSourceType) => {
  const dataSourceType = DATA_SOURCE_TYPES.find(ds => ds.value === type);
  return dataSourceType?.image || "/images/data-sources/postgres.png"; // fallback
};

export default function DataSourcesPage() {

  const { data: dataSources = [], isLoading, error, refetch } = useDataSources();
  const deleteDataSourceMutation = useDeleteDataSource();
  const testConnectionMutation = useTestDataSourceConnection();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDataSource, setEditingDataSource] = useState<DataSource | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataSourceToDelete, setDataSourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter data sources based on search query and filters
  const filteredDataSources = useMemo(() => {
    let filtered = dataSources; // Use real data instead of mockDataSources

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ds => 
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(ds => ds.type === filterType);
    }

    return filtered;
  }, [dataSources, searchQuery, filterType]); // Add dataSources to dependencies

  const handleAddDataSource = () => {
    setShowAddModal(true);
  };


  const handleEditDataSource = (dataSource: DataSource) => {
    setEditingDataSource(dataSource);
    setShowEditModal(true);
  };


  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingDataSource(null);
  };

  const handleDeleteDataSource = (id: string) => {
    setDataSourceToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteDataSource = async () => {
    if (!dataSourceToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteDataSourceMutation.mutateAsync(dataSourceToDelete);
      setShowDeleteModal(false);
      setDataSourceToDelete(null);
    } catch (error) {
      console.error("Failed to delete data source:", error);
      // Error handling is done by the useDeleteDataSource hook (shows toast)
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteDataSource = () => {
    setShowDeleteModal(false);
    setDataSourceToDelete(null);
  };

  const handleTestConnection = async (id: string) => {
    console.log("Testing connection for data source:", id);
    // TODO: Implement connection test
  };

  const activeFiltersCount = [
    filterType !== "all" ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen h-screen overflow-y-scroll w-full bg-slate-50">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Data Sources</h1>
              <p className="text-gray-600 mt-1">Connect and manage your databases and data sources</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Controls Section */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Search data sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <SearchNormal1 size={16} color="currentColor" />
                }
                onClear={() => setSearchQuery("")}
              />
            </div>

            {/* Filter Popover */}
            <Popover
              trigger={
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-900 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                  <Filter size={16} color="currentColor" />
                </button>
              }
              align="start"
              contentClassName="w-80 p-4"
            >
              <div className="space-y-6">
                {/* Type Filter */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Database Type</h3>
                  <div className="space-y-2">
                    {[
                      { value: "all", label: "All Types" },
                      { value: "PostgreSQL", label: "PostgreSQL" },
                      { value: "MySQL", label: "MySQL" },
                      { value: "MongoDB", label: "MongoDB" },
                      { value: "DynamoDB", label: "DynamoDB" },
                      { value: "Redis", label: "Redis" },
                      { value: "Cassandra", label: "Cassandra" },
                      { value: "InfluxDB", label: "InfluxDB" },
                      { value: "Elasticsearch", label: "Elasticsearch" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <div className="relative">
                          <input
                            type="radio"
                            name="filterType"
                            value={option.value}
                            checked={filterType === option.value}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full transition-colors ${
                            filterType === option.value 
                              ? 'border-gray-900 bg-gray-900' 
                              : 'border-slate-300'
                          }`}>
                            {filterType === option.value && (
                              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-slate-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {activeFiltersCount > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setFilterType("all");
                      }}
                      className="text-sm text-gray-900 hover:text-gray-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </Popover>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Add Button */}
            <Button
              onClick={handleAddDataSource}
              rightIcon={<Add size={16} color="currentColor" />}
              variant="primary"
              size="md"
            >
              Add Data Source
            </Button>
          </div>

          {/* Data Sources Table */}
          {/* Loading State */}
          {isLoading ? (
            <DataSourceTableSkeleton />
          ) : error ? (
            /* Error State */
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto h-12 w-12 text-red-400">
                    <Warning2 size={48} color="currentColor" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">Failed to load data sources</h3>
                  <p className="text-sm text-slate-500">There was an error loading your data sources.</p>
                  <Button
                    onClick={() => refetch()}
                    rightIcon={<Refresh size={16} color="currentColor" />}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          ) : filteredDataSources.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="mx-auto h-12 w-12 text-slate-400">
                    <Data size={48} color="currentColor" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900">
                    {searchQuery || activeFiltersCount > 0 ? "No data sources found" : "No data sources yet"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery || activeFiltersCount > 0
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by connecting your first data source."
                    }
                  </p>
                  {!searchQuery && activeFiltersCount === 0 && (
                    <Button
                      onClick={handleAddDataSource}
                      rightIcon={<Add size={16} color="currentColor" />}
                      variant="outline"
                      size="sm"
                    >
                      Add Data Source
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Type
                      </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Actions
                        </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDataSources.map((dataSource) => (
                      <tr key={dataSource.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0">
                                <img 
                                  src={getDataSourceLogo(dataSource.type)} 
                                  alt={`${dataSource.type} logo`}
                                  className="h-5 w-5 object-contain"
                                />
                              </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {dataSource.name}
                              </div>
                              {dataSource.description && (
                                <div className="text-sm text-slate-500 mt-1">
                                  {dataSource.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {dataSource.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(dataSource.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleTestConnection(dataSource.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Test connection"
                            >
                              <Refresh size={16} color="currentColor" />
                            </button>
                            <button
                              onClick={() => console.log("View data source:", dataSource.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                              title="View details"
                            >
                              <Eye size={16} color="currentColor" />
                            </button>
                            <button
                              onClick={() => handleEditDataSource(dataSource)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                              title="Edit data source"
                            >
                              <Edit2 size={16} color="currentColor" />
                            </button>
                            <button
                              onClick={() => handleDeleteDataSource(dataSource.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete data source"
                            >
                              <Trash size={16} color="currentColor" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {filteredDataSources.length > 0 && (
            <div className="text-sm text-slate-500 text-center">
              Showing {filteredDataSources.length} of {dataSources.length} data sources
            </div>
          )}

          {/* Upsert Data Source Modal */}
          <UpsertDataSourceModal
            isOpen={showAddModal || showEditModal}
            onClose={showAddModal ? () => setShowAddModal(false) : handleCancelEdit}
            dataSource={showEditModal ? editingDataSource : undefined}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={cancelDeleteDataSource}
            onConfirm={confirmDeleteDataSource}
            title="Delete Data Source"
            message="Are you sure you want to delete this data source? This action cannot be undone and may affect any applications using this connection."
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            isLoading={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}
