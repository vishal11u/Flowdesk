import { Button, Section, SectionHeading } from '../../components/ui'
import { channels } from '../../lib/constants'
import type { Channel, IntegrationConnection } from '../../lib/types'

export function IntegrationsSection({
  connections,
  isBusy,
  isEnabled,
  onConnect,
  onRefresh,
}: {
  connections: IntegrationConnection[]
  isBusy: boolean
  isEnabled: boolean
  onConnect: (channel: Channel) => void
  onRefresh: () => void
}) {
  return (
    <Section id="integrations">
      <SectionHeading
        eyebrow="Integrations"
        title="Prepare the channels a real operator expects."
        action={
          <Button type="button" onClick={onRefresh} disabled={!isEnabled || isBusy}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
        {channels.map((channel) => {
          const connection = connections.find((item) => item.channel === channel.id)
          const status = connection?.status ?? 'disabled'

          return (
            <article className="grid gap-4 rounded-lg border border-line bg-white p-4" key={channel.id}>
              <div>
                <span className="w-fit rounded-full bg-blue-50 px-2 py-1 text-xs font-black text-blue-800">
                  {channel.label}
                </span>
                <h3 className="mt-3 text-lg font-black text-ink">{channel.name}</h3>
                <p className="text-ink-soft">{channel.purpose}</p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 data-[status=connected]:bg-green-100 data-[status=connected]:text-green-800 data-[status=needs_auth]:bg-amber-100 data-[status=needs_auth]:text-amber-800" data-status={status}>
                {status.replace('_', ' ')}
              </span>
              <Button
                type="button"
                onClick={() => onConnect(channel.id)}
                disabled={!isEnabled || isBusy}
              >
                {connection ? 'Update' : 'Connect'}
              </Button>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
