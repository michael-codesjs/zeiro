export interface DataSource {
  slug: string;
  name: string;
  description: string;
  logo: string;
  category: 'SQL Database' | 'NoSQL Database' | 'Cloud Database' | 'Data Warehouse' | 'File Storage';
  features: string[];
  benefits: string[];
  setupSteps: {
    title: string;
    description: string;
    code?: string;
  }[];
  connectionString?: string;
  documentation: string;
  pricing: 'Free' | 'Paid' | 'Freemium';
  popularity: number; // 1-5 stars
}

export const dataSources: DataSource[] = [
  {
    slug: 'postgresql',
    name: 'PostgreSQL',
    description: 'The world\'s most advanced open source relational database. PostgreSQL is known for its reliability, feature robustness, and performance.',
    logo: '/images/databases/postgres.png',
    category: 'SQL Database',
    features: [
      'ACID compliance',
      'Advanced indexing',
      'JSON support',
      'Full-text search',
      'Extensible architecture',
      'Multi-version concurrency control'
    ],
    benefits: [
      'Connect to PostgreSQL in seconds with Zeiro',
      'Query your data using natural language',
      'Automatic schema detection and optimization',
      'Real-time data synchronization',
      'Advanced analytics and visualization',
      'Enterprise-grade security'
    ],
    setupSteps: [
      {
        title: 'Add Connection Details',
        description: 'Enter your PostgreSQL connection information in Zeiro dashboard',
        code: 'Host: your-postgres-host.com\nPort: 5432\nDatabase: your_database\nUsername: your_username\nPassword: your_password'
      },
      {
        title: 'Test Connection',
        description: 'Zeiro will automatically test the connection and detect your schema'
      },
      {
        title: 'Start Querying',
        description: 'Ask questions in natural language like "Show me user signups this month"'
      }
    ],
    connectionString: 'postgresql://username:password@host:port/database',
    documentation: 'https://www.postgresql.org/docs/',
    pricing: 'Free',
    popularity: 5
  },
  {
    slug: 'mysql',
    name: 'MySQL',
    description: 'The world\'s most popular open source database. MySQL is reliable, scalable, and easy to use.',
    logo: '/images/databases/mysql.png',
    category: 'SQL Database',
    features: [
      'High performance',
      'Scalability',
      'Replication',
      'Partitioning',
      'Stored procedures',
      'Triggers'
    ],
    benefits: [
      'Seamless MySQL integration with Zeiro',
      'Natural language queries for MySQL data',
      'Automatic performance optimization',
      'Real-time analytics dashboard',
      'Advanced data visualization',
      'Secure encrypted connections'
    ],
    setupSteps: [
      {
        title: 'Configure Connection',
        description: 'Add your MySQL database credentials to Zeiro',
        code: 'Host: your-mysql-host.com\nPort: 3306\nDatabase: your_database\nUsername: your_username\nPassword: your_password'
      },
      {
        title: 'Schema Discovery',
        description: 'Zeiro automatically discovers your tables and relationships'
      },
      {
        title: 'Query with AI',
        description: 'Start asking questions like "What are my top selling products?"'
      }
    ],
    connectionString: 'mysql://username:password@host:port/database',
    documentation: 'https://dev.mysql.com/doc/',
    pricing: 'Free',
    popularity: 5
  },
  {
    slug: 'mongodb',
    name: 'MongoDB',
    description: 'The most popular NoSQL database. MongoDB is a document database with the scalability and flexibility that you want.',
    logo: '/images/databases/mongo.png',
    category: 'NoSQL Database',
    features: [
      'Document-oriented',
      'Horizontal scaling',
      'Flexible schema',
      'Rich queries',
      'Aggregation framework',
      'GridFS for large files'
    ],
    benefits: [
      'Native MongoDB support in Zeiro',
      'Query documents using natural language',
      'Automatic aggregation pipeline generation',
      'Real-time collection monitoring',
      'Advanced document analytics',
      'Secure authentication'
    ],
    setupSteps: [
      {
        title: 'Add MongoDB URI',
        description: 'Connect using your MongoDB connection string',
        code: 'mongodb://username:password@host:port/database\n\n# Or for MongoDB Atlas:\nmongodb+srv://username:password@cluster.mongodb.net/database'
      },
      {
        title: 'Collection Detection',
        description: 'Zeiro scans your collections and understands document structure'
      },
      {
        title: 'Natural Language Queries',
        description: 'Ask questions like "Show me users created last week"'
      }
    ],
    connectionString: 'mongodb://username:password@host:port/database',
    documentation: 'https://docs.mongodb.com/',
    pricing: 'Freemium',
    popularity: 5
  },
  {
    slug: 'dynamodb',
    name: 'DynamoDB',
    description: 'Amazon DynamoDB is a fast, flexible NoSQL database service for single-digit millisecond performance at any scale.',
    logo: '/images/databases/dynamodb.png',
    category: 'NoSQL Database',
    features: [
      'Serverless',
      'Single-digit millisecond latency',
      'Automatic scaling',
      'Built-in security',
      'Global tables',
      'Point-in-time recovery'
    ],
    benefits: [
      'Direct DynamoDB integration with Zeiro',
      'Query DynamoDB tables using natural language',
      'Automatic GSI and LSI optimization',
      'Real-time capacity monitoring',
      'Cost optimization insights',
      'AWS IAM integration'
    ],
    setupSteps: [
      {
        title: 'AWS Credentials',
        description: 'Configure your AWS credentials for DynamoDB access',
        code: 'AWS Access Key ID: YOUR_ACCESS_KEY\nAWS Secret Access Key: YOUR_SECRET_KEY\nRegion: us-east-1'
      },
      {
        title: 'Table Discovery',
        description: 'Zeiro discovers your DynamoDB tables and indexes automatically'
      },
      {
        title: 'Query Optimization',
        description: 'Ask questions and Zeiro optimizes queries for best performance'
      }
    ],
    documentation: 'https://docs.aws.amazon.com/dynamodb/',
    pricing: 'Paid',
    popularity: 4
  },
  {
    slug: 'redis',
    name: 'Redis',
    description: 'Redis is an open source, in-memory data structure store, used as a database, cache, and message broker.',
    logo: '/images/databases/redis.png',
    category: 'NoSQL Database',
    features: [
      'In-memory storage',
      'Data structures',
      'Pub/Sub messaging',
      'Lua scripting',
      'Transactions',
      'Clustering'
    ],
    benefits: [
      'Real-time Redis analytics with Zeiro',
      'Monitor cache performance and hit rates',
      'Query Redis data structures naturally',
      'Track memory usage and optimization',
      'Performance insights and alerts',
      'Secure Redis connections'
    ],
    setupSteps: [
      {
        title: 'Redis Connection',
        description: 'Connect to your Redis instance',
        code: 'Host: your-redis-host.com\nPort: 6379\nPassword: your_password\nDatabase: 0'
      },
      {
        title: 'Data Structure Analysis',
        description: 'Zeiro analyzes your Redis keys and data structures'
      },
      {
        title: 'Performance Monitoring',
        description: 'Monitor cache performance and get optimization insights'
      }
    ],
    connectionString: 'redis://username:password@host:port/database',
    documentation: 'https://redis.io/documentation',
    pricing: 'Free',
    popularity: 4
  },
  {
    slug: 'sqlite',
    name: 'SQLite',
    description: 'SQLite is a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.',
    logo: '/images/databases/sqlite.png',
    category: 'SQL Database',
    features: [
      'Serverless',
      'Zero-configuration',
      'Self-contained',
      'Cross-platform',
      'ACID compliant',
      'Small footprint'
    ],
    benefits: [
      'Easy SQLite integration with Zeiro',
      'Analyze local database files',
      'Natural language queries for SQLite',
      'File-based database insights',
      'Development and testing support',
      'Lightweight analytics'
    ],
    setupSteps: [
      {
        title: 'Upload Database File',
        description: 'Upload your SQLite database file to Zeiro',
        code: 'File: /path/to/your/database.db'
      },
      {
        title: 'Schema Analysis',
        description: 'Zeiro analyzes your SQLite schema and data'
      },
      {
        title: 'Query Interface',
        description: 'Start querying your SQLite data with natural language'
      }
    ],
    documentation: 'https://sqlite.org/docs.html',
    pricing: 'Free',
    popularity: 4
  },
  {
    slug: 'mariadb',
    name: 'MariaDB',
    description: 'MariaDB is a popular open source relational database that was created as a fork of MySQL.',
    logo: '/images/databases/mariadb.png',
    category: 'SQL Database',
    features: [
      'MySQL compatibility',
      'High performance',
      'Scalability',
      'Security features',
      'Storage engines',
      'Replication'
    ],
    benefits: [
      'Seamless MariaDB integration',
      'MySQL-compatible queries',
      'Advanced analytics capabilities',
      'Real-time performance monitoring',
      'Secure database connections',
      'Natural language interface'
    ],
    setupSteps: [
      {
        title: 'Database Connection',
        description: 'Configure your MariaDB connection details',
        code: 'Host: your-mariadb-host.com\nPort: 3306\nDatabase: your_database\nUsername: your_username\nPassword: your_password'
      },
      {
        title: 'Schema Discovery',
        description: 'Zeiro discovers your MariaDB tables and relationships'
      },
      {
        title: 'Analytics Ready',
        description: 'Start analyzing your MariaDB data with AI'
      }
    ],
    connectionString: 'mariadb://username:password@host:port/database',
    documentation: 'https://mariadb.org/documentation/',
    pricing: 'Free',
    popularity: 4
  },
  {
    slug: 'elasticsearch',
    name: 'Elasticsearch',
    description: 'Elasticsearch is a distributed, RESTful search and analytics engine capable of addressing a growing number of use cases.',
    logo: '/images/databases/elasticsearch.png',
    category: 'Data Warehouse',
    features: [
      'Full-text search',
      'Real-time analytics',
      'Distributed architecture',
      'RESTful API',
      'Aggregations',
      'Machine learning'
    ],
    benefits: [
      'Advanced Elasticsearch analytics',
      'Search performance insights',
      'Index optimization recommendations',
      'Query analysis and monitoring',
      'Real-time search metrics',
      'Natural language search queries'
    ],
    setupSteps: [
      {
        title: 'Elasticsearch Cluster',
        description: 'Connect to your Elasticsearch cluster',
        code: 'Host: your-elasticsearch-host.com\nPort: 9200\nUsername: elastic\nPassword: your_password'
      },
      {
        title: 'Index Discovery',
        description: 'Zeiro discovers your indices and mappings'
      },
      {
        title: 'Search Analytics',
        description: 'Analyze search performance and get optimization insights'
      }
    ],
    documentation: 'https://www.elastic.co/guide/',
    pricing: 'Freemium',
    popularity: 4
  },
  {
    slug: 'cassandra',
    name: 'Cassandra',
    description: 'Apache Cassandra is a free and open-source, distributed, wide column store, NoSQL database management system.',
    logo: '/images/databases/cassandra.png',
    category: 'NoSQL Database',
    features: [
      'Distributed architecture',
      'High availability',
      'Linear scalability',
      'Fault tolerance',
      'Tunable consistency',
      'Wide column store'
    ],
    benefits: [
      'Distributed Cassandra analytics',
      'Cluster performance monitoring',
      'Query optimization insights',
      'Keyspace and table analysis',
      'Replication factor optimization',
      'Natural language CQL queries'
    ],
    setupSteps: [
      {
        title: 'Cluster Connection',
        description: 'Connect to your Cassandra cluster',
        code: 'Contact Points: node1.cassandra.com,node2.cassandra.com\nPort: 9042\nKeyspace: your_keyspace\nUsername: cassandra\nPassword: your_password'
      },
      {
        title: 'Keyspace Discovery',
        description: 'Zeiro discovers your keyspaces and column families'
      },
      {
        title: 'Distributed Analytics',
        description: 'Analyze your distributed data with natural language'
      }
    ],
    documentation: 'https://cassandra.apache.org/doc/',
    pricing: 'Free',
    popularity: 3
  },
  {
    slug: 'neo4j',
    name: 'Neo4j',
    description: 'Neo4j is a graph database management system developed by Neo4j, Inc. It is an ACID-compliant transactional database.',
    logo: '/images/databases/neo4j.png',
    category: 'NoSQL Database',
    features: [
      'Graph database',
      'ACID transactions',
      'Cypher query language',
      'Graph algorithms',
      'Clustering',
      'Graph visualization'
    ],
    benefits: [
      'Advanced graph analytics with Zeiro',
      'Relationship pattern discovery',
      'Natural language graph queries',
      'Network analysis insights',
      'Path finding and recommendations',
      'Graph performance optimization'
    ],
    setupSteps: [
      {
        title: 'Neo4j Connection',
        description: 'Connect to your Neo4j database',
        code: 'Bolt URL: bolt://localhost:7687\nUsername: neo4j\nPassword: your_password\nDatabase: neo4j'
      },
      {
        title: 'Graph Schema Analysis',
        description: 'Zeiro analyzes your graph structure and relationships'
      },
      {
        title: 'Graph Queries',
        description: 'Query your graph data using natural language'
      }
    ],
    documentation: 'https://neo4j.com/docs/',
    pricing: 'Freemium',
    popularity: 3
  },
  {
    slug: 'sql-server',
    name: 'SQL Server',
    description: 'Microsoft SQL Server is a relational database management system developed by Microsoft.',
    logo: '/images/databases/mssql.png',
    category: 'SQL Database',
    features: [
      'Enterprise features',
      'High availability',
      'Business intelligence',
      'Advanced security',
      'In-memory processing',
      'Cloud integration'
    ],
    benefits: [
      'Enterprise SQL Server analytics',
      'Advanced performance insights',
      'Security and compliance monitoring',
      'Natural language T-SQL queries',
      'Business intelligence integration',
      'Cloud and on-premise support'
    ],
    setupSteps: [
      {
        title: 'SQL Server Connection',
        description: 'Configure your SQL Server connection',
        code: 'Server: your-sqlserver-host.com\nPort: 1433\nDatabase: your_database\nUsername: your_username\nPassword: your_password'
      },
      {
        title: 'Schema Discovery',
        description: 'Zeiro discovers your SQL Server schemas and objects'
      },
      {
        title: 'Enterprise Analytics',
        description: 'Leverage enterprise-grade analytics with natural language'
      }
    ],
    connectionString: 'mssql://username:password@host:port/database',
    documentation: 'https://docs.microsoft.com/en-us/sql/',
    pricing: 'Paid',
    popularity: 4
  },
  {
    slug: 'excel',
    name: 'Microsoft Excel',
    description: 'Microsoft Excel is a spreadsheet developed by Microsoft for Windows, macOS, Android and iOS.',
    logo: '/images/databases/excel.png',
    category: 'File Storage',
    features: [
      'Spreadsheet analysis',
      'Formula support',
      'Pivot tables',
      'Charts and graphs',
      'Data validation',
      'Macro support'
    ],
    benefits: [
      'Excel file analysis with Zeiro',
      'Natural language spreadsheet queries',
      'Automatic data type detection',
      'Advanced Excel analytics',
      'Formula optimization insights',
      'Data visualization recommendations'
    ],
    setupSteps: [
      {
        title: 'Upload Excel File',
        description: 'Upload your Excel file to Zeiro for analysis',
        code: 'Supported formats: .xlsx, .xls, .csv\nMax file size: 100MB'
      },
      {
        title: 'Sheet Analysis',
        description: 'Zeiro analyzes your Excel sheets and data structure'
      },
      {
        title: 'Spreadsheet Insights',
        description: 'Query your Excel data using natural language'
      }
    ],
    documentation: 'https://support.microsoft.com/excel',
    pricing: 'Paid',
    popularity: 5
  }
];

export function getDataSource(slug: string): DataSource | undefined {
  return dataSources.find(ds => ds.slug === slug);
}

export function getAllDataSources(): DataSource[] {
  return dataSources;
}
