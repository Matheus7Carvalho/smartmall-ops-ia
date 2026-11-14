import { Link } from 'react-router'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { cn } from '@/lib/utils'
import { faixaHorario } from '../formatos'
import { tituloTarefa, type Tarefa } from '../types'

type TarefaAbrirProps = {
  tarefa: Tarefa
  /** Esconde o título visualmente (o link continua cobrindo o item e com nome acessível). */
  oculto?: boolean
  className?: string
}

/**
 * Título que abre a tarefa. O ::after cobre o item inteiro (que precisa de `relative` e
 * `group/tarefa`); links e botões do item ficam acima dele com `relative z-10`.
 */
export function TarefaAbrir({ tarefa: t, oculto, className }: TarefaAbrirProps) {
  const origem = useOrigemAtual()
  const titulo = tituloTarefa(t)
  const quando = `${formatar.data(t.dataHoraPrevista)}, ${faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}`

  return (
    <Link
      to={`/tarefas/${t.id}`}
      state={origem}
      data-abrir
      className={cn(
        'text-sm font-medium underline-offset-4 outline-none group-hover/tarefa:underline after:absolute after:inset-0 after:content-[""]',
        t.status === 'CANCELADA' && 'line-through',
        className,
      )}
      aria-label={`Abrir tarefa de ${titulo}, ${quando}`}
    >
      <span className={cn(oculto && 'sr-only')}>{titulo}</span>
    </Link>
  )
}

/** Classes do item que contém um TarefaAbrir: foco visível do link no item inteiro. */
export const itemAbrivel = 'group/tarefa relative has-[a[data-abrir]:focus-visible]:ring-2 has-[a[data-abrir]:focus-visible]:ring-ring'
