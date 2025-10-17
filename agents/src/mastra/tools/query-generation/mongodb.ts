import { QueryGenerator, QueryResult, DatabaseSchema } from './types';

export class MongoDBQueryGenerator extends QueryGenerator {
  getQueryType(): string {
    return 'mongodb';
  }

  getSupportedFeatures(): string[] {
    return ['MongoDB query generation not yet implemented'];
  }

  async generateQuery(naturalLanguageQuery: string, databaseSchema: DatabaseSchema): Promise<QueryResult> {
    throw new Error('MongoDB query generation not yet implemented. Currently only PostgreSQL is supported.');
  }
}
