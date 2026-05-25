export enum IntegrationChannel {
  WhatsApp = 'whatsapp',
  Gmail = 'gmail',
  Slack = 'slack',
  Crm = 'crm',
  Calendar = 'calendar',
  Invoice = 'invoice',
}

export enum IntegrationStatus {
  Connected = 'connected',
  NeedsAuth = 'needs_auth',
  Disabled = 'disabled',
}
