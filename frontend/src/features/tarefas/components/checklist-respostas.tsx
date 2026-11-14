import type { ItemTarefa } from '../types'

function exibir(item: ItemTarefa) {
  if (item.resposta == null) return '—'
  if (item.tipoResposta === 'SIM_NAO') return item.resposta === 'SIM' ? 'Sim' : 'Não'
  if (item.tipoResposta === 'NUMERO') return Number(item.resposta).toLocaleString('pt-BR')
  return item.resposta
}

/** Checklist preenchido (somente leitura): uma linha por item. */
export function ChecklistRespostas({ itens, observacao }: { itens: ItemTarefa[]; observacao: string | null }) {
  return (
    <section aria-labelledby="checklist-titulo" className="grid gap-3">
      <h2 id="checklist-titulo" className="text-lg font-semibold">
        Checklist
      </h2>
      <dl className="divide-y rounded-lg border">
        {itens.map((item) => (
          <div key={item.id} className="grid gap-1 px-4 py-2 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-4">
            <dt className="text-sm text-muted-foreground">{item.pergunta}</dt>
            <dd className="text-sm whitespace-pre-line">{exibir(item)}</dd>
          </div>
        ))}
        <div className="grid gap-1 px-4 py-2 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-4">
          <dt className="text-sm text-muted-foreground">Observação</dt>
          <dd className="text-sm whitespace-pre-line">{observacao ?? '—'}</dd>
        </div>
      </dl>
    </section>
  )
}
