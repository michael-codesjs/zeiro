import { DataSourceType } from "@/hooks/use-data-sources";

/**
 * Gets the image URL for a data source type
 * @param type - The data source type
 * @returns The path to the data source image, defaults to DynamoDB if not found
 */
export function getDataSourceImageUrl(type: DataSourceType): string {
  const imageMap: Record<DataSourceType, string> = {
    'DynamoDB': '/images/data-sources/dynamodb.png',
    'MongoDB': '/images/data-sources/mongo.png',
    'MySQL': '/images/data-sources/mysql.png',
    'PostgreSQL': '/images/data-sources/postgres.png',
    'Redis': '/images/data-sources/dynamodb.png', // fallback to DynamoDB
    'Cassandra': '/images/data-sources/dynamodb.png', // fallback to DynamoDB
    'InfluxDB': '/images/data-sources/dynamodb.png', // fallback to DynamoDB
    'Elasticsearch': '/images/data-sources/dynamodb.png', // fallback to DynamoDB
  };

  return imageMap[type] || '/images/data-sources/dynamodb.png';
}

/**
 * Gets the alt text for a data source image
 * @param type - The data source type
 * @returns The alt text for the data source image
 */
export function getDataSourceImageAlt(type: DataSourceType): string {
  return `${type} logo`;
}
