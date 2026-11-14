import type { Contagem } from '../types'

type Item = { rotulo: string; valor: number; detalhe?: string }

/** Totais do período. "Em andamento" = em execução + em análise. */
export function ResumoTarefas({ totais }: { totais: Contagem }) {
  const itens: Item[] = [
    { rotulo: 'Previstas', valor: totais.total },
    { rotulo: 'Concluídas', valor: totais.concluidas, detalhe: `${totais.taxaConclusao}% de conclusão` },
    { rotulo: 'Em andamento', valor: totais.emExecucao + totais.emAnalise, detalhe: `${totais.emAnalise} em análise` },
    { rotulo: 'Agendadas', valor: totais.agendadas },
    { rotulo: 'Atrasadas', valor: totais.atrasadas },
    { rotulo: 'Canceladas', valor: totais.canceladas },
    { rotulo: 'Com reprovação', valor: totais.comReprovacao },
  ]

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" aria-label="Resumo do período">
      {itens.map(({ rotulo, valor, detalhe }) => (
        <div key={rotulo} className="grid content-start gap-0.5 rounded-lg border p-3">
          <dt className="text-xs text-muted-foreground">{rotulo}</dt>
          <dd className="text-2xl font-semibold tabular-nums">{valor}</dd>
          {detalhe && <dd className="text-xs text-muted-foreground">{detalhe}</dd>}
        </div>
      ))}
    </dl>
  )
}
