import { pontoDoTom } from '@/lib/tons'
import { cn } from '@/lib/utils'
import { situacoes } from '../types'

/** Cores das situações no calendário (as mesmas dos selos de situação). */
export function LegendaSituacoes() {
  return (
    <ul aria-label="Legenda das situações" className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {situacoes.map((s) => (
        <li key={s.valor} className="flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full', pontoDoTom[s.tom])} aria-hidden />
          {s.rotulo}
        </li>
      ))}
    </ul>
  )
}
