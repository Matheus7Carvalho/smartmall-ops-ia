import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { faixaHorario } from '../formatos'
import { localTarefa, origemLabel, rotaOrigemTarefa, situacaoDe, situacaoInfo, type Tarefa } from '../types'

type TarefaResumoProps = {
  tarefa: Tarefa
  /** Administrador e Supervisor abrem o registro de origem. */
  podeGerenciar: boolean
}

export function TarefaResumo({ tarefa: t, podeGerenciar }: TarefaResumoProps) {
  const origem = useOrigemAtual()
  const situacao = situacaoInfo[situacaoDe(t)]
  const rotaOrigem = rotaOrigemTarefa(t)
  const campos: [string, ReactNode][] = [
    ['Situação', <StatusBadge key="situacao" tom={situacao.tom}>{situacao.rotulo}</StatusBadge>],
    ['Data', `${formatar.data(t.dataHoraPrevista)}, ${faixaHorario(t.dataHoraPrevista, t.duracaoMinutos)}`],
    ['Local', localTarefa(t)],
    ['Equipe', t.equipe.nome],
    ['Responsável', t.responsavel?.nome ?? '—'],
    ['Modelo de checklist', t.checklist?.nome ?? 'Sem checklist'],
    [
      'Origem',
      podeGerenciar && rotaOrigem ? (
        <Link key="origem" to={rotaOrigem} state={origem} className="underline-offset-4 hover:underline">
          {origemLabel[t.origem]}
        </Link>
      ) : (
        origemLabel[t.origem]
      ),
    ],
  ]

  return (
    <dl className="grid gap-x-6 gap-y-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      {campos.map(([rotulo, valor]) => (
        <div key={rotulo} className="grid gap-0.5">
          <dt className="text-xs text-muted-foreground">{rotulo}</dt>
          <dd className="text-sm">{valor}</dd>
        </div>
      ))}
    </dl>
  )
}
