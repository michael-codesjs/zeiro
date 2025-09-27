import { fetchAuthSession } from 'aws-amplify/auth';

// Simple global cache
let cachedSession: any = null;
let cacheExpiry = 0;

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const now = Date.now();
  
  // Use cache if still valid (5 minutes)
  if (cachedSession && now < cacheExpiry) {
    return cachedSession.tokens?.idToken ? {
      Authorization: `Bearer ${cachedSession.tokens.idToken.toString()}`
    } : {};
  }
  
  // Fetch new session
  try {
    const session = await fetchAuthSession();
    cachedSession = session;
    cacheExpiry = now + (5 * 60 * 1000);
    
    return session.tokens?.idToken ? {
      Authorization: `Bearer ${session.tokens.idToken.toString()}`
    } : {};
  } catch (error) {
    return {};
  }
};
