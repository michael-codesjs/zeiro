import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { exec } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import path from 'path'

interface DestroyOptions {
  stage: 'dev' | 'prod'
  forceInit: boolean
  forceUnlock: boolean
  app?: boolean
  infra?: boolean
  autoApprove?: boolean
}

interface ServiceConfig {
  type: 'service'
  layer: string
  domain?: string
  name: string
  environment?: Record<string, string>
}

const execAsync = (command: string, options: any = {}) =>
  new Promise<boolean>((resolve) => {
    exec(command, options, (error) => {
      if (error) console.log(error)
      resolve(error === null)
    })
  })

export const destroyService = async (options: DestroyOptions) => {
  const {
    stage = 'dev',
    forceInit = false,
    forceUnlock = false,
    app = false,
    infra = false,
    autoApprove = false,
  } = options

  // Get the current working directory
  const cwd = process.cwd()

  // Check if config.zero exists
  const configPath = path.join(cwd, 'config.zero')
  if (!existsSync(configPath)) {
    console.error(chalk.red('Error: No zeiro service configuration found'))
    console.error(
      chalk.yellow(
        'Please run "zeiro initialize" first to set up your service configuration',
      ),
    )
    process.exit(1)
  }

  // Read the config.zero file
  let serviceConfig: ServiceConfig
  try {
    const configFile = readFileSync(configPath, 'utf8')
    serviceConfig = JSON.parse(configFile)

    if (serviceConfig.type !== 'service') {
      console.error(
        chalk.red(`Error: Found configuration but it's not a service type`),
      )
      process.exit(1)
    }
  } catch (error) {
    console.error(
      chalk.red(`Error: Failed to parse config.zero file: ${error.message}`),
    )
    process.exit(1)
  }

  const { layer, domain, name: serviceName } = serviceConfig

  // Check if infrastructure exists
  const infrastructurePath = path.join(cwd, 'infrastructure')
  const hasInfrastructure = existsSync(infrastructurePath)

  // Determine what to destroy
  let destroyOnlyApp = app && !infra
  let destroyOnlyInfra = infra && !app
  let destroyBoth = (!app && !infra) || (app && infra)

  // If no infrastructure exists, adjust destruction options
  if (!hasInfrastructure) {
    if (destroyOnlyInfra) {
      console.warn(
        chalk.yellow(
          `Warning: Service ${serviceName} does not have infrastructure. Skipping infrastructure destruction.`,
        ),
      )
      process.exit(0)
    }
    destroyOnlyApp = true
    destroyOnlyInfra = false
    destroyBoth = false
  }

  // Warning message for destructive operation
  console.log(
    chalk.red(
      `⚠️  WARNING: This will destroy ${chalk.bold(serviceName)} service ${
        destroyOnlyApp
          ? 'application'
          : destroyOnlyInfra
            ? 'infrastructure'
            : 'infrastructure and application'
      } in ${
        layer === 'domain' && domain
          ? `${chalk.bold(domain)} domain`
          : `${chalk.bold(layer)} layer`
      } from ${chalk.bold(stage)}`,
    ),
  )

  if (!autoApprove) {
    console.log(
      chalk.yellow(
        'This action cannot be undone. Use --auto-approve to skip this confirmation.',
      ),
    )
    
    // Simple confirmation - in a real implementation you might want to use inquirer
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    
    const answer = await new Promise<string>((resolve) => {
      readline.question('Do you want to continue? (yes/no): ', resolve)
    })
    
    readline.close()
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log(chalk.yellow('Operation cancelled.'))
      process.exit(0)
    }
  }

  const ssmClient = new SSMClient({
    region: process.env.AWS_REGION || 'eu-central-1',
  })

  // Create paths
  const terraformStatePath = `.terraform`
  const terraformStateFullPath = path.join(
    infrastructurePath,
    terraformStatePath,
  )

  const initializeTerraform = async () => {
    if (!hasInfrastructure) {
      return true
    }

    // Get environment state bucket name
    const getParameterCommand = new GetParameterCommand({
      Name: `/zeiro/${stage}/cicd/state-bucket/name`,
      WithDecryption: true,
    })

    const stateBucketResponse = await ssmClient.send(getParameterCommand)
    const stateBucketName = stateBucketResponse.Parameter?.Value
    const lockDynamoDbTableName = 'zeiro-terraform-locks' as const

    const stateFileKey =
      layer === 'domain' && domain
        ? `${stage}/domain/${domain}/${serviceName}/infrastructure/terraform.tfstate`
        : `${stage}/${layer}/${serviceName}/infrastructure/terraform.tfstate`

    // Force unlock if requested
    if (forceUnlock) {
      const unlockSpinner = ora('Force unlocking terraform state.').start()
      
      // We need to get the lock ID from the error, but for now let's try a generic approach
      const unlockCommand = `cd ${infrastructurePath} && terraform force-unlock -force 71adabba-62d8-9fc8-7ec0-1a642aeec737`
      
      const unlockSuccess = await execAsync(unlockCommand, { stdio: 'pipe' })
      
      if (unlockSuccess) {
        unlockSpinner.succeed('Successfully force unlocked terraform state.')
      } else {
        unlockSpinner.fail('Failed to force unlock terraform state. Continuing with initialization...')
      }
    }

    // Terraform init
    const spinner = ora('Initializing terraform.').start()

    // Build the base command with backend config
    const backendConfig = [
      `-backend-config="bucket=${stateBucketName}"`,
      `-backend-config="key=${stateFileKey}"`,
      `-backend-config="region=eu-central-1"`,
      `-backend-config="dynamodb_table=${lockDynamoDbTableName}"`,
      `-backend-config="encrypt=true"`
    ].join(' ')

    const command = `cd ${infrastructurePath} && terraform init ${backendConfig}`
    const success = await execAsync(command, { stdio: 'pipe' })

    if (success) {
      spinner.succeed('Successfully initialized terraform.')
      return true
    } else {
      spinner.fail(
        `Failed to initialize terraform. Run the command ${chalk.bold(command)} manually to get the actual error message.`
      )
      return false
    }
  }

  const destroyInfrastructure = async () => {
    if (!hasInfrastructure) {
      return true
    }

    const spinner = ora(
      `Destroying ${serviceName} service infrastructure from ${chalk.bold(stage)}.`,
    ).start()

    const command = `cd ${infrastructurePath} && terraform destroy -auto-approve --var "stage=${stage}"`
    const success = await execAsync(command, { stdio: 'pipe' })

    if (success) {
      spinner.succeed(
        `Successfully destroyed ${serviceName} service infrastructure from ${chalk.bold(stage)}.`,
      )
      return true
    } else {
      spinner.fail(
        `Failed to destroy ${serviceName} service infrastructure from ${chalk.bold(stage)}.`,
      )
      return false
    }
  }

  const destroyApplication = async () => {
    const spinner = ora(
      `Destroying ${serviceName} service application from ${chalk.bold(stage)}.`,
    ).start()

    const command = `sls remove --stage=${stage}`
    const success = await execAsync(command, { stdio: 'pipe' })

    if (success) {
      spinner.succeed(
        `Successfully destroyed ${serviceName} service application from ${chalk.bold(stage)}.`,
      )
      return true
    } else {
      spinner.fail(
        `Failed to destroy ${serviceName} service application from ${chalk.bold(stage)}.`,
      )
      return false
    }
  }

  // Execute destruction process based on what was requested
  if (destroyOnlyApp) {
    // Just destroy the application
    await destroyApplication()
  } else {
    // Initialize Terraform if destroying infrastructure
    const shouldInitialize =
      hasInfrastructure && (forceInit || !existsSync(terraformStateFullPath))
    const initialized = shouldInitialize ? await initializeTerraform() : true

    if (initialized) {
      if (destroyOnlyInfra) {
        // Just destroy infrastructure
        await destroyInfrastructure()
      } else if (destroyBoth) {
        // Destroy both application and infrastructure (app first, then infra)
        const appDestroyed = await destroyApplication()
        if (appDestroyed) {
          await destroyInfrastructure()
        }
      }
    }
  }
}
