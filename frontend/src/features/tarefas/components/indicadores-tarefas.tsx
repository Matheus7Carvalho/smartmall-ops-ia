import { AlertTriangleIcon, CalendarClockIcon, CalendarDaysIcon, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useResumoTarefas } from '../hooks'

type Indicador = { rotulo: string; valor: number; icone: LucideIcon; destaque?: boolean }

export function IndicadoresTarefas() {
  const { data, isPending, isError } = useResumoTarefas()

  if (isPending) return <Skeleton className="h-20 w-full" />
  if (isError || !data) return null

  const indicadores: Indicador[] = [
    { rotulo: 'Atrasadas', valor: data.atrasadas, icone: AlertTriangleIcon, destaque: data.atrasadas > 0 },
    { rotulo: 'Próximos 7 dias', valor: data.proximos7Dias, icone: CalendarClockIcon },
    { rotulo: 'Agendadas no mês', valor: data.agendadasNoMes, icone: CalendarDaysIcon },
  ]

  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Indicadores">
      {indicadores.map(({ rotulo, valor, icone: Icone, destaque }) => (
        <div key={rotulo} className={cn('flex items-center gap-3 rounded-lg border p-3 sm:p-4', destaque && 'border-destructive/40 bg-destructive/5')}>
          <Icone className={cn('hidden size-5 shrink-0 text-muted-foreground sm:block', destaque && 'text-destructive')} aria-hidden />
          <div className="grid">
            <dt className="text-xs text-muted-foreground">{rotulo}</dt>
            <dd className={cn('text-2xl font-semibold tabular-nums', destaque && 'text-destructive')}>{valor}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
