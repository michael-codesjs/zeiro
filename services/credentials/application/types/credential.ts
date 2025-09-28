export type CredentialType = 'aws_access_keys' | 'database_connection'

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

export type AWSAccessKeysCredential = BaseCredential & {
  type: 'aws_access_keys'
  account_id: string
  access_key_id: string
  secret_access_key: string // This will be encrypted
  region?: string
}

export type DatabaseConnectionCredential = BaseCredential & {
  type: 'database_connection'
  host: string
  port: number
  database_name: string
  username: string
  password: string // This will be encrypted
  ssl_enabled?: boolean
}

export type Credential = AWSAccessKeysCredential | DatabaseConnectionCredential

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
