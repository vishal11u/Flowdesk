import type { AuthSession } from '../../lib/types'
import { Button } from '../ui'

export function Topbar({
  session,
  onLogout,
}: {
  session: AuthSession | null
  onLogout: () => void
}) {
  return (
    <header className="flex items-start justify-between gap-6 max-lg:flex-col">
      <div>
        <p className="text-xs font-extrabold uppercase text-slate-500">SaaS MVP dashboard</p>
        <h1 className="max-w-4xl text-5xl font-black leading-none text-ink max-md:text-3xl">
          Live customer operations, from first message to final reply.
        </h1>
      </div>
      <div className="flex min-w-56 items-center justify-between gap-3 rounded-lg border border-line bg-panel p-3 max-lg:w-full">
        {session ? (
          <>
            <span className="text-xs font-extrabold uppercase text-slate-500">{session.user.name}</span>
            <Button type="button" onClick={onLogout}>Sign out</Button>
          </>
        ) : (
          <span className="text-xs font-extrabold uppercase text-slate-500">Backend login required</span>
        )}
      </div>
    </header>
  )
}
