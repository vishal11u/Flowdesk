import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Section, SectionHeading, Select, Textarea } from '../../components/ui'
import type { Channel } from '../../lib/types'

export function BackendConsole({
  apiResult,
  isBusy,
  isEnabled,
  onCreateDemoUser,
  onFetchDemoUserById,
  onFetchDemoUsers,
  onIngestProviderEvent,
  onSendProviderMessage,
}: {
  apiResult: string
  isBusy: boolean
  isEnabled: boolean
  onCreateDemoUser: (body: { name: string; age: number }) => void
  onFetchDemoUserById: () => void
  onFetchDemoUsers: () => void
  onIngestProviderEvent: (body: {
    channel: Channel
    senderName: string
    senderEmail: string
    message: string
  }) => void
  onSendProviderMessage: (body: { channel: Channel; recipient: string; message: string }) => void
}) {
  const [providerSend, setProviderSend] = useState({
    channel: 'gmail' as Channel,
    recipient: '',
    message: '',
  })
  
  const [ingestEvent, setIngestEvent] = useState({
    channel: 'gmail' as Channel,
    senderName: '',
    senderEmail: '',
    message: '',
  })

  const [demoUser, setDemoUser] = useState({
    name: 'Demo Operator',
    age: '28',
  })

  function handleProviderSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!providerSend.recipient || !providerSend.message) return
    onSendProviderMessage(providerSend)
  }

  function handleProviderIngest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ingestEvent.senderName || !ingestEvent.senderEmail || !ingestEvent.message) return
    onIngestProviderEvent(ingestEvent)
    setIngestEvent({ channel: 'gmail', senderName: '', senderEmail: '', message: '' })
  }

  function handleDemoUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCreateDemoUser({ name: demoUser.name, age: Number(demoUser.age) })
  }

  return (
    <section id="backend" className="grid grid-cols-2 gap-3.5 max-lg:grid-cols-1">
      <Section>
        <SectionHeading eyebrow="Integration send" title="Queue provider message" />
        <form className="grid gap-2.5" onSubmit={handleProviderSend}>
          <Select
            aria-label="Provider channel"
            value={providerSend.channel}
            onChange={(event) =>
              setProviderSend((current) => ({ ...current, channel: event.target.value as Channel }))
            }
          >
            <option value="gmail">Gmail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="slack">Slack</option>
          </Select>
          <Field
            aria-label="Recipient"
            placeholder="recipient@example.com"
            value={providerSend.recipient}
            onChange={(event) =>
              setProviderSend((current) => ({ ...current, recipient: event.target.value }))
            }
          />
          <Textarea
            aria-label="Provider message"
            placeholder="Message to queue through /integrations/send"
            value={providerSend.message}
            onChange={(event) =>
              setProviderSend((current) => ({ ...current, message: event.target.value }))
            }
          />
          <Button type="submit" disabled={!isEnabled || isBusy}>
            Queue message
          </Button>
        </form>
      </Section>

      <Section>
        <SectionHeading eyebrow="Integration ingest" title="Simulate live inbound event" />
        <form className="grid gap-2.5" onSubmit={handleProviderIngest}>
          <Select
            aria-label="Inbound channel"
            value={ingestEvent.channel}
            onChange={(event) =>
              setIngestEvent((current) => ({ ...current, channel: event.target.value as Channel }))
            }
          >
            <option value="gmail">Gmail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="slack">Slack</option>
          </Select>
          <Field
            aria-label="Sender name"
            placeholder="Sender name"
            value={ingestEvent.senderName}
            onChange={(event) =>
              setIngestEvent((current) => ({ ...current, senderName: event.target.value }))
            }
          />
          <Field
            aria-label="Sender email"
            placeholder="sender@example.com"
            type="email"
            value={ingestEvent.senderEmail}
            onChange={(event) =>
              setIngestEvent((current) => ({ ...current, senderEmail: event.target.value }))
            }
          />
          <Textarea
            aria-label="Inbound message"
            placeholder="Inbound message body"
            value={ingestEvent.message}
            onChange={(event) =>
              setIngestEvent((current) => ({ ...current, message: event.target.value }))
            }
          />
          <Button type="submit" disabled={!isEnabled || isBusy}>
            Ingest event
          </Button>
        </form>
      </Section>

      <Section>
        <SectionHeading eyebrow="Users controller" title="Demo endpoints" />
        <div className="mb-3 flex flex-wrap gap-2.5">
          <Button type="button" onClick={onFetchDemoUsers} disabled={!isEnabled || isBusy}>
            GET /users
          </Button>
          <Button type="button" onClick={onFetchDemoUserById} disabled={!isEnabled || isBusy}>
            GET /users/1
          </Button>
        </div>
        <form className="grid grid-cols-[minmax(0,1fr)_120px_auto] gap-2.5 max-md:grid-cols-1" onSubmit={handleDemoUser}>
          <Field
            aria-label="Demo user name"
            value={demoUser.name}
            onChange={(event) => setDemoUser((current) => ({ ...current, name: event.target.value }))}
          />
          <Field
            aria-label="Demo user age"
            type="number"
            value={demoUser.age}
            onChange={(event) => setDemoUser((current) => ({ ...current, age: event.target.value }))}
          />
          <Button type="submit" disabled={!isEnabled || isBusy}>
            POST /users
          </Button>
        </form>
      </Section>

      <Section>
        <SectionHeading eyebrow="Last API result" title="Response inspector" />
        <pre className="max-h-96 min-h-56 overflow-auto rounded-lg border border-line bg-slate-950 p-4 text-sm text-emerald-100 whitespace-pre-wrap">
          {apiResult || 'Run a backend action to inspect the response.'}
        </pre>
      </Section>
    </section>
  )
}
