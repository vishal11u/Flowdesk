import { Field } from '../ui'

export function Sidebar({
  apiUrl,
  onApiUrlChange,
}: {
  apiUrl: string
  onApiUrlChange: (value: string) => void
}) {
  return (
    <aside className="sticky top-0 flex h-svh flex-col gap-7 border-r border-line bg-panel p-6 max-lg:static max-lg:h-auto">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-brand font-black text-white">
          FD
        </span>
        <div>
          <strong className="block text-lg leading-tight">FlowDesk</strong>
          <span className="text-xs font-bold uppercase text-slate-500">Operator console</span>
        </div>
      </div>

      <nav className="grid gap-2 max-lg:grid-cols-5 max-md:grid-cols-1" aria-label="Primary navigation">
        {['Overview', 'Inbox', 'Integrations', 'Clients', 'Backend'].map((item, index) => (
          <a
            href={`#${item.toLowerCase()}`}
            aria-current={index === 0 ? 'page' : undefined}
            className="flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-slate-700 hover:bg-brand-soft hover:text-brand aria-current:bg-brand-soft aria-current:text-brand"
            key={item}
          >
            {item}
          </a>
        ))}
      </nav>

      <label className="mt-auto grid gap-2 text-xs font-extrabold uppercase text-slate-500">
        API endpoint
        <Field
          aria-label="API endpoint"
          value={apiUrl}
          onChange={(event) => onApiUrlChange(event.target.value)}
        />
      </label>
    </aside>
  )
}
