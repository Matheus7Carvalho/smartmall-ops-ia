import { ClipboardListIcon } from 'lucide-react'
import { useState } from 'react'
import { BotaoNovo } from '@/components/shared/botao-novo'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { BarraFiltros, FiltroTexto } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { ChecklistTable } from '@/features/checklists/components/checklist-table'
import { ExcluirChecklistDialog } from '@/features/checklists/components/excluir-checklist-dialog'
import { useChecklists } from '@/features/checklists/hooks'
import type { Checklist } from '@/features/checklists/types'
import { contem, useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['nome'] as const

export function ChecklistsPage() {
  const { data: checklists, isPending, isError, refetch } = useChecklists()
  const [excluindo, setExcluindo] = useState<Checklist | null>(null)
  const filtros = useFiltrosUrl(FILTROS)

  const visiveis = (checklists ?? []).filter((c) => contem(c.nome, filtros.valores.nome))
  const novo = <BotaoNovo para="novo">Novo modelo</BotaoNovo>
  const temCadastro = !!checklists && checklists.length > 0

  return (
    <>
      <PageHeader title="Modelos de checklist" actions={temCadastro && novo} />
      {temCadastro && (
        <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
          <FiltroTexto id="filtro-nome" label="Nome" valor={filtros.valores.nome} onChange={(v) => filtros.definir('nome', v)} className="sm:w-64" />
        </BarraFiltros>
      )}
      {isPending && <Skeleton className="h-48 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {checklists?.length === 0 && <EmptyState title="Nenhum modelo de checklist cadastrado" icon={ClipboardListIcon} action={novo} />}
      {temCadastro && visiveis.length === 0 && <SemResultado onLimpar={() => filtros.limpar()} />}
      {visiveis.length > 0 && <ChecklistTable checklists={visiveis} onExcluir={setExcluindo} />}

      <ExcluirChecklistDialog checklist={excluindo} onClose={() => setExcluindo(null)} />
    </>
  )
}
