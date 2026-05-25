import type { Channel, Client, Message } from './types'

export const apiDefault = import.meta.env.VITE_API_URL ?? 'http://localhost:3100'

export const channels: Array<{
  id: Channel
  name: string
  label: string
  purpose: string
}> = [
  {
    id: 'gmail',
    name: 'Gmail',
    label: 'Email',
    purpose: 'Shared sales and support inbox',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    label: 'Chat',
    purpose: 'Fast lead follow-up and service updates',
  },
  {
    id: 'slack',
    name: 'Slack',
    label: 'Team',
    purpose: 'Internal routing and handoff alerts',
  },
]

export const sampleClients: Client[] = [
  {
    id: 101,
    name: 'Aarav Mehta',
    email: 'aarav@novacare.example',
    company: 'NovaCare Clinics',
    status: 'lead',
    source: 'gmail',
    pipelineStage: 'Discovery',
    notes: 'Asked for response automation across three locations.',
  },
  {
    id: 102,
    name: 'Maya Rao',
    email: 'maya@urbanthread.example',
    company: 'Urban Thread',
    status: 'active',
    source: 'whatsapp',
    pipelineStage: 'Onboarding',
    notes: 'Needs WhatsApp updates and billing reminders.',
  },
]

export const sampleMessages: Record<number, Message[]> = {
  101: [
    {
      id: 1,
      clientId: 101,
      type: 'incoming',
      message: 'Can FlowDesk summarize Gmail requests and draft replies for our front desk?',
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      clientId: 101,
      type: 'outgoing',
      message:
        'Yes. We can connect Gmail, classify intent, and prepare reviewable replies before anything is sent.',
      timestamp: new Date().toISOString(),
    },
  ],
  102: [
    {
      id: 3,
      clientId: 102,
      type: 'incoming',
      message: 'Can WhatsApp reminders trigger when an order moves to dispatch?',
      timestamp: new Date().toISOString(),
    },
  ],
}
