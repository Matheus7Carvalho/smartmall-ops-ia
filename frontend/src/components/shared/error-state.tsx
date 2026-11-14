import { CircleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorStateProps = {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Não foi possível carregar.', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 p-10 text-center">
      <CircleAlertIcon className="size-8 text-destructive" aria-hidden />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
