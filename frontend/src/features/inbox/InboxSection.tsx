import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Section, SectionHeading, Select, Textarea } from '../../components/ui'
import type { Client, Message } from '../../lib/types'

export function InboxSection({
  draft,
  isBusy,
  isEnabled,
  messages,
  onAddMessage,
  onDraftChange,
  onGenerateReply,
  onSaveReply,
  selectedClient,
}: {
  draft: string
  isBusy: boolean
  isEnabled: boolean
  messages: Message[]
  onAddMessage: (body: { message: string; type: Message['type'] }) => void
  onDraftChange: (value: string) => void
  onGenerateReply: () => void
  onSaveReply: () => void
  selectedClient: Client | null
}) {
  const [manualMessage, setManualMessage] = useState({
    text: '',
    type: 'incoming' as Message['type'],
  })

  function handleManualMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!manualMessage.text.trim()) return

    onAddMessage({ message: manualMessage.text.trim(), type: manualMessage.type })
    setManualMessage({ text: '', type: 'incoming' })
  }

  return (
    <Section id="inbox" className="flex min-h-[620px] flex-col">
      <SectionHeading
        eyebrow="Inbox"
        title={selectedClient ? selectedClient.name : 'Select a client'}
        action={
          <Button type="button" onClick={onGenerateReply} disabled={!selectedClient || isBusy}>
            Draft reply
          </Button>
        }
      />

      <div className="flex min-h-72 flex-1 flex-col gap-2.5 overflow-auto pr-1">
        {messages.length === 0 && (
          <p className="text-ink-soft">No messages yet. Add a client conversation to begin.</p>
        )}
        {messages.map((message) => (
          <article
            className="max-w-[78%] rounded-lg border border-line bg-slate-50 p-3 data-[type=outgoing]:ml-auto data-[type=outgoing]:border-teal-100 data-[type=outgoing]:bg-brand-soft max-md:max-w-full"
            data-type={message.type}
            key={message.id}
          >
            <span className="text-xs font-extrabold uppercase text-slate-500">
              {message.type === 'incoming' ? 'Client' : 'Agent'}
            </span>
            <p className="my-2">{message.message}</p>
            <time className="text-xs text-slate-500">{new Date(message.timestamp).toLocaleString()}</time>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-stretch gap-2.5 max-md:flex-col">
        <Textarea
          aria-label="Reply draft"
          placeholder="Draft or generate a reply..."
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />
        <Button
          type="button"
          className="self-end max-md:w-full"
          variant="primary"
          onClick={onSaveReply}
          disabled={!isEnabled || isBusy}
        >
          Save reply
        </Button>
      </div>

      <form className="mt-3 grid grid-cols-[140px_minmax(0,1fr)_auto] gap-2.5 max-md:grid-cols-1" onSubmit={handleManualMessage}>
        <Select
          aria-label="Message type"
          value={manualMessage.type}
          onChange={(event) =>
            setManualMessage((current) => ({ ...current, type: event.target.value as Message['type'] }))
          }
        >
          <option value="incoming">Incoming</option>
          <option value="outgoing">Outgoing</option>
        </Select>
        <Field
          aria-label="Manual message"
          placeholder="Add message through /messages"
          value={manualMessage.text}
          onChange={(event) =>
            setManualMessage((current) => ({ ...current, text: event.target.value }))
          }
        />
        <Button type="submit" disabled={!isEnabled || !selectedClient || isBusy}>
          Add
        </Button>
      </form>
    </Section>
  )
}
