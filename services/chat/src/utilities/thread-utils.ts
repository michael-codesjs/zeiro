/**
 * Utility functions for thread management and title generation
 */

/**
 * Generate a smart thread title from a user query
 * @param query The user's natural language query
 * @returns A clean, descriptive title for the thread
 */
export function generateThreadTitle(query: string): string {
  // Remove common query prefixes and clean up
  let title = query
    .replace(/^(show me|give me|get|find|list|display|what|how|why|when|where|can you|could you|please|i want|i need)/i, '')
    .trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Truncate if too long
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  // Fallback titles for common patterns
  if (title.length < 5) {
    if (query.toLowerCase().includes('data')) return 'Data Exploration';
    if (query.toLowerCase().includes('query')) return 'Database Query';
    if (query.toLowerCase().includes('table')) return 'Table Analysis';
    if (query.toLowerCase().includes('record')) return 'Record Search';
    if (query.toLowerCase().includes('count')) return 'Count Analysis';
    if (query.toLowerCase().includes('sum')) return 'Sum Calculation';
    if (query.toLowerCase().includes('average') || query.toLowerCase().includes('avg')) return 'Average Calculation';
    if (query.toLowerCase().includes('group')) return 'Group Analysis';
    if (query.toLowerCase().includes('filter')) return 'Filtered Search';
    if (query.toLowerCase().includes('sort')) return 'Sorted Results';
    if (query.toLowerCase().includes('recent')) return 'Recent Data';
    if (query.toLowerCase().includes('latest')) return 'Latest Records';
    if (query.toLowerCase().includes('total')) return 'Total Summary';
    return 'New Conversation';
  }
  
  return title;
}

/**
 * Extract keywords from a query for categorization
 * @param query The user's query
 * @returns Array of relevant keywords
 */
export function extractQueryKeywords(query: string): string[] {
  const keywords: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Database operation keywords
  if (lowerQuery.includes('select') || lowerQuery.includes('get') || lowerQuery.includes('find')) {
    keywords.push('read');
  }
  if (lowerQuery.includes('count')) keywords.push('count');
  if (lowerQuery.includes('sum')) keywords.push('aggregate');
  if (lowerQuery.includes('group')) keywords.push('group');
  if (lowerQuery.includes('filter') || lowerQuery.includes('where')) keywords.push('filter');
  if (lowerQuery.includes('sort') || lowerQuery.includes('order')) keywords.push('sort');
  
  // Time-related keywords
  if (lowerQuery.includes('recent') || lowerQuery.includes('latest') || lowerQuery.includes('new')) {
    keywords.push('recent');
  }
  if (lowerQuery.includes('old') || lowerQuery.includes('previous') || lowerQuery.includes('past')) {
    keywords.push('historical');
  }
  
  // Data type keywords
  if (lowerQuery.includes('user') || lowerQuery.includes('customer')) keywords.push('users');
  if (lowerQuery.includes('product')) keywords.push('products');
  if (lowerQuery.includes('order')) keywords.push('orders');
  if (lowerQuery.includes('transaction')) keywords.push('transactions');
  
  return keywords;
}

/**
 * Generate thread metadata based on query analysis
 * @param query The user's query
 * @param databaseId The database ID
 * @param tableName The table name
 * @returns Metadata object for the thread
 */
export function generateThreadMetadata(query: string, databaseId: string, tableName: string): Record<string, unknown> {
  const keywords = extractQueryKeywords(query);
  
  return {
    databaseId,
    tableName,
    keywords,
    queryType: keywords.length > 0 ? keywords[0] : 'general',
    createdAt: new Date().toISOString(),
    originalQuery: query.substring(0, 200) // Store first 200 chars of original query
  };
} 