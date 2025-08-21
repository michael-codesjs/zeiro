import { Mastra } from "@mastra/core/mastra";
import { DynamoDBQueryAgent } from "./agents/dynamodb-agent";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY
const tableName = process.env.TABLE_NAME

const queryAgent = new DynamoDBQueryAgent({
  model: 'gpt-4o',
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  },
  database: {
    id: 'test',
    name: tableName
  },
  table_name: tableName
})

export const mastra = new Mastra({
  agents: {
    dynamodb: queryAgent.getAgent()
  },
  
});