import { Tool } from '@mastra/core';
import { z } from 'zod';
import { createQueryGenerator, QueryResult, DatabaseSchema } from './factory';
import { DataSource } from '../../types';

// Input schema for the query generation tool
const queryGenerationInputSchema = z.object({
  naturalLanguageQuery: z.string().describe('Natural language query from the user'),
  databaseSchema: z.object({
    tables: z.array(
      z.object({
        schema_name: z.string(),
        table_name: z.string(),
        table_owner: z.string().optional(),
      }),
    ),
    columns: z.array(
      z.object({
        table_schema: z.string(),
        table_name: z.string(),
        column_name: z.string(),
        data_type: z.string(),
        character_maximum_length: z.number().nullable().optional(),
        numeric_precision: z.number().nullable().optional(),
        numeric_scale: z.number().nullable().optional(),
        is_nullable: z.string().optional(),
        column_default: z.string().nullable().optional(),
        is_primary_key: z.boolean().optional(),
      }),
    ),
    relationships: z.array(
      z.object({
        table_schema: z.string(),
        table_name: z.string(),
        column_name: z.string(),
        foreign_table_schema: z.string(),
        foreign_table_name: z.string(),
        foreign_column_name: z.string(),
        constraint_name: z.string(),
      }),
    ).optional(),
    indexes: z.array(
      z.object({
        schema_name: z.string(),
        table_name: z.string(),
        index_name: z.string(),
        index_definition: z.string(),
      }),
    ).optional(),
    rowCounts: z.array(
      z.object({
        schema_name: z.string(),
        table_name: z.string(),
        row_count: z.number(),
        error: z.string().optional(),
      }),
    ).optional(),
  }),
});

/**
 * Factory function to create a query generation tool with prefetched data source
 * @param dataSource - The prefetched data source for context
 * @returns Configured query generation tool
 */
export function getQueryGenerationTool(dataSource: DataSource) {
  return new Tool({
    id: 'query_generation',
    description: `Generates database queries from natural language descriptions using schema information. This tool is pre-configured for data source: ${dataSource.name} (${dataSource.type}).`,
    inputSchema: queryGenerationInputSchema,
    
    execute: async ({ context }) => {
      const { naturalLanguageQuery, databaseSchema } = context;
      
      try {
        console.log('🔌 Generating query for:', naturalLanguageQuery);
        console.log(`📊 Using schema from: ${dataSource.name} (${dataSource.type})`);
        
        // Create query generator for the data source type
        const queryGenerator = createQueryGenerator(dataSource.type);
        
        // Generate the query using the specific generator
        const result = await queryGenerator.generateQuery(naturalLanguageQuery, databaseSchema);
        
        return result;
      } catch (error) {
        throw new Error(`Failed to generate ${dataSource.type} query: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  });
}


// Legacy export for backward compatibility (deprecated)
export const queryGenerationTool = new Tool({
  id: 'query_generation_legacy',
  description: 'Legacy query generation tool - use getQueryGenerationTool() factory function instead',
  inputSchema: z.object({
    dataSourceId: z.string().describe('The ID of the data source'),
    naturalLanguageQuery: z.string().describe('Natural language query from the user'),
    databaseSchema: z.any().describe('Database schema information'),
  }),
  execute: async () => {
    throw new Error('This legacy tool is deprecated. Use getQueryGenerationTool() factory function instead.');
  }
});
