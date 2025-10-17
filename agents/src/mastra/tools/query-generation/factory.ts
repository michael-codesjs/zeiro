import { QueryGenerator } from './types';
import { PostgreSQLQueryGenerator } from './postgresql';
import { MySQLQueryGenerator } from './mysql';
import { MongoDBQueryGenerator } from './mongodb';

// Factory function to create query generators
export function createQueryGenerator(dataSourceType: string): QueryGenerator {
  switch (dataSourceType) {
    case 'PostgreSQL':
      return new PostgreSQLQueryGenerator();
    case 'MySQL':
      return new MySQLQueryGenerator(); // Will throw error for now
    case 'MongoDB':
      return new MongoDBQueryGenerator(); // Will throw error for now
    case 'DynamoDB':
      throw new Error('DynamoDB query generation not yet implemented');
    case 'Redis':
      throw new Error('Redis query generation not yet implemented');
    case 'Cassandra':
      throw new Error('Cassandra query generation not yet implemented');
    case 'Elasticsearch':
      throw new Error('Elasticsearch query generation not yet implemented');
    default:
      throw new Error(`Unsupported data source type for query generation: ${dataSourceType}`);
  }
}

// Export all types and implementations
export * from './types';
export { PostgreSQLQueryGenerator } from './postgresql';
export { MySQLQueryGenerator } from './mysql';
export { MongoDBQueryGenerator } from './mongodb';
