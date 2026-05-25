import type { Client, IntegrationConnection, Message } from '../../lib/types'

export function MetricsGrid({
  clients,
  connections,
  messages,
  selectedClientName,
}: {
  clients: Client[]
  connections: IntegrationConnection[]
  messages: Message[]
  selectedClientName?: string
}) {
  const connectedCount = connections.filter((connection) => connection.status === 'connected').length
  const stats = [
    { label: 'Live channels', value: `${connectedCount}/3`, hint: 'Gmail, WhatsApp, Slack' },
    { label: 'Tracked clients', value: String(clients.length), hint: 'Loaded or preview data' },
    { label: 'Open messages', value: String(messages.length), hint: selectedClientName ?? 'Select a client' },
  ]

  return (
    <section id="overview" className="grid grid-cols-3 gap-3.5 max-md:grid-cols-1" aria-label="Workspace metrics">
      {stats.map((stat) => (
        <article className="rounded-lg border border-line bg-panel p-5" key={stat.label}>
          <span className="text-xs font-extrabold uppercase text-slate-500">{stat.label}</span>
          <strong className="mt-3 block text-4xl font-black leading-none text-ink">{stat.value}</strong>
          <p className="mt-1 text-ink-soft">{stat.hint}</p>
        </article>
      ))}
    </section>
  )
}
