import { api, type Page } from '@/lib/api'
import type { Checklist, ChecklistRequest } from './types'

export const checklistsApi = {
  listar: () => api.get<Page<Checklist>>('/checklist', { sort: 'nome', size: 200 }).then((page) => page.content),
  buscar: (id: string) => api.get<Checklist>(`/checklist/${id}`),
  criar: (dados: ChecklistRequest) => api.post<Checklist>('/checklist', dados),
  atualizar: (id: string, dados: ChecklistRequest) => api.put<Checklist>(`/checklist/${id}`, dados),
  excluir: (id: string) => api.delete(`/checklist/${id}`),
}
