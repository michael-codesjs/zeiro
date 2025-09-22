const { users } = require('./shared/domain/dist/index');

async function testGSI() {
  // Set the table name
  process.env.ZEIRO_TABLE_NAME = 'zeiro-table-dev';
  process.env.AWS_REGION = 'eu-central-1';
  
  const testUser = {
    id: 'test-' + Date.now(),
    workspace_id: 'test-workspace',
    cognito_user_id: 'test-cognito-' + Date.now(),
    name: 'Test User',
    email: 'test@example.com',
    email_verified: false,
    discontinued: false,
  };

  console.log('Creating user with:', testUser);
  
  try {
    // Create the user
    const result = await users.create(testUser).go({ logParams: true });
    console.log('Created user:', JSON.stringify(result, null, 2));
    
    // Try to query by cognito_user_id
    console.log('\nQuerying by cognito_user_id...');
    const queryResult = await users.query
      .byCognitoUser({ cognito_user_id: testUser.cognito_user_id })
      .go({ logParams: true });
    
    console.log('Query result:', JSON.stringify(queryResult, null, 2));
    
    // Clean up - delete the test user
    await users.delete({ 
      id: testUser.id, 
      workspace_id: testUser.workspace_id 
    }).go();
    console.log('Test user deleted');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testGSI();
