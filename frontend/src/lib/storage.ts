import type { AuthSession } from './types'

const sessionKey = 'flowdesk.session'
const apiUrlKey = 'flowdesk.apiUrl'

export function readSession(): AuthSession | null {
  const storedSession = localStorage.getItem(sessionKey)

  if (!storedSession) return null

  try {
    return JSON.parse(storedSession) as AuthSession
  } catch {
    return null
  }
}

export function writeSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(sessionKey, JSON.stringify(session))
    return
  }

  localStorage.removeItem(sessionKey)
}

export function readApiUrl(fallback: string) {
  return localStorage.getItem(apiUrlKey) ?? fallback
}

export function writeApiUrl(apiUrl: string) {
  localStorage.setItem(apiUrlKey, apiUrl)
}
