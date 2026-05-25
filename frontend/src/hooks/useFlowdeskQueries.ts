import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { flowdeskApi } from '../lib/api'
import type {
  ApiConfig,
  AuthSession,
  Channel,
  DemoUserResult,
  Message,
} from '../lib/types'

export const queryKeys = {
  me: ['me'] as const,
  clients: ['clients'] as const,
  client: (clientId: number | null) => ['clients', clientId] as const,
  messages: (clientId: number | null) => ['messages', clientId] as const,
  connections: ['integrations', 'connections'] as const,
}

export function useWorkspaceQueries(apiConfig: ApiConfig, enabled: boolean) {
  const me = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => flowdeskApi.me(apiConfig),
    enabled,
  })

  const clients = useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => flowdeskApi.clients(apiConfig),
    enabled,
  })

  const connections = useQuery({
    queryKey: queryKeys.connections,
    queryFn: () => flowdeskApi.connections(apiConfig),
    enabled,
  })

  return {
    clients,
    connections,
    me,
  }
}

export function useMessagesQuery(apiConfig: ApiConfig, enabled: boolean, clientId: number | null) {
  return useQuery({
    queryKey: queryKeys.messages(clientId),
    queryFn: () => flowdeskApi.messages(apiConfig, clientId as number),
    enabled: enabled && Boolean(clientId),
  })
}

export function useFlowdeskMutations(
  apiConfig: ApiConfig,
  setSession: (session: AuthSession | null) => void,
) {
  const queryClient = useQueryClient()

  const invalidateWorkspace = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.me }),
      queryClient.invalidateQueries({ queryKey: queryKeys.clients }),
      queryClient.invalidateQueries({ queryKey: queryKeys.connections }),
    ])
  }

  return {
    login: useMutation({
      mutationFn: (body: { email: string; password: string }) => flowdeskApi.login(apiConfig, body),
      onSuccess: async (session) => {
        setSession(session)
        await invalidateWorkspace()
      },
    }),
    signup: useMutation({
      mutationFn: (body: {
        email: string
        password: string
        name: string
        organizationName: string
      }) => flowdeskApi.signup(apiConfig, body),
      onSuccess: async (session) => {
        setSession(session)
        await invalidateWorkspace()
      },
    }),
    refreshSession: useMutation({
      mutationFn: (refreshToken: string) => flowdeskApi.refresh(apiConfig, refreshToken),
      onSuccess: setSession,
    }),
    logout: useMutation({
      mutationFn: () => flowdeskApi.logout(apiConfig),
      onSettled: () => {
        setSession(null)
        queryClient.clear()
      },
    }),
    createClient: useMutation({
      mutationFn: (body: {
        name: string
        email: string
        company?: string
        source?: string
        status?: string
        pipelineStage?: string
      }) => flowdeskApi.createClient(apiConfig, body),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      },
    }),
    inspectClient: useMutation({
      mutationFn: (clientId: number) => flowdeskApi.client(apiConfig, clientId),
    }),
    createMessage: useMutation({
      mutationFn: (body: { clientId: number; message: string; type: Message['type'] }) =>
        flowdeskApi.createMessage(apiConfig, body),
      onSuccess: async (message) => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.messages(message.clientId) })
      },
    }),
    connectChannel: useMutation({
      mutationFn: (channel: Channel) => flowdeskApi.connectChannel(apiConfig, channel),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.connections })
      },
    }),
    generateReply: useMutation({
      mutationFn: (body: {
        message: string
        niche: string
        clientContext?: Record<string, unknown>
        history?: Array<{ role: 'client' | 'agent'; message: string }>
        businessRules?: string
      }) => flowdeskApi.generateReply(apiConfig, body),
    }),
    sendProviderMessage: useMutation({
      mutationFn: (body: {
        channel: Channel
        recipient: string
        message: string
        context?: Record<string, unknown>
      }) => flowdeskApi.sendProviderMessage(apiConfig, body),
    }),
    ingestProviderEvent: useMutation({
      mutationFn: (body: {
        channel: Channel
        senderName: string
        senderEmail: string
        message: string
        niche?: string
        metadata?: Record<string, unknown>
      }) => flowdeskApi.ingestProviderEvent(apiConfig, body),
      onSuccess: async (result) => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.clients })
        await queryClient.invalidateQueries({ queryKey: queryKeys.messages(result.client.id) })
      },
    }),
    demoUsers: useMutation({
      mutationFn: () => flowdeskApi.demoUsers(apiConfig),
    }),
    demoUserById: useMutation({
      mutationFn: () => flowdeskApi.demoUserById(apiConfig),
    }),
    createDemoUser: useMutation({
      mutationFn: (body: DemoUserResult) => flowdeskApi.createDemoUser(apiConfig, body),
    }),
  }
}
