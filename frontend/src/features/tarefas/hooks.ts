import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tarefasApi } from './api'
import { invalidarTarefasEProgramadas, tarefaKeys } from './keys'
import type { ExecucaoRequest, FiltroTarefas, TarefaDetalhe } from './types'

export function useTarefas(filtro: FiltroTarefas, habilitado = true) {
  return useQuery({
    queryKey: tarefaKeys.filtro(filtro),
    queryFn: () => tarefasApi.listar(filtro),
    enabled: habilitado,
    placeholderData: (anterior) => anterior,
  })
}

export function useResumoTarefas() {
  return useQuery({ queryKey: tarefaKeys.resumo, queryFn: tarefasApi.resumo })
}

export function useCancelarTarefa() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: tarefasApi.cancelar, onSuccess: () => invalidarTarefasEProgramadas(queryClient) })
}

export function useRestaurarTarefa() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: tarefasApi.restaurar, onSuccess: () => invalidarTarefasEProgramadas(queryClient) })
}

export function useTarefa(id: string | undefined) {
  return useQuery({ queryKey: tarefaKeys.detalhe(id ?? ''), queryFn: () => tarefasApi.detalhe(id!), enabled: !!id })
}

export function useTarefasEmAnalise() {
  return useQuery({ queryKey: tarefaKeys.emAnalise, queryFn: tarefasApi.emAnalise })
}

/** Toda ação na tarefa devolve o detalhe atualizado: vira o cache da tela e recarrega listas e indicadores. */
function useAcaoNaTarefa<TArgs>(id: string, acao: (args: TArgs) => Promise<TarefaDetalhe>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acao,
    onSuccess: (detalhe) => {
      queryClient.setQueryData(tarefaKeys.detalhe(id), detalhe)
      return invalidarTarefasEProgramadas(queryClient)
    },
  })
}

export function useAssumirTarefa(id: string) {
  return useAcaoNaTarefa(id, () => tarefasApi.assumir(id))
}

export function useSalvarExecucao(id: string) {
  return useAcaoNaTarefa(id, (dados: ExecucaoRequest) => tarefasApi.salvar(id, dados))
}

export function useEnviarParaAnalise(id: string) {
  return useAcaoNaTarefa(id, (dados: ExecucaoRequest) => tarefasApi.enviar(id, dados))
}

export function useAprovarTarefa(id: string) {
  return useAcaoNaTarefa(id, (observacao: string) => tarefasApi.aprovar(id, observacao))
}

export function useReprovarTarefa(id: string) {
  return useAcaoNaTarefa(id, (motivo: string) => tarefasApi.reprovar(id, motivo))
}

export function useAdicionarEvidencia(id: string) {
  return useAcaoNaTarefa(id, ({ arquivo, nome }: { arquivo: Blob; nome: string }) => tarefasApi.adicionarEvidencia(id, arquivo, nome))
}

export function useRemoverEvidencia(id: string) {
  return useAcaoNaTarefa(id, (evidenciaId: string) => tarefasApi.removerEvidencia(id, evidenciaId))
}
