import { api } from '@/lib/api'
import type { ExecucaoRequest, FiltroTarefas, ResumoTarefas, Tarefa, TarefaDetalhe } from './types'

export const tarefasApi = {
  listar: (filtro: FiltroTarefas) => api.get<Tarefa[]>('/tarefa', filtro),
  resumo: () => api.get<ResumoTarefas>('/tarefa/resumo'),
  cancelar: (id: string) => api.post<Tarefa>(`/tarefa/${id}/cancelar`),
  restaurar: (id: string) => api.post<Tarefa>(`/tarefa/${id}/restaurar`),

  detalhe: (id: string) => api.get<TarefaDetalhe>(`/tarefa/${id}`),
  emAnalise: () => api.get<Tarefa[]>('/tarefa/em-analise'),
  assumir: (id: string) => api.post<TarefaDetalhe>(`/tarefa/${id}/assumir`),
  salvar: (id: string, dados: ExecucaoRequest) => api.put<TarefaDetalhe>(`/tarefa/${id}/execucao`, dados),
  enviar: (id: string, dados: ExecucaoRequest) => api.post<TarefaDetalhe>(`/tarefa/${id}/enviar`, dados),
  aprovar: (id: string, observacao: string) => api.post<TarefaDetalhe>(`/tarefa/${id}/aprovar`, { observacao }),
  reprovar: (id: string, observacao: string) => api.post<TarefaDetalhe>(`/tarefa/${id}/reprovar`, { observacao }),
  adicionarEvidencia: (id: string, arquivo: Blob, nome: string) => {
    const dados = new FormData()
    dados.append('arquivo', arquivo, nome)
    return api.upload<TarefaDetalhe>(`/tarefa/${id}/evidencia`, dados)
  },
  removerEvidencia: (id: string, evidenciaId: string) => api.delete<TarefaDetalhe>(`/tarefa/${id}/evidencia/${evidenciaId}`),
}

/** URL da imagem (mesma origem: o cookie de sessão vai junto). */
export function urlDaEvidencia(tarefaId: string, evidenciaId: string) {
  return `/api/tarefa/${tarefaId}/evidencia/${evidenciaId}/arquivo`
}
