import { del } from 'aws-amplify/api';

export const deleteCredential = async (id: string): Promise<void> => {
  try {
    const restOperation = del({
      apiName: 'zeiro-api',
      path: `/credentials/${id}`,
    });

    const response = await restOperation.response;
    
    if (response.statusCode !== 200 && response.statusCode !== 204) {
      throw new Error(`Failed to delete credential: ${response.statusCode}`);
    }
    
  } catch (err) {
    console.error('Error deleting credential:', err);
    throw err;
  }
};
