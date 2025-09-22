import { put } from 'aws-amplify/api';

export type UpdateWorkspaceData = {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
};

export const updateWorkspace = async ({ 
  workspaceId, 
  data 
}: { 
  workspaceId: string; 
  data: UpdateWorkspaceData 
}): Promise<any> => {
  try {
    const restOperation = put({
      apiName: 'zeiro-api',
      path: `/workspaces/${workspaceId}`,
      options: {
        body: data,
      },
    });

    const response = await restOperation.response;
    
    if (response.statusCode !== 200) {
      const errorData = await response.body.json();
      throw new Error(errorData.error || 'Failed to update workspace');
    }

    const result = await response.body.json();
    console.log('Update workspace response:', result);
    
    return result;
  } catch (err) {
    console.error('Error updating workspace:', err);
    throw err;
  }
};
