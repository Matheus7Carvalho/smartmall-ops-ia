import { api, type Page } from '@/lib/api'
import type { Ausencia, AusenciaRequest, Disponibilidade } from './disponibilidade'
import type { Equipe, EquipeRequest, Funcionario } from './types'

export const equipesApi = {
  listar: () => api.get<Page<Equipe>>('/equipe', { sort: 'nome', size: 200 }).then((p) => p.content),
  buscar: (id: string) => api.get<Equipe>(`/equipe/${id}`),
  criar: (dados: EquipeRequest) => api.post<Equipe>('/equipe', dados),
  atualizar: (id: string, dados: EquipeRequest) => api.put<Equipe>(`/equipe/${id}`, dados),
  excluir: (id: string) => api.delete(`/equipe/${id}`),
  funcionarios: () => api.get<Funcionario[]>('/usuario/funcionarios'),
  disponibilidade: () => api.get<Disponibilidade[]>('/disponibilidade'),
  registrarAusencia: (dados: AusenciaRequest) => api.post<Ausencia>('/ausencia', dados),
  encerrarAusencia: (id: string) => api.post<void>(`/ausencia/${id}/encerrar`),
}
