import { ClipboardCheckIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { FilaAnaliseTable } from '@/features/tarefas/components/fila-analise-table'
import { useTarefasEmAnalise } from '@/features/tarefas/hooks'

/** Fila de validação: tarefas enviadas pelos responsáveis, aguardando aprovação ou reprovação. */
export function EmAnalisePage() {
  const { data: tarefas, isPending, isError, refetch } = useTarefasEmAnalise()

  return (
    <>
      <PageHeader title="Análise de Tarefas" />
      {isPending && <Skeleton className="h-48 w-full max-w-6xl" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {tarefas?.length === 0 && <EmptyState title="Nenhuma tarefa em análise" icon={ClipboardCheckIcon} />}
      {!!tarefas?.length && (
        <div className="max-w-6xl">
          <FilaAnaliseTable tarefas={tarefas} />
        </div>
      )}
    </>
  )
}
