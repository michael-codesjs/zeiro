import { QueryGenerator, QueryResult, DatabaseSchema } from './types';

export class MySQLQueryGenerator extends QueryGenerator {
  getQueryType(): string {
    return 'sql';
  }

  getSupportedFeatures(): string[] {
    return ['MySQL query generation not yet implemented'];
  }

  async generateQuery(naturalLanguageQuery: string, databaseSchema: DatabaseSchema): Promise<QueryResult> {
    throw new Error('MySQL query generation not yet implemented. Currently only PostgreSQL is supported.');
  }
}
