import type {
  AiWorkflow,
  ApiConfig,
  AuthSession,
  AuthenticatedUser,
  Channel,
  Client,
  DemoUserResult,
  IntegrationConnection,
  IntegrationIngestResult,
  IntegrationSendResult,
  Message,
} from './types'

type RequestMethod = 'GET' | 'POST'

async function request<T>(
  config: ApiConfig,
  path: string,
  method: RequestMethod = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(config.accessToken ? { Authorization: `Bearer ${config.accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      payload?.message ?? payload?.error ?? `Request failed with status ${response.status}`
    throw new Error(Array.isArray(message) ? message.join(', ') : message)
  }

  return (payload?.data ?? payload) as T
}

export const flowdeskApi = {
  login: (config: ApiConfig, body: { email: string; password: string }) =>
    request<AuthSession>(config, '/auth/login', 'POST', body),
  signup: (
    config: ApiConfig,
    body: { email: string; password: string; name: string; organizationName: string },
  ) => request<AuthSession>(config, '/auth/signup', 'POST', body),
  refresh: (config: ApiConfig, refreshToken: string) =>
    request<AuthSession>(config, '/auth/refresh', 'POST', { refreshToken }),
  logout: (config: ApiConfig) => request<{ revoked: boolean }>(config, '/auth/logout', 'POST'),

  me: (config: ApiConfig) => request<AuthenticatedUser>(config, '/users/me'),
  demoUsers: (config: ApiConfig) => request<string[]>(config, '/users'),
  demoUserById: (config: ApiConfig, id = 1) => request<string>(config, `/users/${id}`),
  createDemoUser: (config: ApiConfig, body: DemoUserResult) =>
    request<DemoUserResult>(config, '/users', 'POST', body),

  clients: (config: ApiConfig) => request<Client[]>(config, '/clients'),
  client: (config: ApiConfig, clientId: number) =>
    request<Client>(config, `/clients/${clientId}`),
  createClient: (
    config: ApiConfig,
    body: {
      name: string
      email: string
      company?: string
      source?: string
      status?: string
      pipelineStage?: string
    },
  ) => request<Client>(config, '/clients', 'POST', body),

  messages: (config: ApiConfig, clientId: number) =>
    request<Message[]>(config, `/messages/client/${clientId}`),
  createMessage: (
    config: ApiConfig,
    body: { clientId: number; message: string; type: Message['type'] },
  ) => request<Message>(config, '/messages', 'POST', body),

  connections: (config: ApiConfig) =>
    request<IntegrationConnection[]>(config, '/integrations/connections'),
  connectChannel: (config: ApiConfig, channel: Channel) =>
    request<IntegrationConnection>(config, '/integrations/connections', 'POST', {
      channel,
      status: 'needs_auth',
      externalAccountId: `${channel}-sandbox`,
      settings: { source: 'frontend-dashboard' },
    }),
  sendProviderMessage: (
    config: ApiConfig,
    body: { channel: Channel; recipient: string; message: string; context?: Record<string, unknown> },
  ) => request<IntegrationSendResult>(config, '/integrations/send', 'POST', body),
  ingestProviderEvent: (
    config: ApiConfig,
    body: {
      channel: Channel
      senderName: string
      senderEmail: string
      message: string
      niche?: string
      metadata?: Record<string, unknown>
    },
  ) => request<IntegrationIngestResult>(config, '/integrations/ingest', 'POST', body),

  generateReply: (
    config: ApiConfig,
    body: {
      message: string
      niche: string
      clientContext?: Record<string, unknown>
      history?: Array<{ role: 'client' | 'agent'; message: string }>
      businessRules?: string
    },
  ) => request<AiWorkflow>(config, '/ai/generate-reply', 'POST', body),
}
