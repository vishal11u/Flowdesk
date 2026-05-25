import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Section } from '../../components/ui'

export function AuthPanel({
  isBusy,
  onLogin,
  onSignup,
}: {
  isBusy: boolean
  onLogin: (body: { email: string; password: string }) => void
  onSignup: (body: {
    email: string
    password: string
    name: string
    organizationName: string
  }) => void
}) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('founder@flowdesk.local')
  const [password, setPassword] = useState('password123')
  const [name, setName] = useState('FlowDesk Founder')
  const [organizationName, setOrganizationName] = useState('FlowDesk Demo')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (authMode === 'signup') {
      onSignup({ email, password, name, organizationName })
      return
    }

    onLogin({ email, password })
  }

  return (
    <Section className="flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-stretch">
      <div className="max-w-xl">
        <p className="text-xs font-extrabold uppercase text-slate-500">Start here</p>
        <h2 className="text-2xl font-black text-ink">Sign in or create the first workspace.</h2>
        <p className="mt-2 text-ink-soft">
          This dashboard uses the existing Nest auth endpoints and stores the returned token
          for React Query API calls.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-2.5">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-canvas p-1">
          <Button
            type="button"
            variant={authMode === 'login' ? 'secondary' : 'ghost'}
            onClick={() => setAuthMode('login')}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={authMode === 'signup' ? 'secondary' : 'ghost'}
            onClick={() => setAuthMode('signup')}
          >
            Signup
          </Button>
        </div>

        {authMode === 'signup' && (
          <>
            <Field aria-label="Name" value={name} onChange={(event) => setName(event.target.value)} />
            <Field
              aria-label="Organization"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
            />
          </>
        )}

        <Field
          aria-label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Field
          aria-label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" variant="primary" disabled={isBusy}>
          {authMode === 'signup' ? 'Create workspace' : 'Sign in'}
        </Button>
      </form>
    </Section>
  )
}
