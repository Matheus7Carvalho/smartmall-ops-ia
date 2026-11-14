import { CalendarDaysIcon, CalendarXIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TarefaItem } from '@/features/tarefas/components/tarefa-item'
import { useTarefas } from '@/features/tarefas/hooks'
import { LIMITE } from '@/features/tarefas/limites'
import { paraIsoData, somarDias } from '@/lib/datas'
import { useAgora } from '@/lib/use-agora'

const QUANTIDADE = 8

/** Próximas tarefas geradas por uma manutenção programada, com cancelamento por data. */
export function ProximasTarefas({ manutencaoProgramadaId }: { manutencaoProgramadaId: string }) {
  const hoje = useAgora()
  const consulta = useTarefas({ manutencaoProgramadaId, de: paraIsoData(hoje), ate: paraIsoData(somarDias(hoje, LIMITE.diasConsulta - 1)) })
  const proximas = (consulta.data ?? []).filter((t) => new Date(t.dataHoraPrevista) >= hoje).slice(0, QUANTIDADE)

  return (
    <section aria-labelledby="proximas-titulo" className="grid content-start gap-2 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="proximas-titulo" className="text-base font-semibold">
          Próximas tarefas
        </h2>
        {/* Da manutenção programada para Tarefas, já no dia da próxima. */}
        {proximas[0] && (
          <Button asChild variant="link" size="sm" className="h-auto px-0">
            <Link to={`/tarefas?dia=${proximas[0].dataHoraPrevista.slice(0, 10)}`}>
              <CalendarDaysIcon aria-hidden />
              Ver em Tarefas
            </Link>
          </Button>
        )}
      </div>
      {consulta.isPending && <Skeleton className="h-40 w-full" />}
      {consulta.isError && <ErrorState onRetry={() => consulta.refetch()} />}
      {consulta.data && proximas.length === 0 && <EmptyState title="Nenhuma tarefa futura" icon={CalendarXIcon} />}
      {proximas.length > 0 && (
        <ul className="divide-y" aria-label="Próximas tarefas">
          {proximas.map((t) => (
            <TarefaItem key={t.id} tarefa={t} podeGerenciar mostrarData compacto />
          ))}
        </ul>
      )}
    </section>
  )
}
