import { StatusBadge } from '@/components/shared/status-badge'
import { formatar } from '@/lib/datas'
import { cn } from '@/lib/utils'
import { faixaHorario } from '../formatos'
import { situacaoDe, situacaoInfo, type Situacao, type Tarefa } from '../types'
import { itemAbrivel, TarefaAbrir } from './tarefa-abrir'
import { TarefaAcoes } from './tarefa-acoes'
import { TarefaOrigem } from './tarefa-origem'

type KanbanTarefasProps = {
  tarefas: Tarefa[]
  /** Com filtro de situação, só a coluna correspondente aparece. */
  situacao?: Situacao
  podeGerenciar: boolean
}

/** Ordem do fluxo (AGENDADA → EM_EXECUCAO → EM_ANALISE → CONCLUIDA), com as atrasadas primeiro: pedem ação. */
const COLUNAS: Situacao[] = ['ATRASADA', 'AGENDADA', 'EM_EXECUCAO', 'EM_ANALISE', 'CONCLUIDA', 'CANCELADA']

/**
 * Tarefas do período agrupadas por situação. As mudanças de situação acontecem na tela da tarefa
 * (assumir, enviar, aprovar) e nas ações do cartão (cancelar, restaurar), nunca arrastando.
 */
export function KanbanTarefas({ tarefas, situacao, podeGerenciar }: KanbanTarefasProps) {
  const colunas = situacao ? [situacao] : COLUNAS
  const ordenadas = [...tarefas].sort((a, b) => a.dataHoraPrevista.localeCompare(b.dataHoraPrevista))

  return (
    // Seis colunas não cabem lado a lado em telas médias: o quadro rola na horizontal, a página não.
    // `relative`: elementos absolutos internos (sr-only) ficam presos à rolagem e não alargam a página.
    <div role="region" aria-label="Quadro Kanban" tabIndex={0} className="relative -mx-1 overflow-x-auto px-1 pb-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start gap-3">
        {colunas.map((coluna) => {
          const info = situacaoInfo[coluna]
          const itens = ordenadas.filter((t) => situacaoDe(t) === coluna)
          const tituloId = `kanban-${coluna.toLowerCase()}`
          return (
            <section
              key={coluna}
              aria-labelledby={tituloId}
              className={cn('grid w-64 shrink-0 content-start gap-2 rounded-lg border bg-muted/30 p-2.5', colunas.length === 1 ? 'w-full max-w-md' : 'xl:w-auto xl:min-w-56 xl:flex-1')}
            >
              <h3 id={tituloId} className="flex items-center justify-between gap-2 text-sm font-semibold">
                <StatusBadge tom={info.tom}>{info.rotulo}</StatusBadge>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {itens.length}
                  <span className="sr-only"> tarefa{itens.length === 1 ? '' : 's'}</span>
                </span>
              </h3>
              {itens.length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">Nenhuma tarefa</p>
              ) : (
                <ul className="grid gap-2" aria-label={`Tarefas: ${info.rotulo}`}>
                  {itens.map((t) => (
                    <CartaoTarefa key={t.id} tarefa={t} podeGerenciar={podeGerenciar} />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** O cartão inteiro abre a tarefa; origem e ações mantêm a própria ação. */
function CartaoTarefa({ tarefa: t, podeGerenciar }: { tarefa: Tarefa; podeGerenciar: boolean }) {
  return (
    <li className={cn(itemAbrivel, 'flex items-start gap-2 rounded-md border bg-background p-2.5 shadow-xs hover:border-primary/40', t.status === 'CANCELADA' && 'text-muted-foreground')}>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-xs font-medium tabular-nums">
          <span className="capitalize">{formatar.diaCurto(t.dataHoraPrevista)}</span> · <span className="whitespace-nowrap">{faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}</span>
        </span>
        <TarefaAbrir tarefa={t} className="line-clamp-2" />
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {t.piso} · {t.localizacao} · {t.equipe.nome}
        </span>
        {t.responsavel && <span className="truncate text-xs">Responsável: {t.responsavel.nome}</span>}
        <TarefaOrigem tarefa={t} podeGerenciar={podeGerenciar} />
      </div>
      {podeGerenciar && <TarefaAcoes tarefa={t} />}
    </li>
  )
}
