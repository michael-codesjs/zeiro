import { put } from 'aws-amplify/api';

export type UpdateUserData = {
  name?: string;
  email?: string;
};

export const updateUser = async (userData: UpdateUserData): Promise<void> => {
  try {
    const restOperation = put({
      apiName: 'zeiro-api',
      path: '/user/users',
      options: {
        body: userData,
      },
    });

    await restOperation.response;
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};
