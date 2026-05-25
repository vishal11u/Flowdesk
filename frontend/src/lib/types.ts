export type AuthUser = {
  id: number
  email: string
  name: string
  organizationId: number
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  user: AuthUser
}

export type AuthenticatedUser = {
  userId: number
  email: string
  organizationId: number
}

export type Client = {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  niche?: string
  status?: string
  source?: string
  pipelineStage?: string
  notes?: string
  createdAt?: string
}

export type Message = {
  id: number
  clientId: number
  message: string
  type: 'incoming' | 'outgoing'
  timestamp: string
}

export type Channel = 'gmail' | 'whatsapp' | 'slack'

export type IntegrationConnection = {
  id: number
  channel: Channel
  status: 'connected' | 'needs_auth' | 'disabled'
  externalAccountId?: string
  updatedAt?: string
}

export type AiWorkflow = {
  replies?: {
    professional?: string
    friendly?: string
    assertive?: string
  }
  reply?: string
  content?: string
  message?: string
}

export type IntegrationSendResult = {
  channel: Channel
  status: 'queued' | 'needs_auth'
  recipient: string
  message: string
  providerMessageId: string | null
}

export type IntegrationIngestResult = {
  client: Client
  message: Message
  normalizedEvent: {
    channel: Channel
    senderEmail: string
  }
}

export type DemoUserResult = {
  name: string
  age: number
}

export type ApiConfig = {
  apiUrl: string
  accessToken?: string
}
