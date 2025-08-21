"use client";

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiRefreshCw } from 'react-icons/fi';
import { Button, Input, Textarea, Select, useDisclosure, type SelectOption } from '@/components/ui';
import { useUpdateDatabase, useTestDatabaseConnection, type Database } from '@/hooks/use-data-sources';
import { useCredentials } from '@/hooks/use-credentials';

interface EditDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSource: Database;
}

const ENVIRONMENT_OPTIONS: SelectOption[] = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
];

export default function EditDataSourceModal({ isOpen, onClose, dataSource }: EditDataSourceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credential_id: '',
    environment: 'development' as const,
    auto_connect: false,
    // Connection specific fields
    region: '',
    table: '',
    host: '',
    port: '',
    database: '',
    ssl: false,
    connection_string: '',
    timeout: 30,
    max_connections: 10
  });

  const { data: credentials = [] } = useCredentials();
  const { mutate: updateDatabase, isPending: isUpdating } = useUpdateDatabase();
  const { mutate: testConnection, isPending: isTesting } = useTestDatabaseConnection();

  // Initialize form data when dataSource changes
  useEffect(() => {
    if (dataSource) {
      setFormData({
        name: dataSource.name,
        description: dataSource.description || '',
        credential_id: dataSource.credential_id,
        environment: dataSource.environment,
        auto_connect: dataSource.auto_connect,
        // Connection config
        region: dataSource.connection_config.region || '',
        table: dataSource.connection_config.table || '',
        host: dataSource.connection_config.host || '',
        port: dataSource.connection_config.port?.toString() || '',
        database: dataSource.connection_config.database_name || '',
        ssl: dataSource.connection_config.ssl || false,
        connection_string: dataSource.connection_config.connection_string || '',
        timeout: dataSource.connection_config.timeout || 30,
        max_connections: dataSource.connection_config.max_connections || 10
      });
    }
  }, [dataSource]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = () => {
    testConnection(dataSource.id);
  };

  const handleSave = () => {
    const updateData = {
      name: formData.name,
      description: formData.description,
      environment: formData.environment,
      auto_connect: formData.auto_connect,
      credential_id: formData.credential_id,
      connection_config: {
        ...dataSource.connection_config,
        // Update only the relevant fields based on database type
        ...(dataSource.type === 'DynamoDB' && {
          region: formData.region,
          table: formData.table
        }),
        ...((['PostgreSQL', 'MySQL'].includes(dataSource.type)) && {
          host: formData.host,
          port: parseInt(formData.port) || 5432,
          database_name: formData.database,
          ssl: formData.ssl,
          timeout: formData.timeout,
          max_connections: formData.max_connections
        }),
        ...(dataSource.type === 'MongoDB' && {
          connection_string: formData.connection_string,
          timeout: formData.timeout,
          max_connections: formData.max_connections
        })
      }
    };

    updateDatabase({ 
      id: dataSource.id, 
      data: updateData 
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const credentialOptions = credentials.map(cred => ({
    value: cred.id,
    label: `${cred.name} (${cred.provider})`
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Edit Data Source</h2>
            <p className="text-sm text-slate-500 mt-1">Update your {dataSource.type} connection</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FiX className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My Database Connection"
                  required
                />
                
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this data source..."
                  rows={3}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Credentials"
                    options={credentialOptions}
                    value={formData.credential_id}
                    onChange={(value) => handleInputChange('credential_id', value)}
                    placeholder="Select credentials"
                    required
                  />
                  
                  <Select
                    label="Environment"
                    options={ENVIRONMENT_OPTIONS}
                    value={formData.environment}
                    onChange={(value) => handleInputChange('environment', value)}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto_connect"
                    checked={formData.auto_connect}
                    onChange={(e) => handleInputChange('auto_connect', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="auto_connect" className="text-sm font-medium text-slate-700">
                    Auto-connect on startup
                  </label>
                </div>
              </div>
            </div>

            {/* Connection Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-900">Connection Configuration</h3>
              
              {dataSource.type === 'DynamoDB' && (
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Region"
                    options={[
                      { value: 'us-east-1', label: 'US East (N. Virginia)' },
                      { value: 'us-west-1', label: 'US West (N. California)' },
                      { value: 'us-west-2', label: 'US West (Oregon)' },
                      { value: 'eu-west-1', label: 'Europe (Ireland)' },
                      { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
                      { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
                      { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
                    ]}
                    value={formData.region}
                    onChange={(value) => handleInputChange('region', value)}
                    placeholder="Select region"
                    required
                  />
                  
                  <Input
                    label="Table Name (Optional)"
                    value={formData.table}
                    onChange={(e) => handleInputChange('table', e.target.value)}
                    placeholder="Leave empty to discover all tables"
                  />
                </div>
              )}

              {(['PostgreSQL', 'MySQL'].includes(dataSource.type)) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Host"
                      value={formData.host}
                      onChange={(e) => handleInputChange('host', e.target.value)}
                      placeholder="localhost"
                      required
                    />
                    
                    <Input
                      label="Port"
                      value={formData.port}
                      onChange={(e) => handleInputChange('port', e.target.value)}
                      placeholder={dataSource.type === 'PostgreSQL' ? '5432' : '3306'}
                      required
                    />
                  </div>
                  
                  <Input
                    label="Database Name"
                    value={formData.database}
                    onChange={(e) => handleInputChange('database', e.target.value)}
                    placeholder="myapp_db"
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Connection Timeout (seconds)"
                      type="number"
                      value={formData.timeout}
                      onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                      placeholder="30"
                    />
                    
                    <Input
                      label="Max Connections"
                      type="number"
                      value={formData.max_connections}
                      onChange={(e) => handleInputChange('max_connections', parseInt(e.target.value) || 10)}
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="ssl"
                      checked={formData.ssl}
                      onChange={(e) => handleInputChange('ssl', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="ssl" className="text-sm font-medium text-slate-700">
                      Enable SSL/TLS encryption
                    </label>
                  </div>
                </div>
              )}

              {dataSource.type === 'MongoDB' && (
                <div className="space-y-4">
                  <Textarea
                    label="Connection String"
                    value={formData.connection_string}
                    onChange={(e) => handleInputChange('connection_string', e.target.value)}
                    placeholder="mongodb://username:password@host:port/database"
                    rows={3}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Connection Timeout (seconds)"
                      type="number"
                      value={formData.timeout}
                      onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 30)}
                      placeholder="30"
                    />
                    
                    <Input
                      label="Max Connections"
                      type="number"
                      value={formData.max_connections}
                      onChange={(e) => handleInputChange('max_connections', parseInt(e.target.value) || 10)}
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting}
            leftIcon={<FiRefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isUpdating || !formData.name || !formData.credential_id}
              leftIcon={<FiSave className="w-4 h-4" />}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 