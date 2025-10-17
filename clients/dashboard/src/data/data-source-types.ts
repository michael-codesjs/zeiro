// Data source types
export type DataSourceType = 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'Redis' | 'Cassandra' | 'InfluxDB' | 'Elasticsearch' | 'MariaDB' | 'SQLite' | 'MSSQL' | 'Neo4j' | 'Excel' | 'GoogleSheets' | 'HubSpot' | 'Salesforce';

// Data source types with images and descriptions
export const DATA_SOURCE_TYPES = [
  {
    value: "PostgreSQL",
    label: "PostgreSQL",
    description: "Open source relational database",
    image: "/images/data-sources/postgres.png",
    color: "text-blue-600"
  },
  {
    value: "MySQL",
    label: "MySQL",
    description: "Popular relational database",
    image: "/images/data-sources/mysql.png",
    color: "text-orange-600"
  },
  {
    value: "MongoDB",
    label: "MongoDB",
    description: "Document-oriented NoSQL database",
    image: "/images/data-sources/mongo.png",
    color: "text-green-600"
  },
  {
    value: "DynamoDB",
    label: "DynamoDB",
    description: "AWS managed NoSQL database",
    image: "/images/data-sources/dynamodb.png",
    color: "text-yellow-600"
  },
  {
    value: "Redis",
    label: "Redis",
    description: "In-memory data structure store",
    image: "/images/data-sources/redis.png",
    color: "text-red-600"
  },
  {
    value: "Cassandra",
    label: "Cassandra",
    description: "Distributed NoSQL database",
    image: "/images/data-sources/cassandra.png",
    color: "text-purple-600"
  },
  {
    value: "InfluxDB",
    label: "InfluxDB",
    description: "Time series database",
    image: "/images/data-sources/postgres.png", // Using postgres as fallback since InfluxDB image not available
    color: "text-indigo-600"
  },
  {
    value: "Elasticsearch",
    label: "Elasticsearch",
    description: "Search and analytics engine",
    image: "/images/data-sources/elasticsearch.png",
    color: "text-teal-600"
  },
  {
    value: "MariaDB",
    label: "MariaDB",
    description: "MySQL-compatible relational database",
    image: "/images/data-sources/mariadb.png",
    color: "text-blue-700"
  },
  {
    value: "SQLite",
    label: "SQLite",
    description: "Lightweight embedded database",
    image: "/images/data-sources/sqlite.png",
    color: "text-gray-600"
  },
  {
    value: "MSSQL",
    label: "Microsoft SQL Server",
    description: "Microsoft's relational database",
    image: "/images/data-sources/mssql.png",
    color: "text-blue-800"
  },
  {
    value: "Neo4j",
    label: "Neo4j",
    description: "Graph database platform",
    image: "/images/data-sources/neo4j.png",
    color: "text-green-700"
  },
  {
    value: "Excel",
    label: "Microsoft Excel",
    description: "Excel spreadsheet files",
    image: "/images/data-sources/excel.png",
    color: "text-green-600"
  },
  {
    value: "GoogleSheets",
    label: "Google Sheets",
    description: "Google Sheets spreadsheets",
    image: "/images/data-sources/google-sheets.png",
    color: "text-green-600"
  },
  {
    value: "HubSpot",
    label: "HubSpot",
    description: "CRM and marketing platform",
    image: "/images/data-sources/hubspot.png",
    color: "text-orange-600"
  },
  {
    value: "Salesforce",
    label: "Salesforce",
    description: "Customer relationship management",
    image: "/images/data-sources/salesforce.png",
    color: "text-blue-600"
  }
] as const;
