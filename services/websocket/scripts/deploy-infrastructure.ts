#!/usr/bin/env ts-node

import { execSync } from 'child_process'
import * as path from 'path'

/**
 * Deploy WebSocket service infrastructure
 */
async function deployInfrastructure() {
  console.log('🚀 Deploying WebSocket service infrastructure...')

  const infrastructurePath = path.join(__dirname, '..', 'infrastructure')
  
  try {
    // Initialize Terraform
    console.log('📦 Initializing Terraform...')
    execSync('terraform init', { 
      cwd: infrastructurePath, 
      stdio: 'inherit' 
    })

    // Plan deployment
    console.log('📋 Planning infrastructure changes...')
    execSync('terraform plan', { 
      cwd: infrastructurePath, 
      stdio: 'inherit' 
    })

    // Apply changes
    console.log('⚙️ Applying infrastructure changes...')
    execSync('terraform apply -auto-approve', { 
      cwd: infrastructurePath, 
      stdio: 'inherit' 
    })

    console.log('✅ Infrastructure deployment completed successfully!')
  } catch (error) {
    console.error('❌ Infrastructure deployment failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  deployInfrastructure()
}
