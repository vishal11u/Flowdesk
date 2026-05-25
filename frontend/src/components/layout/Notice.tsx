export function Notice({ isBusy, notice }: { isBusy: boolean; notice: string }) {
  return (
    <section className="flex items-center gap-3 rounded-lg border border-teal-100 bg-brand-soft px-4 py-3" role="status">
      <span className="text-xs font-extrabold uppercase text-slate-500">
        {isBusy ? 'Working...' : 'Status'}
      </span>
      <p className="m-0">{notice}</p>
    </section>
  )
}
