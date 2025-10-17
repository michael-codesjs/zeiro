"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button } from "../../../components/ui";
import { DataSourceType } from "../../../data/data-source-types";

// Connection schemas for different data source types
const postgresSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1, "Port is required").max(65535, "Invalid port number"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().optional(),
});

const mysqlSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1, "Port is required").max(65535, "Invalid port number"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().optional(),
});

const dynamodbSchema = z.object({
  region: z.string().min(1, "AWS Region is required"),
  accessKeyId: z.string().min(1, "Access Key ID is required"),
  secretAccessKey: z.string().min(1, "Secret Access Key is required"),
});

type PostgresConnectionData = z.infer<typeof postgresSchema>;
type MySQLConnectionData = z.infer<typeof mysqlSchema>;
type DynamoDBConnectionData = z.infer<typeof dynamodbSchema>;

export type ConnectionData = PostgresConnectionData | MySQLConnectionData | DynamoDBConnectionData;

interface ConnectionDetailsFormProps {
  dataSourceType: DataSourceType;
  dataSourceName: string;
  onSubmit: (data: ConnectionData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export default function ConnectionDetailsForm({
  dataSourceType,
  dataSourceName,
  onSubmit,
  onBack,
  isLoading = false
}: ConnectionDetailsFormProps) {
  // Get the appropriate schema based on data source type
  const getSchema = () => {
    switch (dataSourceType) {
      case 'PostgreSQL':
        return postgresSchema;
      case 'MySQL':
        return mysqlSchema;
      case 'DynamoDB':
        return dynamodbSchema;
      default:
        throw new Error(`Unsupported data source type: ${dataSourceType}`);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(getSchema()),
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  function getDefaultValues() {
    switch (dataSourceType) {
      case 'PostgreSQL':
        return { host: "", port: 5432, database: "", username: "", password: "", ssl: false };
      case 'MySQL':
        return { host: "", port: 3306, database: "", username: "", password: "", ssl: false };
      case 'DynamoDB':
        return { region: "us-east-1", accessKeyId: "", secretAccessKey: "" };
      default:
        return {};
    }
  }

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const renderPostgresForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Host"
          placeholder="localhost"
          {...register("host")}
          error={errors.host?.message}
          isRequired
        />
        <Input
          label="Port"
          type="number"
          placeholder="5432"
          {...register("port", { valueAsNumber: true })}
          error={errors.port?.message}
          isRequired
        />
      </div>
      
      <Input
        label="Database Name"
        placeholder="my_database"
        {...register("database")}
        error={errors.database?.message}
        isRequired
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Username"
          placeholder="postgres"
          {...register("username")}
          error={errors.username?.message}
          isRequired
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
          isRequired
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ssl"
          {...register("ssl")}
          className="rounded border-slate-300"
        />
        <label htmlFor="ssl" className="text-sm text-slate-700">
          Enable SSL connection
        </label>
      </div>
    </>
  );

  const renderMySQLForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Host"
          placeholder="localhost"
          {...register("host")}
          error={errors.host?.message}
          isRequired
        />
        <Input
          label="Port"
          type="number"
          placeholder="3306"
          {...register("port", { valueAsNumber: true })}
          error={errors.port?.message}
          isRequired
        />
      </div>
      
      <Input
        label="Database Name"
        placeholder="my_database"
        {...register("database")}
        error={errors.database?.message}
        isRequired
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Username"
          placeholder="root"
          {...register("username")}
          error={errors.username?.message}
          isRequired
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password?.message}
          isRequired
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ssl"
          {...register("ssl")}
          className="rounded border-slate-300"
        />
        <label htmlFor="ssl" className="text-sm text-slate-700">
          Enable SSL connection
        </label>
      </div>
    </>
  );

  const renderDynamoDBForm = () => (
    <>
      <Input
        label="AWS Region"
        placeholder="us-east-1"
        {...register("region")}
        error={errors.region?.message}
        isRequired
      />
      
      <Input
        label="Access Key ID"
        placeholder="AKIA..."
        {...register("accessKeyId")}
        error={errors.accessKeyId?.message}
        isRequired
      />
      
      <Input
        label="Secret Access Key"
        type="password"
        placeholder="••••••••"
        {...register("secretAccessKey")}
        error={errors.secretAccessKey?.message}
        isRequired
      />
    </>
  );

  const renderForm = () => {
    switch (dataSourceType) {
      case 'PostgreSQL':
        return renderPostgresForm();
      case 'MySQL':
        return renderMySQLForm();
      case 'DynamoDB':
        return renderDynamoDBForm();
      default:
        return <div>Unsupported data source type</div>;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {renderForm()}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !isValid}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create Data Source</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
