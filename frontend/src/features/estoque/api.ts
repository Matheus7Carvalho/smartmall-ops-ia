import { api, type Page } from '@/lib/api'
import type { FiltroMovimentacoes, ItemEstoque, ItemEstoqueRequest, Movimentacao, MovimentacaoRequest, Resumo, TipoMovimentacao } from './types'

export const estoqueApi = {
  listar: () => api.get<Page<ItemEstoque>>('/estoque/item', { sort: 'codigo', size: 500 }).then((p) => p.content),
  buscar: (id: string) => api.get<ItemEstoque>(`/estoque/item/${id}`),
  criar: (dados: ItemEstoqueRequest) => api.post<ItemEstoque>('/estoque/item', dados),
  atualizar: (id: string, dados: ItemEstoqueRequest) => api.put<ItemEstoque>(`/estoque/item/${id}`, dados),
  excluir: (id: string) => api.delete(`/estoque/item/${id}`),
  movimentar: (id: string, tipo: TipoMovimentacao, dados: MovimentacaoRequest) =>
    api.post<Movimentacao>(`/estoque/item/${id}/${tipo === 'ENTRADA' ? 'entrada' : 'retirada'}`, dados),
  doItem: (id: string) => api.get<Movimentacao[]>(`/estoque/item/${id}/movimentacoes`),
  historico: (filtro: FiltroMovimentacoes) => api.get<Movimentacao[]>('/estoque/movimentacao', filtro),
  destinos: () => api.get<Resumo[]>('/estoque/destinos'),
}
