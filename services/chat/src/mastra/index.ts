import { Mastra } from "@mastra/core/mastra";
import { DynamoDBAgent } from "./agents/dynamodb-agent";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { PostgreSQLAgent } from "./agents/postgres-agent";
import { MySQLAgent } from "./agents/mysql-agent";
import { SQLiteAgent } from "./agents/sqlite-agent";

const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY
const tableName = process.env.TABLE_NAME

const dynamodb = new DynamoDBAgent({
  model: anthropic('claude-4-opus-20250514'),
  credentials: {
    access_key_id: ACCESS_KEY_ID,
    secret_access_key: SECRET_ACCESS_KEY
  },
  data_source: {
    id: 'test',
    name: '',
    table_name: tableName
  },
  user_id: 'test'
  // table_name: tableName
})

const postgres = new PostgreSQLAgent({
  model: anthropic('claude-4-opus-20250514'),
  credentials: {
    username: 'michaelphiri',
    password: ''
  },
  data_source: {
    id: 'test', 
    name: 'opsiq_local',
    database_name: 'opsiq_local',
    host: 'test',
    port: 5432
  },
  user_id: 'test'
})

const mysql = new MySQLAgent({
  model: openai('gpt-4-turbo'), 
  credentials: {
    username: 'test',
    password: 'test'
  },
  data_source: {
    id: 'test',
    name: '',
    database_name: 'test',
    host: 'test',
    port: 3306
  },
  user_id: 'test'
})

const sqlite = new SQLiteAgent({
  model: openai('gpt-4-turbo'),
  data_source: {
    id: 'test',
    name: '',
    database_path: 'test'
  },
  user_id: 'test'
})

export const mastra = new Mastra({
  agents: {
    dynamodb: dynamodb.getAgent(),
    postgres: postgres.getAgent(),
    mysql: mysql.getAgent(),
    sqlite: sqlite.getAgent()
  },
});