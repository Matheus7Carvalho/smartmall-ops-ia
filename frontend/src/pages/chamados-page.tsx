import { ClipboardListIcon } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { BarraFiltros, FiltroSelect } from '@/components/shared/filtros'
import { PageHeader } from '@/components/shared/page-header'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChamadosTable } from '@/features/chamados/components/chamados-table'
import { useChamados } from '@/features/chamados/hooks'
import { statusChamado, type StatusChamado } from '@/features/chamados/types'
import { useFiltrosUrl } from '@/lib/filtros'

const FILTROS = ['status'] as const

export function ChamadosPage() {
  const [params, setParams] = useSearchParams()
  const numero = Number(params.get('pagina') ?? 1)
  const pagina = Number.isSafeInteger(numero) && numero > 0 ? numero - 1 : 0
  const filtros = useFiltrosUrl(FILTROS, ['pagina'])
  const status = statusChamado.some((s) => s.valor === filtros.valores.status) ? filtros.valores.status as StatusChamado : undefined
  const consulta = useChamados(pagina, status)
  const dados = consulta.data

  const mudarPagina = useCallback((proxima: number) => {
    const novos = new URLSearchParams(window.location.search)
    if (proxima === 0) novos.delete('pagina')
    else novos.set('pagina', String(proxima + 1))
    setParams(novos)
  }, [setParams])

  useEffect(() => {
    if (dados && pagina > 0 && pagina >= dados.page.totalPages) mudarPagina(Math.max(0, dados.page.totalPages - 1))
  }, [dados, pagina, mudarPagina])

  return (
    <>
      <PageHeader title="Chamados externos" />
      <p className="text-sm text-muted-foreground">Relatos enviados por QR Code aguardam avaliação antes de gerar tarefas.</p>
      <BarraFiltros ativos={filtros.ativos} onLimpar={() => filtros.limpar()}>
        <FiltroSelect id="filtro-chamado-status" label="Status" valor={filtros.valores.status} onChange={(valor) => filtros.definir('status', valor)} opcoes={statusChamado} todos="Todos" />
      </BarraFiltros>
      {consulta.isPending && <Skeleton className="h-48 w-full" />}
      {consulta.isError && <ErrorState onRetry={() => consulta.refetch()} />}
      {dados?.page.totalElements === 0 && (filtros.ativos > 0 ? <SemResultado onLimpar={() => filtros.limpar()} /> : <EmptyState title="Nenhum chamado recebido" icon={ClipboardListIcon} />)}
      {dados && dados.content.length > 0 && (
        <>
          <ChamadosTable chamados={dados.content} />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground" aria-label="Paginação de chamados">
            <span>{dados.page.totalElements} {dados.page.totalElements === 1 ? 'chamado' : 'chamados'} · Página {dados.page.number + 1} de {dados.page.totalPages}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled={pagina === 0} onClick={() => mudarPagina(pagina - 1)}>Anterior</Button>
              <Button type="button" variant="outline" size="sm" disabled={pagina + 1 >= dados.page.totalPages} onClick={() => mudarPagina(pagina + 1)}>Próxima</Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
