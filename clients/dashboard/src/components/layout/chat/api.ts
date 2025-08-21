import { post } from 'aws-amplify/api';
import { ThreadManagementResponse } from './types';

export const threadAPI = {
  async createThread(databaseId: string, title?: string, resourceId?: string): Promise<ThreadManagementResponse> {
    const restOperation = post({
      apiName: 'zeiro-api',
      path: '/chat/threads',
      options: {
        body: {
          action: 'create',
          database_id: databaseId,
          resource_id: resourceId,
          title: title
        }
      }
    });
    
    const response = await restOperation.response;
    return await response.body.json() as unknown as ThreadManagementResponse;
  },

  async listThreads(databaseId: string): Promise<ThreadManagementResponse> {
    const restOperation = post({
      apiName: 'zeiro-api',
      path: '/chat/threads',
      options: {
        body: {
          action: 'list',
          database_id: databaseId
        }
      }
    });
    
    const response = await restOperation.response;
    return await response.body.json() as unknown as ThreadManagementResponse;
  },

  async getThread(databaseId: string, threadId: string): Promise<ThreadManagementResponse> {
    const restOperation = post({
      apiName: 'zeiro-api',
      path: '/chat/threads',
      options: {
        body: {
          action: 'get',
          database_id: databaseId,
          thread_id: threadId
        }
      }
    });
    
    const response = await restOperation.response;
    return await response.body.json() as unknown as ThreadManagementResponse;
  },

  async updateThread(databaseId: string, threadId: string, title: string): Promise<ThreadManagementResponse> {
    const restOperation = post({
      apiName: 'zeiro-api',
      path: '/chat/threads',
      options: {
        body: {
          action: 'update',
          database_id: databaseId,
          thread_id: threadId,
          title: title
        }
      }
    });
    
    const response = await restOperation.response;
    return await response.body.json() as unknown as ThreadManagementResponse;
  }
}; 