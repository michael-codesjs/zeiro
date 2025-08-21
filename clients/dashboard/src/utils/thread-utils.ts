/**
 * Frontend utility functions for thread management and title generation
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
 * Get a thread icon based on query keywords
 * @param query The user's query
 * @returns SVG icon element as string
 */
export function getThreadIcon(query: string): string {
  const keywords = extractQueryKeywords(query);
  const lowerQuery = query.toLowerCase();
  
  if (keywords.includes('count') || lowerQuery.includes('total')) {
    return 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z';
  }
  
  if (keywords.includes('recent') || keywords.includes('historical')) {
    return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
  }
  
  if (keywords.includes('users')) {
    return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z';
  }
  
  if (keywords.includes('filter') || keywords.includes('sort')) {
    return 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z';
  }
  
  // Default chat icon
  return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l2.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z';
} 