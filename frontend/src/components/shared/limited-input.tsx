import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type LimitedInputProps = Omit<ComponentProps<typeof Input>, 'maxLength'> & {
  id: string
  /** Obrigatório: todo campo de texto livre tem limite (igual ao @Size do backend e à coluna do banco). */
  maxLength: number
  /** Tamanho atual do valor (useWatch). */
  length: number
  /** 'always': contador sempre visível. 'near-limit': só a partir de 80% do limite. */
  counter?: 'always' | 'near-limit'
}

/** Campo de texto com limite obrigatório e contador dentro do campo, sem deslocar o layout. */
export function LimitedInput({ id, maxLength, length, counter = 'near-limit', className, ...props }: LimitedInputProps) {
  const visivel = counter === 'always' || length >= Math.ceil(maxLength * 0.8)
  const contadorId = `${id}-contador`

  return (
    <div className="relative">
      <Input
        id={id}
        maxLength={maxLength}
        aria-describedby={visivel ? contadorId : undefined}
        className={cn(visivel && 'pr-16', className)}
        {...props}
      />
      {visivel && (
        <span
          id={contadorId}
          className={cn(
            'pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs text-muted-foreground tabular-nums',
            length >= maxLength && 'text-destructive',
          )}
        >
          <span className="sr-only">Caracteres usados: </span>
          {length}/{maxLength}
        </span>
      )}
    </div>
  )
}
