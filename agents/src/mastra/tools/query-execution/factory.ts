import { QueryExecutor } from './types';
import { PostgreSQLQueryExecutor } from './postgresql';
import { DataSource } from '../../types';

/**
 * Factory function to create the appropriate query executor based on data source type
 */
export function createQueryExecutor(dataSource: DataSource): QueryExecutor {
  switch (dataSource.type.toLowerCase()) {
    case 'postgresql':
    case 'postgres':
      return new PostgreSQLQueryExecutor(dataSource);
    
    case 'mysql':
    case 'mariadb':
      throw new Error('MySQL query execution is not yet implemented. Coming soon!');
    
    case 'mongodb':
      throw new Error('MongoDB query execution is not yet implemented. Coming soon!');
    
    case 'sqlite':
      throw new Error('SQLite query execution is not yet implemented. Coming soon!');
    
    case 'mssql':
    case 'sqlserver':
      throw new Error('SQL Server query execution is not yet implemented. Coming soon!');
    
    default:
      throw new Error(`Unsupported data source type for query execution: ${dataSource.type}`);
  }
}

// Re-export types for convenience
export * from './types';
