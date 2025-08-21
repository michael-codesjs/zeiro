export type CredentialType = 'aws' | 'gcp' | 'azure' | 'database'

export type CredentialStatus = 'active' | 'inactive' | 'expired'

export type BaseCredential = {
  id: string
  user_id: string
  name: string
  type: CredentialType
  status: CredentialStatus
  created_at: string
  updated_at: string
  last_used?: string
}

export type AWSCredential = BaseCredential & {
  type: 'aws'
  account_id: string
  access_key_id: string
  secret_access_key: string // This will be encrypted
  region?: string
}

export type GCPCredential = BaseCredential & {
  type: 'gcp'
  service_account_key: string // This will be encrypted
  project_id?: string
}

export type AzureCredential = BaseCredential & {
  type: 'azure'
  client_id: string
  client_secret: string // This will be encrypted
  tenant_id: string
  subscription_id?: string
}

export type DatabaseCredential = BaseCredential & {
  type: 'database'
  host: string
  port: number
  database: string
  username: string
  password: string // This will be encrypted
  ssl?: boolean
}

export type Credential = AWSCredential | GCPCredential | AzureCredential | DatabaseCredential

export type CreateCredentialInput = 
  | Omit<Credential, 'id' | 'created_at' | 'updated_at' | 'last_used'>
  | (Omit<BaseCredential, 'id' | 'created_at' | 'updated_at' | 'last_used'> & {
      connection_details: Record<string, any>
    })

export type UpdateCredentialInput = 
  | Partial<Omit<Credential, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  | (Partial<Omit<BaseCredential, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & {
      connection_details?: Record<string, any>
    })

export type CredentialListResponse = {
  credentials: Credential[]
  total: number
  page: number
  limit: number
}
