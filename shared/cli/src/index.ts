#!/usr/bin/env node

import { Command } from 'commander'
import { deployService } from './commands/deploy'
import { destroyService } from './commands/destroy'
import { initializeCommand } from './commands/initialize'

const program = new Command()

program
  .name('zeiro')
  .description('CLI for managing zeiro microservices')
  .version('1.0.0')

program
  .command('deploy')
  .description('Deploy a zeiro service')
  .option('-s, --stage <stage>', 'Deployment stage (dev or prod)', 'dev')
  .option('-f, --force-init', 'Force terraform initialization')
  .option('-m, --migrate-state', 'Migrate terraform state when backend config changes')
  .option('-r, --reconfigure', 'Reconfigure terraform backend without state migration')
  .option('-u, --force-unlock', 'Force unlock terraform state before deployment')
  .option('-a, --app', 'Deploy only the serverless application')
  .option('-i, --infra', 'Deploy only the infrastructure')
  .action(deployService)

program
  .command('destroy')
  .description('Destroy a zeiro service')
  .option('-s, --stage <stage>', 'Deployment stage (dev or prod)', 'dev')
  .option('-f, --force-init', 'Force terraform initialization')
  .option('-u, --force-unlock', 'Force unlock terraform state before destruction')
  .option('-a, --app', 'Destroy only the serverless application')
  .option('-i, --infra', 'Destroy only the infrastructure')
  .option('--auto-approve', 'Skip confirmation prompt')
  .action(destroyService)

program
  .command('initialize')
  .alias('init')
  .description('Initialize a new zeiro component (service, etc.)')
  .action(initializeCommand)

program.parse(process.argv)
