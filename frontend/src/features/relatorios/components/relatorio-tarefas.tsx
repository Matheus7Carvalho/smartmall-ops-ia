import { ClipboardXIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { condicaoInfo } from '@/features/equipamentos/types'
import { formatar } from '@/lib/datas'
import { useOrigemAtual } from '@/lib/navegacao'
import { useRelatorioTarefas } from '../hooks'
import type { FiltroRelatorio } from '../types'
import { ResumoTarefas } from './resumo-tarefas'
import { TabelaContagem } from './tabela-contagem'

/** Relatório de tarefas previstas no período: resumo, por equipe e por equipamento. */
export function RelatorioTarefas({ filtro, valido }: { filtro: FiltroRelatorio; valido: boolean }) {
  const { data, isPending, isError, refetch } = useRelatorioTarefas(filtro, valido)
  const origem = useOrigemAtual()

  return (
    <section aria-labelledby="relatorio-tarefas-titulo" className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="relatorio-tarefas-titulo" className="text-lg font-semibold">
          Tarefas
        </h2>
        {data && (
          <p className="text-sm text-muted-foreground">
            {formatar.data(data.de)} a {formatar.data(data.ate)}
          </p>
        )}
      </div>

      {valido && isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.totais.total === 0 && <EmptyState title="Nenhuma tarefa prevista no período" icon={ClipboardXIcon} />}

      {data && data.totais.total > 0 && (
        <>
          <ResumoTarefas totais={data.totais} />

          <section aria-labelledby="por-equipe-titulo" className="grid min-w-0 gap-2">
            <h3 id="por-equipe-titulo" className="font-medium">
              Por equipe
            </h3>
            <TabelaContagem
              coluna="Equipe"
              linhas={data.porEquipe.map((e) => ({
                id: e.id,
                rotulo: e.nome,
                contagem: e.contagem,
                nome: (
                  <Link to={`/tarefas?equipe=${e.id}&visao=kanban`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
                    {e.nome}
                  </Link>
                ),
              }))}
            />
          </section>

          <section aria-labelledby="por-equipamento-titulo" className="grid min-w-0 gap-2">
            <h3 id="por-equipamento-titulo" className="font-medium">
              Por equipamento
            </h3>
            <TabelaContagem
              coluna="Equipamento"
              linhas={data.porEquipamento.map((e) => ({
                id: e.id,
                rotulo: `${e.codigo} · ${e.nome}`,
                contagem: e.contagem,
                nome: (
                  <span className="grid gap-1">
                    <Link to={`/cadastros/equipamentos/${e.id}`} state={origem} className="font-medium text-primary underline-offset-4 hover:underline">
                      {e.codigo} · {e.nome}
                    </Link>
                    <StatusBadge tom={condicaoInfo[e.condicao].tom} className="w-fit">
                      {condicaoInfo[e.condicao].rotulo}
                    </StatusBadge>
                  </span>
                ),
              }))}
            />
          </section>
        </>
      )}
    </section>
  )
}
