import { useMemo } from 'react';
import { type Database, type DataSourceWithData } from './use-data-sources';

export interface ColumnInfo {
  key: string;
  type: string;
  isKey: boolean;
}

export const useDataViewerColumns = (
  dataSourceData: DataSourceWithData | undefined,
  database: Database | null | undefined,
  activeExecutionId: string | null,
  results: Record<string, any>
) => {
  // Helper function to infer data type
  const inferType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  // Helper function to detect if a column is a key (partition key or GSI key)
  const isKeyColumn = (columnName: string): boolean => {
    const keyPatterns = [
      /^PK$/i,           // Partition Key
      /^SK$/i,           // Sort Key
      /^GSI\d*PK$/i,     // GSI Partition Key (GSI1PK, GSI2PK, etc.)
      /^GSI\d*SK$/i,     // GSI Sort Key (GSI1SK, GSI2SK, etc.)
      /^id$/i,           // Common ID field
      /.*[Ii]d$/,        // Fields ending with 'id' or 'Id'
      /.*[Kk]ey$/        // Fields ending with 'key' or 'Key'
    ];
    
    return keyPatterns.some(pattern => pattern.test(columnName));
  };

  // Helper function to determine the display order of key columns
  const getKeyOrder = (columnName: string): number => {
    if (/^PK$/i.test(columnName)) return 1;        // Primary partition key first
    if (/^SK$/i.test(columnName)) return 2;        // Primary sort key second
    if (/^GSI1PK$/i.test(columnName)) return 3;    // GSI1 partition key
    if (/^GSI1SK$/i.test(columnName)) return 4;    // GSI1 sort key
    if (/^GSI2PK$/i.test(columnName)) return 5;    // GSI2 partition key
    if (/^GSI2SK$/i.test(columnName)) return 6;    // GSI2 sort key
    if (/^GSI\d+PK$/i.test(columnName)) return 7;  // Other GSI partition keys
    if (/^GSI\d+SK$/i.test(columnName)) return 8;  // Other GSI sort keys
    if (/^id$/i.test(columnName)) return 9;        // ID fields
    if (/.*[Ii]d$/.test(columnName)) return 10;    // Other ID fields
    if (/.*[Kk]ey$/.test(columnName)) return 11;   // Other key fields
    return 12; // Fallback for other keys
  };

  // Extract column information from schema or fallback to current result
  const columns = useMemo((): ColumnInfo[] => {
    // First priority: Use schema from get-data-source endpoint
    if (dataSourceData?.schema?.discoveredFields && dataSourceData.schema.discoveredFields.length > 0) {
      const schemaFields = dataSourceData.schema.discoveredFields;
      
      // Sort fields by importance (keys first, then alphabetical)
      const sortedFields = [...schemaFields].sort((a, b) => {
        const aIsKey = a.isKey || false;
        const bIsKey = b.isKey || false;

        // Keys come first
        if (aIsKey && !bIsKey) return -1;
        if (!aIsKey && bIsKey) return 1;

        // Within keys, sort by key hierarchy
        if (aIsKey && bIsKey) {
          const aOrder = getKeyOrder(a.name);
          const bOrder = getKeyOrder(b.name);
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        // For non-keys, alphabetical order
        return a.name.localeCompare(b.name);
      });

      return sortedFields.map(field => ({
        key: field.name,
        type: field.type,
        isKey: field.isKey || false
      }));
    }

    // Second priority: Use discovered fields from metadata (legacy)
    const discoveredTables = database?.metadata?.discovered_tables;
    if (discoveredTables && Object.keys(discoveredTables).length > 0) {
      // Extract all unique field names from all discovered tables
      const allFields = new Set<string>();
      const fieldDetails: Record<string, { type: string; frequency: number }> = {};

      Object.values(discoveredTables).forEach(tableInfo => {
        tableInfo.discovered_fields.forEach(field => {
          allFields.add(field.name);
          // Keep the field with highest frequency if there are duplicates across tables
          if (!fieldDetails[field.name] || field.frequency > fieldDetails[field.name].frequency) {
            fieldDetails[field.name] = {
              type: field.type,
              frequency: field.frequency
            };
          }
        });
      });

      // Sort fields by importance (keys first, then by frequency)
      const sortedFields = Array.from(allFields).sort((a, b) => {
        const aIsKey = isKeyColumn(a);
        const bIsKey = isKeyColumn(b);

        // Keys come first
        if (aIsKey && !bIsKey) return -1;
        if (!aIsKey && bIsKey) return 1;

        // Within keys, sort by key hierarchy
        if (aIsKey && bIsKey) {
          const aOrder = getKeyOrder(a);
          const bOrder = getKeyOrder(b);
          if (aOrder !== bOrder) return aOrder - bOrder;
        }

        // Within same category, sort by frequency (higher first)
        return fieldDetails[b].frequency - fieldDetails[a].frequency;
      });

      return sortedFields.map(fieldName => ({
        key: fieldName,
        type: fieldDetails[fieldName].type,
        isKey: isKeyColumn(fieldName)
      }));
    }

    // Fallback: Extract from current result data
    const items = activeExecutionId ? results[activeExecutionId]?.data || [] : [];
    if (!items.length) return [];

    const allKeys = new Set<string>();

    // Get only top-level keys from all items (no nested flattening)
    items.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => {
          allKeys.add(key);
        });
      }
    });

    // Convert to array and sort by key importance
    const columnArray = Array.from(allKeys).map(key => ({
      key,
      type: inferType(items[0]?.[key]),
      isKey: isKeyColumn(key)
    }));

    // Sort columns: keys first, then regular columns
    return columnArray.sort((a, b) => {
      // Primary keys and GSI keys come first
      if (a.isKey && !b.isKey) return -1;
      if (!a.isKey && b.isKey) return 1;
      
      // Within keys, sort by specific key hierarchy
      if (a.isKey && b.isKey) {
        const aOrder = getKeyOrder(a.key);
        const bOrder = getKeyOrder(b.key);
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      
      // For non-keys, alphabetical order
      return a.key.localeCompare(b.key);
    });
  }, [dataSourceData?.schema?.discoveredFields, database?.metadata?.discovered_tables, activeExecutionId, results]);

  return {
    columns,
  };
};
