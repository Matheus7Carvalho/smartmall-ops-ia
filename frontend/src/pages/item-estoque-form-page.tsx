import { ArrowDownToLineIcon, ArrowUpFromLineIcon, HistoryIcon } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { RegistroLoader } from '@/components/shared/registro-loader'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessao } from '@/features/auth/hooks'
import { temPerfil } from '@/features/auth/permissoes'
import { ItemForm } from '@/features/estoque/components/item-form'
import { MovimentacaoSheet, type PedidoMovimentacao } from '@/features/estoque/components/movimentacao-sheet'
import { MovimentacoesLista } from '@/features/estoque/components/movimentacoes-lista'
import { useItemEstoque, useMovimentacoesDoItem, useSalvarItemEstoque } from '@/features/estoque/hooks'
import { paraFormulario, paraRequisicao } from '@/features/estoque/schemas'
import { situacaoSaldo, situacaoSaldoInfo, unidadeCurta, type ItemEstoque } from '@/features/estoque/types'
import { useAcoesCadastro } from '@/lib/cadastro'

export function ItemEstoqueFormPage() {
  const { id } = useParams()
  const { data: usuario } = useSessao()
  const gestao = temPerfil(usuario?.perfil, ['ADMINISTRADOR', 'SUPERVISOR'])
  const item = useItemEstoque(id)
  const acoes = useAcoesCadastro({
    id,
    lista: '/estoque',
    mutacao: useSalvarItemEstoque(id),
    paraRequisicao,
    paraFormulario,
    mensagemSucesso: 'Item salvo.',
  })
  const titulo = !id ? 'Novo item' : gestao ? 'Editar item' : 'Item de estoque'

  return (
    <>
      <PageHeader title={titulo} />
      <RegistroLoader edicao={!!id} consulta={item} naoEncontrado="Item não encontrado.">
        <ItemForm key={item.data?.id ?? 'novo'} defaultValues={paraFormulario(item.data)} somenteLeitura={!gestao} {...acoes} />
      </RegistroLoader>
      {item.data && <Rastreabilidade item={item.data} gestao={gestao} />}
    </>
  )
}

/** Saldo atual, entrada/retirada e todas as movimentações do item (quem, quando, quanto, para onde). */
function Rastreabilidade({ item, gestao }: { item: ItemEstoque; gestao: boolean }) {
  const movimentacoes = useMovimentacoesDoItem(item.id)
  const [pedido, setPedido] = useState<PedidoMovimentacao | null>(null)
  const info = situacaoSaldoInfo[situacaoSaldo(item)]

  return (
    <section aria-labelledby="rastreabilidade-titulo" className="grid max-w-6xl min-w-0 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="rastreabilidade-titulo" className="text-lg font-semibold">
            Movimentações
          </h2>
          <span className="text-sm">
            Saldo{' '}
            <strong className="tabular-nums">
              {item.saldo} {unidadeCurta[item.unidade]}
            </strong>
          </span>
          <StatusBadge tom={info.tom}>{info.rotulo}</StatusBadge>
        </div>
        <div className="flex gap-2">
          {gestao && (
            <Button variant="outline" size="sm" onClick={() => setPedido({ item, tipo: 'ENTRADA' })}>
              <ArrowDownToLineIcon aria-hidden data-icon="inline-start" />
              Entrada
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={item.saldo === 0} onClick={() => setPedido({ item, tipo: 'RETIRADA' })}>
            <ArrowUpFromLineIcon aria-hidden data-icon="inline-start" />
            Retirada
          </Button>
        </div>
      </div>
      {movimentacoes.isPending && <Skeleton className="h-32 w-full" />}
      {movimentacoes.isError && <ErrorState onRetry={() => movimentacoes.refetch()} />}
      {movimentacoes.data?.length === 0 && <EmptyState title="Nenhuma movimentação registrada" icon={HistoryIcon} />}
      {movimentacoes.data && movimentacoes.data.length > 0 && <MovimentacoesLista movimentacoes={movimentacoes.data} mostrarItem={false} rotulo="Movimentações do item" />}
      <MovimentacaoSheet pedido={pedido} onClose={() => setPedido(null)} />
    </section>
  )
}
