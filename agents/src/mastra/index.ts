import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { Zeiro } from './agents';
import { mockPostgresDataSource } from '../test-data/mock-datasource';

const user_id = process.env.USER_ID || 'test-user-id'

const zeiro = new Zeiro({
  user_id: user_id,
  dataSource: mockPostgresDataSource
});

// Initialize and export the Mastra instance
export const mastra = new Mastra({
  agents: { 
    'Zeiro BI AI Agent': zeiro.getAgent(),
  },
  logger: new PinoLogger({
    name: 'Zeiro Data Insights Mastra',
    level: 'info',
  }),
});
