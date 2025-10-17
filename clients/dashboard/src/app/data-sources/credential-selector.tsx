"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button } from "../../components/ui";
import { useCredentials, CreateCredentialInput } from "../../data/credentials";

interface CredentialSelectorProps {
  dataSourceType: string;
  dataSourceName: string;
  onCredentialSave: (credentialData: any) => void;
  isCreatingDataSource?: boolean;
  onFormReady?: (submitFn: () => Promise<void>) => void;
}

// Create dynamic schema based on data source type
const createCredentialSchema = (dataSourceType: string) => {
  const baseSchema = {
    name: z.string().min(1, "Credential name is required"),
    type: z.string(),
  };

  switch (dataSourceType) {
    case 'PostgreSQL':
    case 'MySQL':
    case 'MariaDB':
    case 'MSSQL':
      return z.object({
        ...baseSchema,
        host: z.string().min(1, "Host is required"),
        port: z.number().min(1, "Port is required"),
        database: z.string().min(1, "Database name is required"),
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
        ssl: z.boolean().optional(),
      });

    case 'SQLite':
      return z.object({
        ...baseSchema,
        filePath: z.string().min(1, "Database file path is required"),
      });

    case 'MongoDB':
      return z.object({
        ...baseSchema,
        connectionString: z.string().optional(),
        host: z.string().optional(),
        port: z.number().optional(),
      });

    case 'DynamoDB':
      return z.object({
        ...baseSchema,
        accessKeyId: z.string().min(1, "AWS Access Key ID is required"),
        secretAccessKey: z.string().min(1, "AWS Secret Access Key is required"),
        region: z.string().min(1, "AWS Region is required"),
        accountId: z.string().optional(),
      });

    case 'Redis':
      return z.object({
        ...baseSchema,
        host: z.string().min(1, "Host is required"),
        port: z.number().min(1, "Port is required"),
        password: z.string().optional(),
        database: z.number().optional(),
      });

    case 'HubSpot':
      return z.object({
        ...baseSchema,
        apiKey: z.string().min(1, "API Key is required"),
        portalId: z.string().optional(),
      });

    case 'Salesforce':
      return z.object({
        ...baseSchema,
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
        securityToken: z.string().min(1, "Security Token is required"),
        instanceUrl: z.string().optional(),
        sandbox: z.boolean().optional(),
      });

    default:
      return z.object(baseSchema);
  }
};

export default function CredentialSelector({
  dataSourceType,
  dataSourceName,
  onCredentialSave,
  isCreatingDataSource = false,
  onFormReady
}: CredentialSelectorProps) {
  const { createCredential, isCreating } = useCredentials();

  // Generate credential name and type based on data source
  const getCredentialName = () => {
    return `${dataSourceName} Credentials`;
  };

  const getCredentialType = () => {
    switch (dataSourceType) {
      case 'DynamoDB':
        return 'iam_access_keys';
      case 'HubSpot':
      case 'Salesforce':
      case 'GoogleSheets':
        return 'service_account_keys';
      case 'PostgreSQL':
      case 'MySQL':
      case 'MariaDB':
      case 'MSSQL':
      case 'SQLite':
      case 'MongoDB':
      case 'Redis':
      case 'Cassandra':
      case 'InfluxDB':
      case 'Elasticsearch':
      case 'Neo4j':
      case 'Excel':
        return 'connection_details';
      default:
        return 'connection_details';
    }
  };

  // Create form with dynamic schema
  const credentialSchema = createCredentialSchema(dataSourceType);
  const form = useForm({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      name: getCredentialName(),
      type: getCredentialType(),
    }
  });

  const { register, handleSubmit, formState: { errors }, setValue } = form;

  // Helper function to structure data according to API requirements
  const structureCredentialData = useCallback((data: any, dataSourceType: string): CreateCredentialInput => {
    const baseData = {
      name: data.name,
      type: data.type as any,
      status: 'active' as const,
    };

    switch (dataSourceType) {
      case 'DynamoDB':
        return {
          ...baseData,
          type: 'iam_access_keys',
          account_id: data.accountId || '',
          access_key_id: data.accessKeyId,
          secret_access_key: data.secretAccessKey,
          region: data.region,
        };

      case 'PostgreSQL':
      case 'MySQL':
      case 'MariaDB':
      case 'MSSQL':
        return {
          ...baseData,
          type: 'connection_details',
          host: data.host,
          port: data.port,
          database: data.database,
          username: data.username,
          password: data.password,
          ssl: data.ssl || false,
        };

      case 'HubSpot':
      case 'Salesforce':
      case 'GoogleSheets':
        return {
          ...baseData,
          type: 'service_account_keys',
          service_account_key: data.apiKey || data.securityToken || '',
          project_id: data.portalId || data.instanceUrl || '',
        };

      default:
        // For other types, create a generic connection_details structure
        return {
          ...baseData,
          type: 'connection_details',
          host: data.host || 'localhost',
          port: data.port || 5432,
          database: data.database || data.filePath || 'default',
          username: data.username || 'user',
          password: data.password || '',
          ssl: data.ssl || false,
        };
    }
  }, []);

  const onSubmit = useCallback(async (data: any) => {
    try {
      // Structure the data according to CreateCredentialInput type
      const credentialInput = structureCredentialData(data, dataSourceType);
      
      console.log("Creating credential with data:", credentialInput);
      
      // Call the actual API
      const credentialResponse = await createCredential(credentialInput);
      
      onCredentialSave(credentialResponse);
    } catch (error) {
      console.error("Error creating credential:", error);
      // Error handling is done by the useCredentials hook (shows toast)
    }
  }, [dataSourceType, createCredential, onCredentialSave, structureCredentialData]);

  const renderCredentialFields = () => {
    switch (dataSourceType) {
      case 'PostgreSQL':
      case 'MySQL':
      case 'MariaDB':
      case 'MSSQL':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Host" 
                placeholder="localhost" 
                {...register("host")}
                error={errors.host?.message}
              />
              <Input 
                label="Port" 
                type="number" 
                placeholder={dataSourceType === 'PostgreSQL' ? '5432' : '3306'}
                {...register("port", { valueAsNumber: true })}
                error={errors.port?.message}
              />
            </div>
            <Input 
              label="Database Name" 
              placeholder="myapp_production" 
              {...register("database")}
              error={errors.database?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Username" 
                placeholder="db_user" 
                {...register("username")}
                error={errors.username?.message}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                {...register("password")}
                error={errors.password?.message}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ssl"
                {...register("ssl")}
                className="h-4 w-4 text-gray-900 border-slate-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="ssl" className="text-sm text-slate-700">
                Enable SSL connection
              </label>
            </div>
          </>
        );

      case 'SQLite':
        return (
          <Input 
            label="Database File Path" 
            placeholder="/path/to/database.sqlite"
            {...register("filePath")}
            error={errors.filePath?.message}
          />
        );

      case 'MongoDB':
        return (
          <>
            <Input 
              label="Connection String" 
              placeholder="mongodb://username:password@host:port/database"
              {...register("connectionString")}
              error={errors.connectionString?.message}
            />
            <div className="text-sm text-slate-500">
              <p>Or provide individual connection details:</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Host (Optional)" 
                placeholder="localhost" 
                {...register("host")}
                error={errors.host?.message}
              />
              <Input 
                label="Port (Optional)" 
                type="number" 
                placeholder="27017" 
                {...register("port", { valueAsNumber: true })}
                error={errors.port?.message}
              />
            </div>
          </>
        );

      case 'DynamoDB':
        return (
          <>
            <Input 
              label="AWS Access Key ID" 
              placeholder="AKIA..." 
              {...register("accessKeyId")}
              error={errors.accessKeyId?.message}
            />
            <Input 
              label="AWS Secret Access Key" 
              type="password" 
              placeholder="••••••••" 
              {...register("secretAccessKey")}
              error={errors.secretAccessKey?.message}
            />
            <Input 
              label="AWS Region" 
              placeholder="us-east-1" 
              {...register("region")}
              error={errors.region?.message}
            />
            <Input 
              label="AWS Account ID (Optional)" 
              placeholder="123456789012" 
              {...register("accountId")}
              error={errors.accountId?.message}
            />
          </>
        );

      case 'Redis':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Host" 
                placeholder="localhost" 
                {...register("host")}
                error={errors.host?.message}
              />
              <Input 
                label="Port" 
                type="number" 
                placeholder="6379" 
                {...register("port", { valueAsNumber: true })}
                error={errors.port?.message}
              />
            </div>
            <Input 
              label="Password (Optional)" 
              type="password" 
              placeholder="••••••••" 
              {...register("password")}
              error={errors.password?.message}
            />
            <Input 
              label="Database Number (Optional)" 
              type="number" 
              placeholder="0" 
              {...register("database", { valueAsNumber: true })}
              error={errors.database?.message}
            />
          </>
        );

      case 'Elasticsearch':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Host" placeholder="localhost" />
              <Input label="Port" type="number" placeholder="9200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Username (Optional)" placeholder="elastic" />
              <Input label="Password (Optional)" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="https"
                className="h-4 w-4 text-gray-900 border-slate-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="https" className="text-sm text-slate-700">
                Enable HTTPS
              </label>
            </div>
          </>
        );

      case 'Neo4j':
        return (
          <>
            <Input label="URI" placeholder="bolt://localhost:7687" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Username" placeholder="neo4j" />
              <Input label="Password" type="password" placeholder="••••••••" />
            </div>
          </>
        );

      case 'Cassandra':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Host" placeholder="localhost" />
              <Input label="Port" type="number" placeholder="9042" />
            </div>
            <Input label="Keyspace" placeholder="mykeyspace" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Username (Optional)" placeholder="cassandra" />
              <Input label="Password (Optional)" type="password" placeholder="••••••••" />
            </div>
          </>
        );

      case 'InfluxDB':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Host" placeholder="localhost" />
              <Input label="Port" type="number" placeholder="8086" />
            </div>
            <Input label="Database" placeholder="mydb" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Username (Optional)" placeholder="admin" />
              <Input label="Password (Optional)" type="password" placeholder="••••••••" />
            </div>
          </>
        );

      case 'Excel':
        return (
          <>
            <Input 
              label="File Path" 
              placeholder="/path/to/spreadsheet.xlsx"
            />
            <div className="text-sm text-slate-500">
              <p>Or upload file:</p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </>
        );

      case 'GoogleSheets':
        return (
          <>
            <Input 
              label="Google Sheets URL" 
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
            <Input 
              label="Service Account Key (JSON)" 
              placeholder="Paste your service account JSON key here"
              type="textarea"
            />
            <div className="text-sm text-slate-500">
              <p>Or upload service account key file:</p>
            </div>
            <input
              type="file"
              accept=".json"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </>
        );

      case 'HubSpot':
        return (
          <>
            <Input 
              label="API Key" 
              type="password"
              placeholder="pat-na1-..."
              {...register("apiKey")}
              error={errors.apiKey?.message}
            />
            <Input 
              label="Portal ID (Optional)" 
              placeholder="12345678"
              {...register("portalId")}
              error={errors.portalId?.message}
            />
            <div className="text-sm text-slate-500">
              <p>You can find your API key in HubSpot Settings → Integrations → Private Apps</p>
            </div>
          </>
        );

      case 'Salesforce':
        return (
          <>
            <Input 
              label="Username" 
              placeholder="user@company.com"
              {...register("username")}
              error={errors.username?.message}
            />
            <Input 
              label="Password" 
              type="password"
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />
            <Input 
              label="Security Token" 
              type="password"
              placeholder="Security token from Salesforce"
              {...register("securityToken")}
              error={errors.securityToken?.message}
            />
            <Input 
              label="Instance URL (Optional)" 
              placeholder="https://yourinstance.salesforce.com"
              {...register("instanceUrl")}
              error={errors.instanceUrl?.message}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sandbox"
                {...register("sandbox")}
                className="h-4 w-4 text-gray-900 border-slate-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="sandbox" className="text-sm text-slate-700">
                Sandbox environment
              </label>
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">Credential form for {dataSourceType} will be implemented</p>
          </div>
        );
    }
  };

  const handleButtonClick = useCallback(async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      await onSubmit(data);
    }
  }, [form, onSubmit]);

  // Expose the submit function to parent component
  useEffect(() => {
    if (onFormReady) {
      onFormReady(handleButtonClick);
    }
  }, [onFormReady, handleButtonClick]);

  return (
    <div className="space-y-6">
      {/* Credential Form */}
      <div className="space-y-4">
        {renderCredentialFields()}
      </div>

      {/* Submit button removed - now handled by modal footer */}
    </div>
  );
}
