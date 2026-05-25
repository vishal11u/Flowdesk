import type { AuthSession, AuthenticatedUser } from '../../lib/types'
import { Button, Section } from '../../components/ui'

export function AccountStrip({
  currentUser,
  isBusy,
  onRefresh,
  session,
}: {
  currentUser?: AuthenticatedUser
  isBusy: boolean
  onRefresh: () => void
  session: AuthSession
}) {
  return (
    <Section className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-stretch">
      <div>
        <p className="text-xs font-extrabold uppercase text-slate-500">Authenticated backend user</p>
        <h2 className="text-xl font-black text-ink">{currentUser?.email ?? session.user.email}</h2>
        <p className="mt-1 text-ink-soft">
          User ID {currentUser?.userId ?? session.user.id} · Organization{' '}
          {currentUser?.organizationId ?? session.user.organizationId}
        </p>
      </div>
      <Button type="button" onClick={onRefresh} disabled={isBusy}>
        Refresh token
      </Button>
    </Section>
  )
}
