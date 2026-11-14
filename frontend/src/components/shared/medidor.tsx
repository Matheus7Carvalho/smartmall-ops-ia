import { cn } from '@/lib/utils'

type MedidorProps = {
  /** Nome acessível (ex.: "Equipamentos ativos"). */
  rotulo: string
  /** Inteiro de 0 a 100. */
  percentual: number
  /** Texto ao lado da barra; padrão: "80%". */
  legenda?: string
  className?: string
}

/** Barra de percentual com papel "meter": o valor vai junto com o texto, não só na cor. */
export function Medidor({ rotulo, percentual, legenda, className }: MedidorProps) {
  const valor = Math.max(0, Math.min(100, percentual))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div role="meter" aria-label={rotulo} aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor} aria-valuetext={`${valor}%`} className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success" style={{ width: `${valor}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums whitespace-nowrap">{legenda ?? `${valor}%`}</span>
    </div>
  )
}
