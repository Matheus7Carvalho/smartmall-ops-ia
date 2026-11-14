import { CalendarDaysIcon, SquareKanbanIcon } from 'lucide-react'
import { AlternarVisao, type OpcaoVisao } from '@/components/shared/alternar-visao'

export type Visao = 'calendario' | 'kanban'

const OPCOES: readonly OpcaoVisao<Visao>[] = [
  { valor: 'calendario', rotulo: 'Calendário', icone: CalendarDaysIcon },
  { valor: 'kanban', rotulo: 'Kanban', icone: SquareKanbanIcon },
]

/** Alterna a visualização das tarefas. Só a área abaixo dos filtros muda. */
export function VisaoTarefas({ valor, onChange }: { valor: Visao; onChange: (v: Visao) => void }) {
  return <AlternarVisao opcoes={OPCOES} valor={valor} onChange={onChange} />
}
