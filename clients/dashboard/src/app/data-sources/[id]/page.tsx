"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit, FiTrash2, FiRefreshCw, FiExternalLink, FiClock, FiDatabase, FiSettings, FiActivity, FiServer, FiLayers, FiBarChart2, FiShield, FiZap } from 'react-icons/fi';
import { Button, useDisclosure, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { useDataSources, useDeleteDatabase, useTestDatabaseConnection, type Database } from '@/hooks/use-data-sources';
import { getDataSourceImageUrl, getDataSourceImageAlt } from '@/utils/data-source-utils';
import EditDataSourceModal from '../edit-data-source-modal';
import QueryProvider from '@/providers/query-client-provider';

interface DataSourceDetailPageProps {
  params: { id: string };
}



const STATUS_CONFIG = {
  connected: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    ringColor: 'ring-emerald-500/20',
    label: 'Connected',
    icon: '●',
    iconColor: 'text-emerald-500'
  },
  disconnected: {
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    ringColor: 'ring-slate-500/20',
    label: 'Disconnected',
    icon: '●',
    iconColor: 'text-slate-400'
  },
  error: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    ringColor: 'ring-red-500/20',
    label: 'Error',
    icon: '●',
    iconColor: 'text-red-500'
  },
  connecting: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    ringColor: 'ring-amber-500/20',
    label: 'Connecting',
    icon: '●',
    iconColor: 'text-amber-500 animate-pulse'
  }
};

const ENVIRONMENT_CONFIG = {
  development: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🔧'
  },
  staging: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '🚀'
  },
  production: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '🔥'
  }
};

function DataSourceDetailContent({ params }: DataSourceDetailPageProps) {
  const router = useRouter();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const { data: dataSources = [], isLoading, error } = useDataSources();
  const { mutate: deleteDatabase, isPending: isDeleting } = useDeleteDatabase();
  const { mutate: testConnection, isPending: isTesting } = useTestDatabaseConnection();

  // Find the specific data source
  const dataSource = dataSources.find(ds => ds.id === params.id);

  const handleDelete = () => {
    deleteDatabase(dataSource!.id, {
      onSuccess: () => {
        router.push('/data-sources');
      }
    });
  };

  const handleTestConnection = () => {
    if (dataSource) {
      testConnection(dataSource.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionInfo = () => {
    if (!dataSource) return '';
    
    switch (dataSource.type) {
      case 'DynamoDB':
        return dataSource.connection_config.region || 'us-east-1';
      case 'PostgreSQL':
      case 'MySQL':
        return `${dataSource.connection_config.host}:${dataSource.connection_config.port}`;
      case 'MongoDB':
        return dataSource.connection_config.connection_string ? 'MongoDB Atlas' : 'Self-hosted';
      default:
        return 'Connected';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-10 bg-slate-200 rounded w-48"></div>
              <div className="flex space-x-3">
                <div className="h-10 bg-slate-200 rounded w-32"></div>
                <div className="h-10 bg-slate-200 rounded w-20"></div>
                <div className="h-10 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
            
            {/* Main card skeleton */}
            <div className="bg-white rounded-xl p-8 border border-slate-200">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="h-8 bg-slate-200 rounded w-64"></div>
                    <div className="h-4 bg-slate-200 rounded w-96"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-5 bg-slate-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs skeleton */}
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="h-10 bg-slate-200 rounded w-24"></div>
                <div className="h-10 bg-slate-200 rounded w-32"></div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-48"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                        <div className="h-6 bg-slate-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dataSource) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/data-sources')}
            leftIcon={<FiArrowLeft />}
            className="mb-6"
          >
            Back to Data Sources
          </Button>
          
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Data source not found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              The data source you're looking for doesn't exist or may have been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[dataSource.status];
  const environmentConfig = ENVIRONMENT_CONFIG[dataSource.environment];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/data-sources')}
            leftIcon={<FiArrowLeft />}
            className="hover:bg-slate-100 transition-colors"
          >
            Back to Data Sources
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
              leftIcon={<FiRefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />}
              className="hover:bg-slate-50 transition-all duration-200"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onEditOpen}
              leftIcon={<FiEdit />}
              className="hover:bg-slate-50 transition-all duration-200"
            >
              Edit
            </Button>
            
            <Button
              variant="gradient"
              onClick={() => window.location.href = `/?datasource=${dataSource.id}`}
              leftIcon={<FiExternalLink />}
              className="shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Open in Workbench
            </Button>
            
            <Button
              variant="danger"
              onClick={onDeleteOpen}
              leftIcon={<FiTrash2 />}
              className="hover:shadow-md transition-all duration-200"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Data Source Header */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <img 
                src={getDataSourceImageUrl(dataSource.type as any)} 
                alt={getDataSourceImageAlt(dataSource.type as any)}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <FiDatabase className="w-10 h-10 text-slate-500 hidden" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-slate-900">{dataSource.name}</h1>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                    <span className={`mr-2 text-xs ${statusConfig.iconColor}`}>{statusConfig.icon}</span>
                    {statusConfig.label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${environmentConfig.bgColor} ${environmentConfig.color} border ${environmentConfig.borderColor}`}>
                    <span className="mr-2">{environmentConfig.icon}</span>
                    {dataSource.environment}
                  </span>
                </div>
              </div>
              
              {dataSource.description && (
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">{dataSource.description}</p>
              )}
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FiServer className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Database Type</p>
                  </div>
                  <p className="font-semibold text-slate-900">{dataSource.type}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FiLayers className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Connection</p>
                  </div>
                  <p className="font-semibold text-slate-900">{getConnectionInfo()}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FiClock className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Created</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatDate(dataSource.created_at)}</p>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FiActivity className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Last Updated</p>
                  </div>
                  <p className="font-semibold text-slate-900">{formatDate(dataSource.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              leftIcon={<FiBarChart2 />}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="configuration" 
              leftIcon={<FiSettings />}
            >
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Metadata */}
            {dataSource.metadata && (
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FiBarChart2 className="w-4 h-4 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Database Metrics</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {dataSource.metadata.table_count && (
                    <div className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <FiLayers className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Tables</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{dataSource.metadata.table_count}</p>
                    </div>
                  )}
                  {dataSource.metadata.size_bytes && (
                    <div className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <FiServer className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Database Size</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {(dataSource.metadata.size_bytes / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  )}
                  {dataSource.metadata.version && (
                    <div className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <FiZap className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Version</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{dataSource.metadata.version}</p>
                    </div>
                  )}
                  {dataSource.last_accessed && (
                    <div className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <FiClock className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Last Accessed</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{formatDate(dataSource.last_accessed)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FiSettings className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Auto-connect on startup</p>
                    <p className="text-sm text-slate-500">Automatically connect to this data source when the application starts</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dataSource.auto_connect 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {dataSource.auto_connect ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FiSettings className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Connection Configuration</h3>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Credential ID</p>
                      <p className="font-mono text-slate-900">{dataSource.credential_id}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500 mb-1">Environment</p>
                      <p className="font-medium text-slate-900 capitalize">{dataSource.environment}</p>
                    </div>
                  </div>
                </div>

                {/* Connection Details */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Connection Details</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(dataSource.connection_config).map(([key, value]) => (
                      <div key={key} className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="font-mono text-slate-900 break-all">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <EditDataSourceModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          dataSource={dataSource}
        />

        {/* Delete Confirmation Modal */}
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onDeleteClose} />
            <div className="relative bg-white rounded-xl p-6 max-w-md w-full shadow-lg border border-slate-200">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Delete Data Source</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete "{dataSource.name}"? This action cannot be undone and you will lose all associated data.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="ghost" onClick={onDeleteClose}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Data Source'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DataSourceDetailPage({ params }: DataSourceDetailPageProps) {
  return (
    <QueryProvider>
      <DataSourceDetailContent params={params} />
    </QueryProvider>
  );
} 