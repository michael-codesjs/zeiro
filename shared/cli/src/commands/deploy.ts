import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { exec } from 'child_process'
import chalk from 'chalk'
import ora from 'ora'
import path from 'path'

interface DeployOptions {
  stage: 'dev' | 'prod'
  forceInit: boolean
  migrateState: boolean
  reconfigure: boolean
  forceUnlock: boolean
  app?: boolean
  infra?: boolean
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
    // Ensure AWS credentials are passed to child processes
    const env = {
      ...process.env,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      ...options.env
    }
    
    exec(command, { ...options, env }, (error) => {
      if (error) console.log(error)
      resolve(error === null)
    })
  })

export const deployService = async (options: DeployOptions) => {
  const {
    stage = 'dev',
    forceInit = false,
    migrateState = false,
    reconfigure = false,
    forceUnlock = false,
    app = false,
    infra = false,
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

  // Determine what to deploy
  let deployOnlyApp = app && !infra
  let deployOnlyInfra = infra && !app
  let deployBoth = (!app && !infra) || (app && infra)

  // If no infrastructure exists, adjust deployment options
  if (!hasInfrastructure) {
    if (deployOnlyInfra) {
      console.warn(
        chalk.yellow(
          `Warning: Service ${serviceName} does not have infrastructure. Skipping infrastructure deployment.`,
        ),
      )
      process.exit(0)
    }
    deployOnlyApp = true
    deployOnlyInfra = false
    deployBoth = false
  }

  console.log(
    chalk.blue(
      `Deploying ${chalk.bold(serviceName)} service ${
        deployOnlyApp
          ? 'application'
          : deployOnlyInfra
            ? 'infrastructure'
            : 'infrastructure and application'
      } in ${
        layer === 'domain' && domain
          ? `${chalk.bold(domain)} domain`
          : `${chalk.bold(layer)} layer`
      } to ${chalk.bold(stage)}`,
    ),
  )

  const ssmClient = new SSMClient({
    region: process.env.AWS_REGION || 'eu-central-1',
  })

  // Test AWS credentials by trying to call STS
  try {
    const { STSClient, GetCallerIdentityCommand } = await import('@aws-sdk/client-sts')
    const stsClient = new STSClient({ region: process.env.AWS_REGION || 'eu-central-1' })
    await stsClient.send(new GetCallerIdentityCommand({}))
    console.log(chalk.green(`✓ AWS credentials verified.`))
  } catch (error) {
    console.error(chalk.red(`✗ AWS credentials test failed: ${error.message}`))
    process.exit(1)
  }

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
    const stateBucketName = 'zeiro-state-bucket' as const
    const lockDynamoDbTableName = 'zeiro-terraform-locks' as const

    const stateFileKey =
      layer === 'domain' && domain
        ? `${stage}/domain/${domain}/${serviceName}/infrastructure/terraform.tfstate`
        : `${stage}/${layer}/${serviceName}/infrastructure/terraform.tfstate`

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

    // Determine the init command based on options
    let command: string = ''
    const baseInitCommand = `cd ${infrastructurePath} && terraform init`
    if (migrateState) {
      // For migrate-state, we need to auto-answer "yes" to the prompt (remove -input=false to allow migration prompts)
      command = `${baseInitCommand} -migrate-state ${backendConfig}`
    } else if (reconfigure) {
      // For reconfigure, no prompts needed
      command = `${baseInitCommand} -reconfigure ${backendConfig}`
    } else {
      command = `${baseInitCommand} ${backendConfig}`
    }

    const success = await execAsync(command, { stdio: 'pipe' })

    if (success) {
      let message = 'Successfully initialized terraform.'
      if (migrateState) {
        message = 'Successfully initialized terraform with state migration.'
      } else if (reconfigure) {
        message = 'Successfully reconfigured terraform backend.'
      }
      spinner.succeed(message)
      return true
    } else {
      let message = `Failed to initialize terraform. Run the command ${chalk.bold(command)} manually to get the actual error message.`
      if (migrateState) {
        message = `Failed to initialize terraform with state migration. Run the command ${chalk.bold(command)} manually to get the actual error message.`
      } else if (reconfigure) {
        message = `Failed to reconfigure terraform backend. Run the command ${chalk.bold(command)} manually to get the actual error message.`
      }
      spinner.fail(message)
      return false
    }
  }

  const deployInfrastructure = async () => {
    if (!hasInfrastructure) {
      return true
    }

    const spinner = ora(
      `Deploying ${serviceName} service infrastructure to ${chalk.bold(stage)}.`,
    ).start()

    const command = `cd ${infrastructurePath} && terraform apply -auto-approve --var "stage=${stage}"`
    const success = await execAsync(command, { stdio: 'pipe' })

    if (success) {
      spinner.succeed(
        `Successfully deployed ${serviceName} service infrastructure to ${chalk.bold(stage)}.`,
      )
      return true
    } else {
      spinner.fail(
        `Failed to deploy ${serviceName} service infrastructure to ${chalk.bold(stage)}.`,
      )
      return false
    }
  }

  const deployApplication = async () => {
    const spinner = ora(
      `Deploying ${serviceName} service application to ${chalk.bold(stage)}.`,
    ).start()

    const command = `sls deploy --stage=${stage}`
    const success = await execAsync(command, { stdio: 'pipe' })

    if (success) {
      spinner.succeed(
        `Successfully deployed ${serviceName} service application to ${chalk.bold(stage)}.`,
      )
      return true
    } else {
      spinner.fail(
        `Failed to deploy ${serviceName} service application to ${chalk.bold(stage)}.`,
      )
      return false
    }
  }

  // Execute deployment process based on what was requested
  if (deployOnlyApp) {
    // Just deploy the application
    await deployApplication()
  } else {
    // Initialize Terraform if deploying infrastructure
    const shouldInitialize =
      hasInfrastructure && (forceInit || !existsSync(terraformStateFullPath))
    const initialized = shouldInitialize ? await initializeTerraform() : true

    if (initialized) {
      if (deployOnlyInfra) {
        // Just deploy infrastructure
        await deployInfrastructure()
      } else if (deployBoth) {
        // Deploy both infrastructure and application
        const infraDeployed = await deployInfrastructure()
        if (infraDeployed) {
          await deployApplication()
        }
      }
    }
  }
}
