import { api, type Page } from '@/lib/api'
import type { ManutencaoProgramada, ManutencaoProgramadaRequest } from './types'

export const programadasApi = {
  listar: () => api.get<Page<ManutencaoProgramada>>('/manutencao-programada', { size: 500 }).then((p) => p.content),
  buscar: (id: string) => api.get<ManutencaoProgramada>(`/manutencao-programada/${id}`),
  criar: (dados: ManutencaoProgramadaRequest) => api.post<ManutencaoProgramada>('/manutencao-programada', dados),
  atualizar: (id: string, dados: ManutencaoProgramadaRequest) => api.put<ManutencaoProgramada>(`/manutencao-programada/${id}`, dados),
  encerrar: (id: string) => api.post<ManutencaoProgramada>(`/manutencao-programada/${id}/encerrar`),
  excluir: (id: string) => api.delete(`/manutencao-programada/${id}`),
}
