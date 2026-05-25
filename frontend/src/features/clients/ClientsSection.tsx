import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Section, SectionHeading, Select } from '../../components/ui'
import type { Client } from '../../lib/types'

export function ClientsSection({
  activeClientId,
  clients,
  isBusy,
  isEnabled,
  onCreateClient,
  onInspectClient,
  onSelectClient,
}: {
  activeClientId: number | null
  clients: Client[]
  isBusy: boolean
  isEnabled: boolean
  onCreateClient: (body: {
    name: string
    email: string
    company?: string
    source?: string
    status?: string
    pipelineStage?: string
  }) => void
  onInspectClient: () => void
  onSelectClient: (clientId: number) => void
}) {
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    source: 'gmail',
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!newClient.name || !newClient.email) return

    onCreateClient({
      ...newClient,
      status: 'lead',
      pipelineStage: 'New lead',
    })
    setNewClient({ name: '', email: '', company: '', source: 'gmail' })
  }

  return (
    <Section id="clients">
      <SectionHeading
        eyebrow="Clients"
        title="Pipeline"
        action={
          <Button type="button" onClick={onInspectClient} disabled={!isEnabled || !activeClientId || isBusy}>
            Inspect
          </Button>
        }
      />

      <form className="mb-4 grid grid-cols-2 gap-2.5 max-md:grid-cols-1" onSubmit={handleSubmit}>
        <Field
          aria-label="Client name"
          placeholder="Name"
          value={newClient.name}
          onChange={(event) => setNewClient((current) => ({ ...current, name: event.target.value }))}
        />
        <Field
          aria-label="Client email"
          placeholder="Email"
          type="email"
          value={newClient.email}
          onChange={(event) => setNewClient((current) => ({ ...current, email: event.target.value }))}
        />
        <Field
          aria-label="Company"
          placeholder="Company"
          value={newClient.company}
          onChange={(event) => setNewClient((current) => ({ ...current, company: event.target.value }))}
        />
        <Select
          aria-label="Source"
          value={newClient.source}
          onChange={(event) => setNewClient((current) => ({ ...current, source: event.target.value }))}
        >
          <option value="gmail">Gmail</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="slack">Slack</option>
        </Select>
        <Button className="col-span-2 max-md:col-auto" type="submit" disabled={!isEnabled || isBusy}>
          Add client
        </Button>
      </form>

      <div className="grid gap-2">
        {clients.map((client) => (
          <button
            type="button"
            className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-line px-3 text-left hover:border-teal-700 data-[active=true]:border-teal-700 data-[active=true]:bg-brand-soft"
            data-active={client.id === activeClientId}
            key={client.id}
            onClick={() => onSelectClient(client.id)}
          >
            <span>
              <strong className="block">{client.name}</strong>
              <small className="text-ink-soft">{client.company ?? client.email}</small>
            </span>
            <em className="text-xs font-black uppercase not-italic text-teal-700">
              {client.pipelineStage ?? client.status ?? 'Lead'}
            </em>
          </button>
        ))}
      </div>
    </Section>
  )
}
