import { DatabaseIntrospector } from './types';
import { PostgreSQLIntrospector } from './postgresql';
import { MySQLIntrospector } from './mysql';
import { MongoDBIntrospector } from './mongodb';

// Factory function to create introspectors
export function createIntrospector(dataSourceType: string): DatabaseIntrospector {
  switch (dataSourceType) {
    case 'PostgreSQL':
      return new PostgreSQLIntrospector();
    case 'MySQL':
      return new MySQLIntrospector(); // Placeholder - throws error for now
    case 'MongoDB':
      return new MongoDBIntrospector(); // Placeholder - throws error for now
    case 'DynamoDB':
      throw new Error('DynamoDB introspection not yet implemented');
    case 'Redis':
      throw new Error('Redis introspection not yet implemented');
    case 'Cassandra':
      throw new Error('Cassandra introspection not yet implemented');
    default:
      throw new Error(`Unsupported data source type: ${dataSourceType}`);
  }
}

// Export all types and implementations
export * from './types';
export { PostgreSQLIntrospector } from './postgresql';
export { MySQLIntrospector } from './mysql';
export { MongoDBIntrospector } from './mongodb';
