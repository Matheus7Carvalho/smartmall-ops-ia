import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidarTarefasEProgramadas, programadaKeys } from '@/features/tarefas/keys'
import { programadasApi } from './api'
import type { ManutencaoProgramadaRequest } from './types'

export function useManutencoesProgramadas() {
  return useQuery({ queryKey: programadaKeys.all, queryFn: programadasApi.listar })
}

export function useManutencaoProgramada(id: string | undefined) {
  return useQuery({ queryKey: programadaKeys.detalhe(id ?? ''), queryFn: () => programadasApi.buscar(id!), enabled: !!id })
}

export function useSalvarManutencaoProgramada(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: ManutencaoProgramadaRequest) => (id ? programadasApi.atualizar(id, dados) : programadasApi.criar(dados)),
    onSuccess: (salva) => {
      queryClient.setQueryData(programadaKeys.detalhe(salva.id), salva)
      return invalidarTarefasEProgramadas(queryClient)
    },
  })
}

export function useEncerrarManutencaoProgramada() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: programadasApi.encerrar,
    onSuccess: (programada) => {
      queryClient.setQueryData(programadaKeys.detalhe(programada.id), programada)
      return invalidarTarefasEProgramadas(queryClient)
    },
  })
}

export function useExcluirManutencaoProgramada() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: programadasApi.excluir, onSuccess: () => invalidarTarefasEProgramadas(queryClient) })
}
