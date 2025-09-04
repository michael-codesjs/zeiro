"use client";

import { useState, useEffect } from "react";
import { Button, Select, Input, Textarea, type SelectOption, SidePanel, SidePanelHeader, SidePanelBody, SidePanelFooter } from "@/components/ui";
import { useCredentials, type Credential } from "@/hooks/use-credentials";
import { useCreateDatabase, useDiscoverDynamoDBDatabases, type CreateDatabaseInput, type DiscoveredDatabase, type Database } from "@/hooks/use-data-sources";
import { getDataSourceImageUrl, getDataSourceImageAlt } from "@/utils/data-source-utils";
import Image from "next/image";

interface AddDatasourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSourceCreated?: (dataSource: Database) => void;
}

type DatasourceType = 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'Elasticsearch';

const DATASOURCE_OPTIONS = [
  {
    id: 'DynamoDB',
    name: 'Amazon DynamoDB',
    description: 'NoSQL database service for any scale',
    category: 'NoSQL',
    available: true,
    color: 'bg-orange-50 border-orange-200',
    tagColor: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'PostgreSQL',
    name: 'PostgreSQL',
    description: 'Advanced open source relational database',
    category: 'SQL',
    available: false,
    color: 'bg-blue-50 border-blue-200',
    tagColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'MySQL',
    name: 'MySQL',
    description: 'The world\'s most popular open source database',
    category: 'SQL',
    available: false,
    color: 'bg-blue-50 border-blue-200',
    tagColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'MongoDB',
    name: 'MongoDB',
    description: 'Document database for modern applications',
    category: 'NoSQL',
    available: false,
    color: 'bg-green-50 border-green-200',
    tagColor: 'bg-green-100 text-green-800'
  },
  {
    id: 'Redis',
    name: 'Redis',
    description: 'In-memory data structure store',
    category: 'Cache',
    available: false,
    color: 'bg-red-50 border-red-200',
    tagColor: 'bg-red-100 text-red-800'
  },
  {
    id: 'Elasticsearch',
    name: 'Elasticsearch',
    description: 'Distributed search and analytics engine',
    category: 'Search',
    available: false,
    color: 'bg-yellow-50 border-yellow-200',
    tagColor: 'bg-yellow-100 text-yellow-800'
  }
];

export default function AddDatasourceModal({ isOpen, onClose, onDataSourceCreated }: AddDatasourceModalProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedType, setSelectedType] = useState<DatasourceType | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credential_id: '',
    region: '',
    table: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });

  const { data: credentials = [] } = useCredentials();
  const { mutate: createDatabase, isPending: isCreating } = useCreateDatabase();
  const { mutate: discoverTables, data: discoveredData, isPending: isDiscovering } = useDiscoverDynamoDBDatabases();

  const handleReset = () => {
    setStep('select');
    setSelectedType(null);
    setSelectedTable('');
    setFormData({
      name: '',
      description: '',
      credential_id: '',
      region: '',
      table: '',
      host: '',
      port: '',
      database: '',
      username: '',
      password: ''
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleTypeSelect = (type: DatasourceType) => {
    const option = DATASOURCE_OPTIONS.find(opt => opt.id === type);
    if (!option?.available) return;
    
    setSelectedType(type);
    setFormData(prev => ({ ...prev, name: `My ${type} Connection` }));
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select');
      setSelectedType(null);
    }
  };

  const handleSubmit = () => {
    if (!selectedType) return;

    const connectionData: CreateDatabaseInput = {
      name: formData.name,
      description: formData.description,
      type: selectedType,
      credential_id: formData.credential_id,
      connection_config: {
        region: formData.region,
        ...(selectedType === 'DynamoDB' && { table: formData.table }),
        ...(selectedType !== 'DynamoDB' && {
          host: formData.host,
          port: formData.port ? parseInt(formData.port) : undefined,
          database_name: formData.database,
          username: formData.username,
          password: formData.password
        })
      },
      status: 'disconnected',
      environment: 'development',
      auto_connect: true
    };

    createDatabase(connectionData, {
      onSuccess: (newDataSource) => {
        // Call the callback to auto-select the new data source
        if (onDataSourceCreated) {
          onDataSourceCreated(newDataSource);
        }
        handleClose();
      }
    });
  };

  const credentialOptions: SelectOption[] = credentials.map(cred => ({
    value: cred.id,
    label: cred.name
  }));

  const regionOptions: SelectOption[] = [
    { value: 'us-east-1', label: 'us-east-1' },
    { value: 'us-east-2', label: 'us-east-2' },
    { value: 'us-west-1', label: 'us-west-1' },
    { value: 'us-west-2', label: 'us-west-2' },
    { value: 'eu-west-1', label: 'eu-west-1' },
    { value: 'eu-west-2', label: 'eu-west-2' },
    { value: 'eu-west-3', label: 'eu-west-3' },
    { value: 'eu-central-1', label: 'eu-central-1' },
    { value: 'eu-north-1', label: 'eu-north-1' },
    { value: 'ap-southeast-1', label: 'ap-southeast-1' },
    { value: 'ap-southeast-2', label: 'ap-southeast-2' },
    { value: 'ap-northeast-1', label: 'ap-northeast-1' },
    { value: 'ap-northeast-2', label: 'ap-northeast-2' },
    { value: 'ap-south-1', label: 'ap-south-1' },
    { value: 'ca-central-1', label: 'ca-central-1' },
    { value: 'sa-east-1', label: 'sa-east-1' }
  ];

  const tableOptions: SelectOption[] = discoveredData?.dataSources?.map(table => ({
    value: table.name,
    label: table.name
  })) || [];

  const isFormValid = () => {
    if (!formData.name) return false;
    if (selectedType === 'DynamoDB') {
      return formData.credential_id && formData.region;
    }
    return formData.host && formData.port && formData.database;
  };

  const selectedOption = DATASOURCE_OPTIONS.find(opt => opt.id === selectedType);

  const handleDiscoverTables = () => {
    if (formData.credential_id && formData.region) {
      discoverTables({
        credential_id: formData.credential_id,
        region: formData.region
      });
    }
  };

  // Auto-discover tables when credentials and region are selected
  useEffect(() => {
    if (formData.credential_id && formData.region && selectedType === 'DynamoDB') {
      handleDiscoverTables();
    }
  }, [formData.credential_id, formData.region, selectedType]);

  return (
    <SidePanel isOpen={isOpen} onClose={handleClose} size="lg">
      <SidePanelHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={step === 'select' ? handleClose : handleBack}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 'select' ? 'Add Data Source' : `Configure ${selectedOption?.name}`}
              </h2>
              <p className="text-xs text-gray-600">
                {step === 'select' ? 'Connect a new database to your workspace' : 'Set up your connection details'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1.5 h-auto text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </SidePanelHeader>

      <SidePanelBody>
        {step === 'select' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {DATASOURCE_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`group relative p-4 border rounded-lg transition-all duration-200 ${
                    option.available 
                      ? `${option.color} hover:shadow-sm hover:scale-[1.01] cursor-pointer` 
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
                  }`}
                  onClick={() => option.available && handleTypeSelect(option.id as DatasourceType)}
                >
                  {!option.available && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                        Coming Soon
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg p-2 shadow-sm">
                      <Image
                        src={getDataSourceImageUrl(option.id as DatasourceType)}
                        alt={getDataSourceImageAlt(option.id as DatasourceType)}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700">
                          {option.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${option.tagColor}`}>
                          {option.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                    {option.available && (
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm mb-1">Secure Connections</h4>
                  <p className="text-xs text-blue-700">
                    All connections are encrypted and credentials are stored securely in your workspace. Your database credentials never leave your environment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'configure' && selectedOption && (
          <div className="space-y-6">
            {/* Connection Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Database Connection"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Production database for analytics and reporting"
                  size="sm"
                  rows={3}
                />
              </div>
            </div>

            {/* Configuration */}
            <div>
              {selectedType === 'DynamoDB' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AWS Credentials *
                    </label>
                    <Select
                      value={formData.credential_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, credential_id: value }))}
                      options={credentialOptions}
                      placeholder="Select AWS credentials"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AWS Region *
                    </label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                      options={regionOptions}
                      placeholder="Select AWS region"
                    />
                  </div>
                  
                  {!formData.credential_id || !formData.region ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4M4 7h16m-1 4l-3 3m0 0l-3-3m3 3V8" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-500">
                        Select credentials and region to discover tables
                      </div>
                    </div>
                  ) : formData.credential_id && formData.region && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Available Tables
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleDiscoverTables}
                          disabled={isDiscovering}
                          className="text-xs h-7 px-3"
                        >
                          {isDiscovering ? 'Discovering...' : 'Refresh Tables'}
                        </Button>
                      </div>
                      
                      {isDiscovering ? (
                        <div className="space-y-2">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                                </div>
                                <div className="h-3 bg-gray-300 rounded w-16"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : discoveredData?.dataSources && discoveredData.dataSources.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-xs text-gray-500">
                            {discoveredData.dataSources.length} table{discoveredData.dataSources.length !== 1 ? 's' : ''} found
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-2">
                            Click a table to select it for this connection
                          </div>
                          
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {discoveredData.dataSources.map((table) => (
                              <div
                                key={table.name}
                                onClick={() => {
                                  setSelectedTable(table.name);
                                  setFormData(prev => ({ ...prev, table: table.name }));
                                }}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer bg-gray-50"
                              >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="relative flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                                      selectedTable === table.name 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-300 bg-white'
                                    }`}>
                                      {selectedTable === table.name && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm truncate">
                                    {table.name}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 flex-shrink-0">
                                  {table.item_count ? `${table.item_count.toLocaleString()} items` : 'Empty'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : discoveredData?.dataSources && discoveredData.dataSources.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="text-sm text-gray-500 mb-2">No tables found in this region</div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleDiscoverTables}
                            className="text-xs"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Host *
                      </label>
                      <Input
                        value={formData.host}
                        onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="localhost"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port *
                      </label>
                      <Input
                        value={formData.port}
                        onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="5432"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Database Name *
                    </label>
                    <Input
                      value={formData.database}
                      onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="my_database"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="database_user"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SidePanelBody>

      {step === 'configure' && (
        <SidePanelFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || isCreating}
            loading={isCreating}
            size="sm"
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Data Source'}
          </Button>
        </SidePanelFooter>
      )}
    </SidePanel>
  );
} 