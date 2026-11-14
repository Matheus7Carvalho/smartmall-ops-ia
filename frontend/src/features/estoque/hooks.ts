import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { estoqueApi } from './api'
import type { FiltroMovimentacoes, ItemEstoqueRequest, MovimentacaoRequest, TipoMovimentacao } from './types'

export const estoqueKeys = {
  itens: ['estoque-itens'] as const,
  item: (id: string) => ['estoque-itens', id] as const,
  doItem: (id: string) => ['estoque-movimentacoes', 'item', id] as const,
  movimentacoes: ['estoque-movimentacoes'] as const,
  historico: (filtro: FiltroMovimentacoes) => ['estoque-movimentacoes', 'historico', filtro] as const,
  destinos: ['estoque-destinos'] as const,
}

export function useItensEstoque() {
  return useQuery({ queryKey: estoqueKeys.itens, queryFn: estoqueApi.listar })
}

export function useItemEstoque(id: string | undefined) {
  return useQuery({ queryKey: estoqueKeys.item(id ?? ''), queryFn: () => estoqueApi.buscar(id!), enabled: !!id })
}

export function useSalvarItemEstoque(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: ItemEstoqueRequest) => (id ? estoqueApi.atualizar(id, dados) : estoqueApi.criar(dados)),
    onSuccess: (salvo) => {
      queryClient.setQueryData(estoqueKeys.item(salvo.id), salvo)
      return queryClient.invalidateQueries({ queryKey: estoqueKeys.itens, exact: true })
    },
  })
}

export function useExcluirItemEstoque() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: estoqueApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: estoqueKeys.itens }),
  })
}

/** Entrada ou retirada: atualiza saldos, a rastreabilidade do item e o histórico geral. */
export function useMovimentar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, tipo, dados }: { id: string; tipo: TipoMovimentacao; dados: MovimentacaoRequest }) => estoqueApi.movimentar(id, tipo, dados),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: estoqueKeys.itens }),
        queryClient.invalidateQueries({ queryKey: estoqueKeys.movimentacoes }),
      ]),
  })
}

export function useMovimentacoesDoItem(id: string | undefined) {
  return useQuery({ queryKey: estoqueKeys.doItem(id ?? ''), queryFn: () => estoqueApi.doItem(id!), enabled: !!id })
}

export function useHistoricoEstoque(filtro: FiltroMovimentacoes, habilitado: boolean) {
  return useQuery({ queryKey: estoqueKeys.historico(filtro), queryFn: () => estoqueApi.historico(filtro), enabled: habilitado, placeholderData: keepPreviousData })
}

export function useDestinos(habilitado = true) {
  return useQuery({ queryKey: estoqueKeys.destinos, queryFn: estoqueApi.destinos, enabled: habilitado, staleTime: 5 * 60_000 })
}
