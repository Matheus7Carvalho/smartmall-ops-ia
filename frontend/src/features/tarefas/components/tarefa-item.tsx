import { StatusBadge } from '@/components/shared/status-badge'
import { formatar } from '@/lib/datas'
import { cn } from '@/lib/utils'
import { faixaHorario } from '../formatos'
import { localTarefa, situacaoDe, situacaoInfo, type Tarefa } from '../types'
import { itemAbrivel, TarefaAbrir } from './tarefa-abrir'
import { TarefaAcoes } from './tarefa-acoes'
import { TarefaOrigem } from './tarefa-origem'

type TarefaItemProps = {
  tarefa: Tarefa
  /** Administrador e Supervisor podem cancelar, restaurar e abrir a origem. */
  podeGerenciar: boolean
  /** Mostrar a data (listas com dias diferentes) ou só o horário (painel de um dia). */
  mostrarData?: boolean
  /** Equipamento e origem já são conhecidos (ex.: tela da manutenção programada). */
  compacto?: boolean
}

export function TarefaItem({ tarefa: t, podeGerenciar, mostrarData, compacto }: TarefaItemProps) {
  const situacao = situacaoInfo[situacaoDe(t)]

  return (
    // A área inteira (horário e dados) abre a tarefa.
    <li className={cn(itemAbrivel, '-mx-2 flex items-start gap-3 rounded-md px-2 py-3 hover:bg-muted/60', t.status === 'CANCELADA' && 'text-muted-foreground')}>
      <div className="w-24 shrink-0 text-sm tabular-nums">
        {mostrarData && <div className="font-medium capitalize">{formatar.diaCurto(t.dataHoraPrevista)}</div>}
        <div className={cn(!mostrarData && 'font-medium')}>{faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}</div>
      </div>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <TarefaAbrir tarefa={t} oculto={compacto} className="truncate" />
        {!compacto && (
          <span className="truncate text-xs text-muted-foreground">
            {localTarefa(t)} · {t.equipe.nome}
            {t.responsavel && ` · ${t.responsavel.nome}`}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatusBadge tom={situacao.tom}>{situacao.rotulo}</StatusBadge>
          {!compacto && <TarefaOrigem tarefa={t} podeGerenciar={podeGerenciar} />}
        </span>
      </div>
      {podeGerenciar && <TarefaAcoes tarefa={t} />}
    </li>
  )
}
