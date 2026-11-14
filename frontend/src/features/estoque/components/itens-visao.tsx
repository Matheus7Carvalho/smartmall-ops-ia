import { PackageIcon } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ExcluirDialog } from '@/components/shared/excluir-dialog'
import { BarraFiltros, FiltroSelect, FiltroTexto } from '@/components/shared/filtros'
import { SemResultado } from '@/components/shared/sem-resultado'
import { Skeleton } from '@/components/ui/skeleton'
import { contem } from '@/lib/filtros'
import { useExcluirItemEstoque, useItensEstoque } from '../hooks'
import { categoriasItem, situacaoSaldo, situacoesSaldo, type ItemEstoque, type TipoMovimentacao } from '../types'
import { ItensLista } from './itens-lista'
import { MovimentacaoSheet, type PedidoMovimentacao } from './movimentacao-sheet'

type Filtros = { busca: string; categoria: string; saldo: string }

type ItensVisaoProps = {
  gestao: boolean
  filtros: Filtros
  ativos: number
  onFiltro: (chave: keyof Filtros, valor: string) => void
  onLimpar: () => void
  /** Botão "Novo item" (só gestão), mostrado também no estado vazio. */
  novo: React.ReactNode
}

/** Saldo atual de cada item, com entrada e retirada. */
export function ItensVisao({ gestao, filtros, ativos, onFiltro, onLimpar, novo }: ItensVisaoProps) {
  const { data: itens, isPending, isError, refetch } = useItensEstoque()
  const excluir = useExcluirItemEstoque()
  const [pedido, setPedido] = useState<PedidoMovimentacao | null>(null)
  const [excluindo, setExcluindo] = useState<ItemEstoque | null>(null)

  const visiveis = (itens ?? []).filter(
    (i) =>
      contem(`${i.codigo} ${i.nome} ${i.localizacao ?? ''}`, filtros.busca) &&
      (!filtros.categoria || i.categoria === filtros.categoria) &&
      (!filtros.saldo || situacaoSaldo(i) === filtros.saldo),
  )
  const contar = (s: string) => (itens ?? []).filter((i) => situacaoSaldo(i) === s).length

  return (
    <>
      <BarraFiltros ativos={ativos} onLimpar={onLimpar}>
        <FiltroTexto id="filtro-busca" label="Item" valor={filtros.busca} onChange={(v) => onFiltro('busca', v)} className="sm:w-64" />
        <FiltroSelect id="filtro-categoria" label="Categoria" valor={filtros.categoria} onChange={(v) => onFiltro('categoria', v)} opcoes={categoriasItem} todos="Todas" />
        <FiltroSelect id="filtro-saldo" label="Saldo" valor={filtros.saldo} onChange={(v) => onFiltro('saldo', v)} opcoes={situacoesSaldo} />
      </BarraFiltros>

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {itens?.length === 0 && <EmptyState title="Nenhum item cadastrado" icon={PackageIcon} action={gestao ? novo : undefined} />}
      {itens && itens.length > 0 && (
        <>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4" aria-label="Situação do estoque">
            {[
              { rotulo: 'Itens', valor: itens.length },
              { rotulo: 'Normal', valor: contar('NORMAL') },
              { rotulo: 'Baixo', valor: contar('BAIXO') },
              { rotulo: 'Zerado', valor: contar('ZERADO') },
            ].map(({ rotulo, valor }) => (
              <div key={rotulo} className="grid rounded-lg border p-3 sm:p-4">
                <dt className="text-xs text-muted-foreground">{rotulo}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{valor}</dd>
              </div>
            ))}
          </dl>
          {visiveis.length === 0 ? (
            <SemResultado onLimpar={onLimpar} />
          ) : (
            <ItensLista itens={visiveis} gestao={gestao} onMovimentar={(item: ItemEstoque, tipo: TipoMovimentacao) => setPedido({ item, tipo })} onExcluir={setExcluindo} />
          )}
        </>
      )}

      <MovimentacaoSheet pedido={pedido} onClose={() => setPedido(null)} />
      <ExcluirDialog
        registro={excluindo && { id: excluindo.id, nome: `${excluindo.codigo} · ${excluindo.nome}` }}
        titulo="Excluir item?"
        mensagemSucesso="Item excluído."
        mutacao={excluir}
        onClose={() => setExcluindo(null)}
      />
    </>
  )
}
