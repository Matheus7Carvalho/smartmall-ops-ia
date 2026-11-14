import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useOrigemAtual } from '@/lib/navegacao'
import { cn } from '@/lib/utils'

type CartaoIndicadorProps = {
  id: string
  titulo: string
  valor: number
  icone: LucideIcon
  /** Complemento do valor principal (ex.: "de 5"). */
  sufixo?: string
  destaque?: boolean
  link: { to: string; rotulo: string }
  children?: ReactNode
}

/** Indicador da Central: título, valor principal, detalhes e link para a tela que aprofunda o número. */
export function CartaoIndicador({ id, titulo, valor, icone: Icone, sufixo, destaque, link, children }: CartaoIndicadorProps) {
  const origem = useOrigemAtual()
  const tituloId = `indicador-${id}`
  return (
    <section aria-labelledby={tituloId} className={cn('flex flex-col gap-3 rounded-lg border bg-card p-4', destaque && 'border-destructive/40 bg-destructive/5')}>
      <div className="flex items-center justify-between gap-2">
        <h3 id={tituloId} className="text-sm font-medium text-muted-foreground">
          {titulo}
        </h3>
        <Icone className={cn('size-5 shrink-0 text-muted-foreground', destaque && 'text-destructive')} aria-hidden />
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className={cn('text-3xl font-semibold tabular-nums', destaque && 'text-destructive')}>{valor}</span>
        {sufixo && <span className="text-sm text-muted-foreground">{sufixo}</span>}
      </p>
      {children && <div className="grid gap-2 text-sm">{children}</div>}
      <Link to={link.to} state={origem} className="mt-auto text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:underline">
        {link.rotulo}
      </Link>
    </section>
  )
}
