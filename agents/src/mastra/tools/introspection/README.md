# Database Introspection Tools

This directory contains the database introspection tools for the Zeiro platform, organized in a modular and extensible architecture.

## Structure

```
introspection/
├── types.ts          # Base types and abstract class
├── factory.ts        # Factory pattern for creating introspectors
├── postgresql.ts     # PostgreSQL introspector implementation
├── mysql.ts          # MySQL introspector (placeholder)
├── mongodb.ts        # MongoDB introspector (placeholder)
└── index.ts          # Main exports
```

## Usage

### Basic Usage

```typescript
import { dataSourceIntrospectionTool } from './introspection-tool';

// Use as a Mastra tool
const result = await dataSourceIntrospectionTool.execute({
  dataSourceType: 'PostgreSQL',
  connectionConfig: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    username: 'user',
    password: 'password'
  }
});
```

### Direct Usage

```typescript
import { createIntrospector } from './introspection/factory';

const introspector = createIntrospector('PostgreSQL');
await introspector.connect(config);
const schemas = await introspector.introspectDatabase(options);
await introspector.disconnect();
```

## Supported Databases

### ✅ PostgreSQL
- **Status**: Fully implemented
- **Features**:
  - Complete schema analysis (tables, views, materialized views)
  - Column details with data types, constraints, and relationships
  - Index analysis (BTREE, HASH, GIN, GIST, etc.)
  - Constraint analysis (PK, FK, unique, check, etc.)
  - Trigger analysis
  - Table statistics and performance metrics
  - Data profiling (optional)
  - Sample data extraction
  - Relationship mapping
  - PostgreSQL-specific features (extensions)

### 🚧 MySQL
- **Status**: Placeholder created
- **Next Steps**: Implement MySQL-specific queries and connection handling

### 🚧 MongoDB
- **Status**: Placeholder created
- **Next Steps**: Implement document schema inference and collection analysis

### 📋 Planned
- DynamoDB
- Redis
- Cassandra
- InfluxDB
- Elasticsearch

## Adding New Database Types

To add support for a new database type:

1. **Create introspector file**: `{database}.ts`
2. **Extend base class**: 
   ```typescript
   export class DatabaseIntrospector extends DatabaseIntrospector {
     // Implement abstract methods
   }
   ```
3. **Update factory**: Add case to `createIntrospector()` function
4. **Update tool schema**: Add database type to enum in main tool

## Features

### Core Analysis
- **Schema Discovery**: Automatic detection of all schemas/databases
- **Table Analysis**: Complete table structure including columns, types, constraints
- **Index Analysis**: All index types with definitions and performance characteristics
- **Relationship Mapping**: Foreign key relationships in both directions
- **Statistics**: Row counts, sizes, performance metrics

### Advanced Features
- **Data Profiling**: Min/max values, distinct counts, null analysis
- **Sample Data**: Actual data samples for context
- **Performance Metrics**: Query performance, vacuum stats, etc.
- **Metadata**: Database version, encoding, extensions, etc.

### Configuration Options
- `schemaName`: Target specific schema
- `tableName`: Target specific table
- `sampleSize`: Number of records for sampling
- `includeIndexes`: Include index analysis
- `includeConstraints`: Include constraint analysis  
- `includeStatistics`: Include performance statistics
- `includeDataProfiling`: Include data profiling

## Output Format

```typescript
{
  dataSourceType: 'PostgreSQL',
  connectionStatus: 'connected',
  schemas: [
    {
      name: 'public',
      tables: [...],
      views: [...],
      materializedViews: [...],
      version: 'PostgreSQL 14.2',
      extensions: [...]
    }
  ],
  metadata: {
    totalSchemas: 1,
    totalTables: 25,
    totalColumns: 150,
    introspectionTimeMs: 1250,
    timestamp: '2025-01-13T...'
  }
}
```

## Error Handling

- **Connection Failures**: Graceful handling with detailed error messages
- **Permission Issues**: Fallback queries for limited permissions
- **Timeout Handling**: Configurable timeouts for large databases
- **Partial Failures**: Continue analysis even if some tables fail
