import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Notice } from './components/layout/Notice'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { AccountStrip } from './features/auth/AccountStrip'
import { AuthPanel } from './features/auth/AuthPanel'
import { BackendConsole } from './features/backend/BackendConsole'
import { ClientsSection } from './features/clients/ClientsSection'
import { InboxSection } from './features/inbox/InboxSection'
import { IntegrationsSection } from './features/integrations/IntegrationsSection'
import { MetricsGrid } from './features/overview/MetricsGrid'
import { useFlowdeskMutations, useMessagesQuery, useWorkspaceQueries } from './hooks/useFlowdeskQueries'
import { useSession } from './hooks/useSession'
import { sampleClients, sampleMessages } from './lib/constants'
import type { Client, Message } from './lib/types'

function formatError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function App() {
  const queryClient = useQueryClient()
  const { apiConfig, apiUrl, session, setApiUrl, setSession } = useSession();
  
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('Connect the backend to load live workspace data.')
  const [apiResult, setApiResult] = useState('')

  const isAuthenticated = Boolean(session)
  const workspace = useWorkspaceQueries(apiConfig, isAuthenticated)
  const mutations = useFlowdeskMutations(apiConfig, setSession)

  const liveClients = workspace.clients.data ?? []
  const visibleClients = liveClients.length > 0 ? liveClients : sampleClients
  const liveClientIds = new Set(liveClients.map((client) => client.id))
  const liveActiveClientId =
    selectedClientId && liveClientIds.has(selectedClientId)
      ? selectedClientId
      : liveClients[0]?.id ?? null
  const activeClientId = liveActiveClientId ?? selectedClientId ?? visibleClients[0]?.id ?? null
  const messagesQuery = useMessagesQuery(apiConfig, isAuthenticated, liveActiveClientId)
  const selectedClient = useMemo<Client | null>(
    () => visibleClients.find((client) => client.id === activeClientId) ?? null,
    [activeClientId, visibleClients],
  )
  const visibleMessages =
    messagesQuery.data && messagesQuery.data.length > 0
      ? messagesQuery.data
      : activeClientId
        ? sampleMessages[activeClientId] ?? []
        : []
  const connections = workspace.connections.data ?? []

  const isBusy =
    workspace.clients.isFetching ||
    workspace.connections.isFetching ||
    messagesQuery.isFetching ||
    Object.values(mutations).some((mutation) => mutation.isPending)

  function handleSelectClient(clientId: number) {
    setSelectedClientId(clientId)
  }

  function handleLogin(body: { email: string; password: string }) {
    mutations.login.mutate(body, {
      onSuccess: (authSession) => setNotice(`Signed in as ${authSession.user.name}`),
      onError: (error) => setNotice(formatError(error, 'Authentication failed')),
    })
  }

  function handleSignup(body: {
    email: string
    password: string
    name: string
    organizationName: string
  }) {
    mutations.signup.mutate(body, {
      onSuccess: (authSession) => setNotice(`Workspace created for ${authSession.user.name}`),
      onError: (error) => setNotice(formatError(error, 'Signup failed')),
    })
  }

  function handleLogout() {
    mutations.logout.mutate(undefined, {
      onSettled: () => {
        setSelectedClientId(null)
        setDraft('')
        setApiResult('')
        setNotice('Signed out.')
      },
    })
  }

  function handleRefreshSession() {
    if (!session?.refresh_token) return

    mutations.refreshSession.mutate(session.refresh_token, {
      onSuccess: () => setNotice('Access token refreshed.'),
      onError: (error) => setNotice(formatError(error, 'Unable to refresh session')),
    })
  }

  function handleCreateClient(body: {
    name: string
    email: string
    company?: string
    source?: string
    status?: string
    pipelineStage?: string
  }) {
    mutations.createClient.mutate(body, {
      onSuccess: (client) => {
        setSelectedClientId(client.id)
        setNotice(`${client.name} was added to the pipeline.`)
      },
      onError: (error) => setNotice(formatError(error, 'Unable to add client')),
    })
  }

  function handleInspectClient() {
    if (!activeClientId) return

    mutations.inspectClient.mutate(activeClientId, {
      onSuccess: (client) => {
        setApiResult(JSON.stringify(client, null, 2))
        setNotice(`Fetched client ${client.id} from /clients/:id.`)
      },
      onError: (error) => setNotice(formatError(error, 'Unable to fetch client')),
    })
  }

  function handleCreateMessage(body: { message: string; type: Message['type'] }) {
    if (!activeClientId) return

    mutations.createMessage.mutate(
      { clientId: activeClientId, ...body },
      {
        onSuccess: () => setNotice('Message added through the backend.'),
        onError: (error) => setNotice(formatError(error, 'Unable to add message')),
      },
    )
  }

  function handleGenerateReply() {
    if (!selectedClient || visibleMessages.length === 0) return

    const latestIncoming =
      [...visibleMessages].reverse().find((message) => message.type === 'incoming') ??
      visibleMessages[visibleMessages.length - 1]

    mutations.generateReply.mutate(
      {
        message: latestIncoming.message,
        niche: selectedClient.niche ?? 'b2b_saas_support',
        clientContext: selectedClient as unknown as Record<string, unknown>,
        history: visibleMessages.map((message) => ({
          role: message.type === 'incoming' ? 'client' : 'agent',
          message: message.message,
        })),
        businessRules: 'Keep replies concise, helpful, and clear about the next action.',
      },
      {
        onSuccess: (response) => {
          setDraft(
            response.replies?.professional ??
              response.reply ??
              response.content ??
              response.message ??
              '',
          )
          setNotice('AI reply drafted for review.')
        },
        onError: (error) => setNotice(formatError(error, 'Unable to generate reply')),
      },
    )
  }

  function handleSaveReply() {
    if (!draft.trim()) return

    handleCreateMessage({ message: draft.trim(), type: 'outgoing' })
    setDraft('')
  }

  function handleConnectChannel(channel: Parameters<typeof mutations.connectChannel.mutate>[0]) {
    mutations.connectChannel.mutate(channel, {
      onSuccess: () => setNotice(`${channel.toUpperCase()} connection prepared for OAuth setup.`),
      onError: (error) => setNotice(formatError(error, 'Unable to connect channel')),
    })
  }

  function handleRefreshWorkspace() {
    void queryClient.invalidateQueries()
    setNotice('Workspace refresh requested.')
  }

  return (
    <main className="grid min-h-svh grid-cols-[280px_minmax(0,1fr)] bg-canvas text-ink max-lg:grid-cols-1">
      <Sidebar apiUrl={apiUrl} onApiUrlChange={setApiUrl} />

      <section className="grid min-w-0 gap-5 p-7 max-md:p-5">
        <Topbar session={session} onLogout={handleLogout} />
        <Notice isBusy={isBusy} notice={notice} />

        {!session && (
          <AuthPanel
            isBusy={isBusy}
            onLogin={handleLogin}
            onSignup={handleSignup}
          />
        )}

        <MetricsGrid
          clients={visibleClients}
          connections={connections}
          messages={visibleMessages}
          selectedClientName={selectedClient?.name}
        />

        {session && (
          <AccountStrip
            currentUser={workspace.me.data}
            isBusy={isBusy}
            onRefresh={handleRefreshSession}
            session={session}
          />
        )}

        <IntegrationsSection
          connections={connections}
          isBusy={isBusy}
          isEnabled={isAuthenticated}
          onConnect={handleConnectChannel}
          onRefresh={handleRefreshWorkspace}
        />

        <section className="grid grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] gap-3.5 max-lg:grid-cols-1">
          <ClientsSection
            activeClientId={activeClientId}
            clients={visibleClients}
            isBusy={isBusy}
            isEnabled={isAuthenticated}
            onCreateClient={handleCreateClient}
            onInspectClient={handleInspectClient}
            onSelectClient={handleSelectClient}
          />

          <InboxSection
            draft={draft}
            isBusy={isBusy}
            isEnabled={isAuthenticated}
            messages={visibleMessages}
            onAddMessage={handleCreateMessage}
            onDraftChange={setDraft}
            onGenerateReply={handleGenerateReply}
            onSaveReply={handleSaveReply}
            selectedClient={selectedClient}
          />
        </section>

        <BackendConsole
          apiResult={apiResult}
          isBusy={isBusy}
          isEnabled={isAuthenticated}
          onCreateDemoUser={(body) =>
            mutations.createDemoUser.mutate(body, {
              onSuccess: (result) => {
                setApiResult(JSON.stringify(result, null, 2))
                setNotice('Posted to demo /users endpoint.')
              },
              onError: (error) => setNotice(formatError(error, 'Unable to create demo user')),
            })
          }
          onFetchDemoUserById={() =>
            mutations.demoUserById.mutate(undefined, {
              onSuccess: (result) => {
                setApiResult(JSON.stringify(result, null, 2))
                setNotice('Loaded demo /users/:id endpoint.')
              },
              onError: (error) => setNotice(formatError(error, 'Unable to load user by id')),
            })
          }
          onFetchDemoUsers={() =>
            mutations.demoUsers.mutate(undefined, {
              onSuccess: (result) => {
                setApiResult(JSON.stringify(result, null, 2))
                setNotice('Loaded demo /users endpoint.')
              },
              onError: (error) => setNotice(formatError(error, 'Unable to load users')),
            })
          }
          onIngestProviderEvent={(body) =>
            mutations.ingestProviderEvent.mutate(
              {
                ...body,
                niche: 'b2b_saas_support',
                metadata: { source: 'frontend-ingest-console' },
              },
              {
                onSuccess: (result) => {
                  setSelectedClientId(result.client.id)
                  setApiResult(JSON.stringify(result.normalizedEvent, null, 2))
                  setNotice(`Ingested ${result.normalizedEvent.channel} event for ${result.client.name}.`)
                },
                onError: (error) => setNotice(formatError(error, 'Unable to ingest event')),
              },
            )
          }
          onSendProviderMessage={(body) =>
            mutations.sendProviderMessage.mutate(
              {
                ...body,
                context: selectedClient ? (selectedClient as unknown as Record<string, unknown>) : {},
              },
              {
                onSuccess: (result) => {
                  setApiResult(JSON.stringify(result, null, 2))
                  setNotice(`${result.channel.toUpperCase()} provider status: ${result.status}.`)
                },
                onError: (error) => setNotice(formatError(error, 'Unable to send provider message')),
              },
            )
          }
        />
      </section>
    </main>
  )
}

export default App
