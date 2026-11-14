import { HistoryIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { BarraFiltros, FiltroData, FiltroSelect } from '@/components/shared/filtros'
import { Skeleton } from '@/components/ui/skeleton'
import { deIsoData } from '@/lib/datas'
import { useDestinos, useHistoricoEstoque, useItensEstoque } from '../hooks'
import { MAX_DIAS_HISTORICO, tiposMovimentacao, type TipoMovimentacao } from '../types'
import { MovimentacoesLista } from './movimentacoes-lista'

type Filtros = { de: string; ate: string; tipo: string; item: string; equipamento: string }

type MovimentacoesVisaoProps = {
  filtros: Filtros
  ativos: number
  onFiltro: (chave: keyof Filtros, valor: string) => void
  onLimpar: () => void
}

const DIA_MS = 24 * 60 * 60 * 1000

function erroDoPeriodo(de: string, ate: string) {
  if (ate < de) return 'A data final não pode ser antes da inicial.'
  if (Math.round((deIsoData(ate).getTime() - deIsoData(de).getTime()) / DIA_MS) >= MAX_DIAS_HISTORICO) return `Consulte no máximo ${MAX_DIAS_HISTORICO} dias por vez.`
  return null
}

/** Histórico geral de entradas e retiradas, para conferência e relatórios. */
export function MovimentacoesVisao({ filtros, ativos, onFiltro, onLimpar }: MovimentacoesVisaoProps) {
  const itens = useItensEstoque()
  const destinos = useDestinos()
  const erro = erroDoPeriodo(filtros.de, filtros.ate)
  const historico = useHistoricoEstoque(
    {
      de: filtros.de,
      ate: filtros.ate,
      tipo: (filtros.tipo || undefined) as TipoMovimentacao | undefined,
      itemId: filtros.item || undefined,
      equipamentoId: filtros.equipamento || undefined,
    },
    !erro,
  )

  return (
    <>
      <BarraFiltros ativos={ativos} onLimpar={onLimpar}>
        <FiltroData id="filtro-de" label="De" valor={filtros.de} onChange={(v) => onFiltro('de', v)} max={filtros.ate} />
        <FiltroData id="filtro-ate" label="Até" valor={filtros.ate} onChange={(v) => onFiltro('ate', v)} min={filtros.de} />
        <FiltroSelect id="filtro-tipo" label="Tipo" valor={filtros.tipo} onChange={(v) => onFiltro('tipo', v)} opcoes={tiposMovimentacao} />
        <FiltroSelect
          id="filtro-item"
          label="Item"
          valor={filtros.item}
          onChange={(v) => onFiltro('item', v)}
          opcoes={(itens.data ?? []).map((i) => ({ valor: i.id, rotulo: `${i.codigo} · ${i.nome}` }))}
          className="sm:w-60"
        />
        <FiltroSelect
          id="filtro-equipamento"
          label="Equipamento"
          valor={filtros.equipamento}
          onChange={(v) => onFiltro('equipamento', v)}
          opcoes={(destinos.data ?? []).map((e) => ({ valor: e.id, rotulo: `${e.codigo} · ${e.nome}` }))}
          className="sm:w-60"
        />
      </BarraFiltros>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
      {!erro && historico.isPending && <Skeleton className="h-64 w-full" />}
      {historico.isError && <ErrorState onRetry={() => historico.refetch()} />}
      {historico.data?.length === 0 && <EmptyState title="Nenhuma movimentação no período" icon={HistoryIcon} />}
      {historico.data && historico.data.length > 0 && <MovimentacoesLista movimentacoes={historico.data} rotulo="Movimentações" />}
    </>
  )
}
