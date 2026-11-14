import { api, type Page } from '@/lib/api'
import type { Equipamento, EquipamentoRequest } from './types'

export const equipamentosApi = {
  listar: () => api.get<Page<Equipamento>>('/equipamento', { sort: 'nome', size: 500 }).then((p) => p.content),
  buscar: (id: string) => api.get<Equipamento>(`/equipamento/${id}`),
  criar: (dados: EquipamentoRequest) => api.post<Equipamento>('/equipamento', dados),
  atualizar: (id: string, dados: EquipamentoRequest) => api.put<Equipamento>(`/equipamento/${id}`, dados),
  excluir: (id: string) => api.delete(`/equipamento/${id}`),
}
