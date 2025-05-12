#!/usr/bin/env node

import { Command } from 'commander'
import { deployService } from './commands/deploy'
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
  .option('-a, --app', 'Deploy only the serverless application')
  .option('-i, --infra', 'Deploy only the infrastructure')
  .action(deployService)

program
  .command('initialize')
  .alias('init')
  .description('Initialize a new zeiro component (service, etc.)')
  .action(initializeCommand)

program.parse(process.argv)
