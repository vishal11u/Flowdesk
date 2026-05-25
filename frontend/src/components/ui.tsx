import type { ComponentProps, ReactNode } from 'react'
import clsx from 'clsx'

export function Button({
  className,
  variant = 'secondary',
  ...props
}: ComponentProps<'button'> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return (
    <button
      className={clsx(
        'min-h-10 rounded-lg border px-3.5 font-bold text-sm transition disabled:cursor-not-allowed disabled:text-slate-400',
        variant === 'primary' && 'border-brand bg-brand text-white hover:bg-slate-900',
        variant === 'secondary' && 'border-line bg-white text-ink hover:border-slate-400',
        variant === 'ghost' && 'border-transparent bg-transparent text-ink hover:bg-brand-soft',
        className,
      )}
      {...props}
    />
  )
}

export function Field({
  className,
  ...props
}: ComponentProps<'input'> & { label?: string }) {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={clsx(
        'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={clsx(
        'min-h-28 w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10',
        className,
      )}
      {...props}
    />
  )
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={clsx('rounded-lg border border-line bg-panel p-4', className)}>
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase text-slate-500">{eyebrow}</p>
        <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function ErrorText({ error }: { error: unknown }) {
  if (!error) return null

  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
      {error instanceof Error ? error.message : 'Something went wrong'}
    </p>
  )
}
