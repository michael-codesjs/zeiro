'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BsSearch as Search } from 'react-icons/bs';

interface DataSource {
  name: string;
  image: string;
  category: 'database' | 'warehouse' | 'cache' | 'search' | 'graph' | 'document' | 'communication' | 'productivity' | 'automation' | 'storage';
  type: 'input' | 'output';
}

const dataSources: DataSource[] = [
  // Input Sources (Data FROM these sources)
  { name: 'PostgreSQL', image: '/images/databases/postgres.png', category: 'database', type: 'input' },
  { name: 'MySQL', image: '/images/databases/mysql.png', category: 'database', type: 'input' },
  { name: 'MongoDB', image: '/images/databases/mongo.png', category: 'document', type: 'input' },
  { name: 'DynamoDB', image: '/images/databases/dynamodb.png', category: 'database', type: 'input' },
  { name: 'Redis', image: '/images/databases/redis.png', category: 'cache', type: 'input' },
  { name: 'SQLite', image: '/images/databases/sqlite.png', category: 'database', type: 'input' },
  { name: 'MariaDB', image: '/images/databases/mariadb.png', category: 'database', type: 'input' },
  { name: 'Elasticsearch', image: '/images/databases/elasticsearch.svg', category: 'search', type: 'input' },
  { name: 'Cassandra', image: '/images/databases/cassandra.svg', category: 'database', type: 'input' },
  { name: 'Neo4j', image: '/images/databases/neo4j.svg', category: 'graph', type: 'input' },
  { name: 'Oracle', image: '/images/databases/oracle.svg', category: 'database', type: 'input' },
  { name: 'SQL Server', image: '/images/databases/mssql.svg', category: 'database', type: 'input' },
  
  // Output Integrations (Send data TO these services)
  { name: 'Gmail', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', category: 'communication', type: 'output' },
  { name: 'Slack', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg', category: 'communication', type: 'output' },
  { name: 'Microsoft Teams', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg', category: 'communication', type: 'output' },
  { name: 'Discord', image: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', category: 'communication', type: 'output' },
  { name: 'Notion', image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png', category: 'productivity', type: 'output' },
  { name: 'Airtable', image: 'https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png', category: 'productivity', type: 'output' },
  { name: 'Google Sheets', image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg', category: 'productivity', type: 'output' },
  { name: 'Zapier', image: 'https://cdn.zapier.com/storage/photos/9ec65c79de8ae54080c98384d4e7b259.png', category: 'automation', type: 'output' },
  { name: 'Webhooks', image: 'https://cdn-icons-png.flaticon.com/512/2091/2091665.png', category: 'automation', type: 'output' },
  { name: 'AWS S3', image: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Amazon-S3-Logo.svg', category: 'storage', type: 'output' },
  { name: 'Google Drive', image: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg', category: 'storage', type: 'output' },
  { name: 'Dropbox', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg', category: 'storage', type: 'output' },
];

interface SupportedDataSourcesProps {
  variant?: 'scroll' | 'grid';
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  filterType?: 'all' | 'input' | 'output';
}

export default function SupportedDataSources({ 
  variant = 'scroll', 
  title = 'Connect to any data source',
  subtitle = 'From databases to spreadsheets, we support all your favorite tools',
  showSearch = false,
  filterType = 'all'
}: SupportedDataSourcesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDataSources = dataSources
    .filter(source => filterType === 'all' || source.type === filterType)
    .filter(source => source.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (variant === 'grid') {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
            <p className="text-xl text-gray-400 mb-8">{subtitle}</p>
            
            {showSearch && (
              <div className="max-w-md mx-auto relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search data sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredDataSources.map((source) => (
              <div key={source.name} className="flex items-center justify-center hover:opacity-80 transition-opacity duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Image 
                      src={source.image} 
                      alt={source.name} 
                      width={64} 
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-medium text-sm">{source.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {showSearch && filteredDataSources.length === 0 && (
            <div className="text-center mt-12">
              <p className="text-gray-400">No data sources found matching "{searchTerm}"</p>
              <p className="text-gray-500 text-sm mt-2">Don't see your data source? <span className="text-white hover:text-gray-300 cursor-pointer">Contact us</span> and we'll add it.</p>
            </div>
          )}
          
          {showSearch && filteredDataSources.length > 0 && searchTerm && (
            <div className="text-center mt-12">
              <p className="text-gray-400">Found {filteredDataSources.length} data source{filteredDataSources.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Scroll variant (default)
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-xl text-gray-400">{subtitle}</p>
      </div>
      
      {/* Scrollable Database Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-12 min-w-max px-4">
            {dataSources.map((source) => (
              <div key={source.name} className="flex items-center justify-center min-w-[140px] hover:opacity-80 transition-opacity duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Image 
                      src={source.image} 
                      alt={source.name} 
                      width={64} 
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-white font-medium">{source.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-8">
          <p className="text-sm text-gray-500">← Scroll to see more data sources →</p>
        </div>
      </div>
    </section>
  );
}
