#!/usr/bin/env ts-node

import { writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Generate environment variables for local development and testing
 */
function generateEnvFile() {
  const stage = process.env.STAGE || 'dev'
  const region = process.env.REGION || 'eu-central-1'

  const envContent = `# Generated environment variables for WebSocket service
NODE_ENV=development
STAGE=${stage}
REGION=${region}

# DynamoDB Table (will be created by infrastructure)
WEBSOCKET_CONNECTIONS_TABLE_NAME=zeiro-${stage}-websocket-connections

# WebSocket API (uses existing central API)
WEBSOCKET_API_ENDPOINT=wss://your-api-id.execute-api.${region}.amazonaws.com/${stage}

# For testing - these would normally come from SSM
TEST_MODE=true
`

  const envPath = join(__dirname, '..', '.env')
  writeFileSync(envPath, envContent)
  
  console.log(`✅ Generated .env file at ${envPath}`)
  console.log('📝 Remember to update the WEBSOCKET_API_ENDPOINT with your actual API Gateway ID')
}

// Run if called directly
if (require.main === module) {
  generateEnvFile()
}
