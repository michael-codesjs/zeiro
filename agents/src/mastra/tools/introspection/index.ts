import { Tool } from '@mastra/core';
import { z } from 'zod';
import { createIntrospector, IntrospectionResult } from './factory';
import { DataSource } from '../../types';

// Input schema for the introspection tool (without dataSourceId and userId)
const introspectionInputSchema = z.object({
  // Optional parameters for analysis
  schemaName: z.string().optional().describe('Specific schema to analyze (PostgreSQL/MySQL)'),
  tableName: z.string().optional().describe('Specific table/collection to analyze (optional - analyzes all if not provided)'),
  sampleSize: z.number().min(1).max(1000).default(100).describe('Number of sample records to analyze for data profiling'),
  includeIndexes: z.boolean().default(true).describe('Whether to include index information'),
  includeConstraints: z.boolean().default(true).describe('Whether to include constraint information'),
  includeStatistics: z.boolean().default(true).describe('Whether to include table statistics'),
  includeDataProfiling: z.boolean().default(false).describe('Whether to include data profiling (min/max/avg values, etc.)')
});

/**
 * Factory function to create a data source introspection tool with prefetched data source and credential
 * @param dataSource - The prefetched data source with decrypted credential
 * @returns Configured introspection tool
 */
export function getDataSourceIntrospectionTool(dataSource: DataSource) {
  return new Tool({
    id: 'data_source_introspection',
    description: `Introspects the configured data source to analyze its complete schema, including tables, columns, indexes, constraints, relationships, and statistics. This tool is pre-configured for data source: ${dataSource.name} (${dataSource.type}).`,
    inputSchema: introspectionInputSchema,
    
    execute: async ({ context }) => {
      const { schemaName, tableName, sampleSize, includeIndexes, includeConstraints, includeStatistics, includeDataProfiling } = context;
      const startTime = Date.now();
      
      try {
        console.log(`Using prefetched data source: ${dataSource.name} (${dataSource.id})`);
        
        if (!dataSource) {
          throw new Error(`Data source configuration is missing or invalid`);
        }
        
        // Extract data source information
        const dataSourceType = dataSource.type;
        const connectionConfig = dataSource.connection_config;
        const credential = dataSource.credential;
        
        console.log(`Data source type: ${dataSourceType}`);
        
        // Merge connection config with decrypted credential data
        let finalConnectionConfig = { ...connectionConfig };
        
        if (credential) {
          console.log(`Using decrypted credential: ${credential.id}`);
          
          // Merge credential secrets into connection config
          if (credential.secrets) {
            finalConnectionConfig = { ...finalConnectionConfig, ...credential.secrets };
          }
          
          // Handle backward compatibility: normalize database_name to database
          if ((finalConnectionConfig as any).database_name && !(finalConnectionConfig as any).database) {
            (finalConnectionConfig as any).database = (finalConnectionConfig as any).database_name;
            delete (finalConnectionConfig as any).database_name;
          }
          
          console.log('Connection configured with credential data');
        } else {
          console.log('No credential found, using connection config only');
        }

        // Create introspector for the data source type
        const introspector = createIntrospector(dataSourceType);
        
        // Connect to data source
        await introspector.connect(finalConnectionConfig);
        
        // Test connection
        const isConnected = await introspector.testConnection();
        if (!isConnected) {
          throw new Error('Failed to establish connection to data source');
        }

        // Perform introspection
        const schemas = await introspector.introspectDatabase({
          schemaName,
          tableName,
          sampleSize,
          includeIndexes,
          includeConstraints,
          includeStatistics,
          includeDataProfiling
        });

        // Disconnect
        await introspector.disconnect();

        const endTime = Date.now();
        
        // Calculate totals from compact format
        const totalSchemas = 1;
        const totalTables = schemas.table_count || schemas.tables.length;
        const totalColumns = schemas.tables.reduce((sum: number, table: any) => 
          sum + (Array.isArray(table.columns) ? table.columns.length : 0), 0
        );

        const result: IntrospectionResult = {
          dataSourceType,
          connectionStatus: 'connected',
          schemas,
          metadata: {
            totalSchemas,
            totalTables,
            totalColumns,
            introspectionTimeMs: endTime - startTime,
            timestamp: new Date().toISOString()
          }
        };

        return result;

      } catch (error) {
        const endTime = Date.now();
        
        console.error('Introspection failed:', error);
        
        const result: IntrospectionResult = {
          dataSourceType: 'unknown',
          connectionStatus: 'failed',
          schemas: [],
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          metadata: {
            totalSchemas: 0,
            totalTables: 0,
            totalColumns: 0,
            introspectionTimeMs: endTime - startTime,
            timestamp: new Date().toISOString()
          }
        };

        return result;
      }
    }
  });
}

// Legacy export for backward compatibility (deprecated)
export const dataSourceIntrospectionTool = new Tool({
  id: 'data_source_introspection_legacy',
  description: 'Legacy introspection tool - use getDataSourceIntrospectionTool() factory function instead',
  inputSchema: z.object({
    dataSourceId: z.string().describe('The ID of the data source to introspect'),
    userId: z.string().describe('The user ID who owns the data source'),
    schemaName: z.string().optional().describe('Specific schema to analyze (PostgreSQL/MySQL)'),
    tableName: z.string().optional().describe('Specific table/collection to analyze (optional - analyzes all if not provided)'),
    sampleSize: z.number().min(1).max(1000).default(100).describe('Number of sample records to analyze for data profiling'),
    includeIndexes: z.boolean().default(true).describe('Whether to include index information'),
    includeConstraints: z.boolean().default(true).describe('Whether to include constraint information'),
    includeStatistics: z.boolean().default(true).describe('Whether to include table statistics'),
    includeDataProfiling: z.boolean().default(false).describe('Whether to include data profiling (min/max/avg values, etc.)')
  }),
  execute: async () => {
    throw new Error('This legacy tool is deprecated. Use getDataSourceIntrospectionTool() factory function instead.');
  }
});