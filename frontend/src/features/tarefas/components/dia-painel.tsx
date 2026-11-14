import { CalendarCheckIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { formatar } from '@/lib/datas'
import type { Tarefa } from '../types'
import { TarefaItem } from './tarefa-item'

type DiaPainelProps = {
  dia: Date
  tarefas: Tarefa[]
  podeGerenciar: boolean
}

export function DiaPainel({ dia, tarefas, podeGerenciar }: DiaPainelProps) {
  return (
    <section aria-labelledby="dia-titulo" className="grid content-start gap-2 rounded-lg border p-4">
      <h2 id="dia-titulo" className="text-base font-semibold first-letter:uppercase">
        {formatar.diaLongo(dia)}
      </h2>
      {tarefas.length === 0 ? (
        <EmptyState title="Nenhuma tarefa neste dia" icon={CalendarCheckIcon} />
      ) : (
        <ul className="divide-y" aria-label="Tarefas do dia">
          {tarefas.map((t) => (
            <TarefaItem key={t.id} tarefa={t} podeGerenciar={podeGerenciar} />
          ))}
        </ul>
      )}
    </section>
  )
}
