import { Button } from '@/components/ui/Button'

export function ErrorState({ title = 'Request failed', description, actionLabel = 'Retry', onRetry, onAction }) {
  const action = onRetry || onAction

  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50/90 px-6 py-10 text-center dark:border-rose-500/25 dark:bg-rose-500/10">
      <h4 className="text-lg font-semibold text-rose-700 dark:text-rose-100">{title}</h4>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-700/80 dark:text-rose-100/80">{description || 'Unexpected API error'}</p>
      {action ? (
        <Button type="button" onClick={action} variant="subtle" className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
