import { api, type Page } from '@/lib/api'
import type { AprovarChamadoRequest, ArquivarChamadoRequest, Chamado, StatusChamado } from './types'

export const chamadosApi = {
  listar: (page: number, status?: StatusChamado) => api.get<Page<Chamado>>('/chamado', { page, size: 20, ...(status ? { status } : {}) }),
  buscar: (id: string) => api.get<Chamado>(`/chamado/${id}`),
  aprovar: (id: string, dados: AprovarChamadoRequest) => api.post<Chamado>(`/chamado/${id}/aprovar`, dados),
  arquivar: (id: string, dados: ArquivarChamadoRequest) => api.post<Chamado>(`/chamado/${id}/arquivar`, dados),
}
