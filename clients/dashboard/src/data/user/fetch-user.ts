import { get } from 'aws-amplify/api';

export type User = {
  id: string;
  cognito_user_id: string;
  email: string;
  name: string;
  workspace_id: string;
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const restOperation = get({
      apiName: 'zeiro-api',
      path: '/user/me',
    });

    const response = await restOperation.response;
    
    if (response.statusCode === 404) {
      throw new Error('User not found');
    }

    const userData = await response.body.json();
    return userData as User;
    
  } catch (err) {
    console.error('Error fetching current user:', err);
    throw err;
  }
};
