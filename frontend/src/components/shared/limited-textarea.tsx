import type { ComponentProps } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type LimitedTextareaProps = Omit<ComponentProps<typeof Textarea>, 'maxLength'> & {
  id: string
  /** Obrigatório: igual ao @Size do backend e à coluna do banco. */
  maxLength: number
  length: number
}

/** Textarea com limite obrigatório e contador sempre visível no canto inferior. */
export function LimitedTextarea({ id, maxLength, length, className, ...props }: LimitedTextareaProps) {
  const contadorId = `${id}-contador`
  return (
    <div className="relative">
      <Textarea id={id} maxLength={maxLength} aria-describedby={contadorId} className={cn('pb-6', className)} {...props} />
      <span
        id={contadorId}
        className={cn(
          'pointer-events-none absolute right-2.5 bottom-1.5 text-xs text-muted-foreground tabular-nums',
          length >= maxLength && 'text-destructive',
        )}
      >
        <span className="sr-only">Caracteres usados: </span>
        {length}/{maxLength}
      </span>
    </div>
  )
}
