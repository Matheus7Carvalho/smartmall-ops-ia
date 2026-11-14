import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checklistsApi } from './api'
import type { ChecklistRequest } from './types'

export const checklistKeys = {
  all: ['checklists'] as const,
  detalhe: (id: string) => ['checklists', id] as const,
}

export function useChecklists() {
  return useQuery({ queryKey: checklistKeys.all, queryFn: checklistsApi.listar })
}

export function useChecklist(id: string | undefined) {
  return useQuery({
    queryKey: checklistKeys.detalhe(id ?? ''),
    queryFn: () => checklistsApi.buscar(id!),
    enabled: !!id,
  })
}

/** Cria quando não há id; atualiza quando há. */
export function useSalvarChecklist(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: ChecklistRequest) => (id ? checklistsApi.atualizar(id, dados) : checklistsApi.criar(dados)),
    onSuccess: (salvo) => {
      // O detalhe já fica atualizado (a tela continua aberta); só a listagem é recarregada.
      queryClient.setQueryData(checklistKeys.detalhe(salvo.id), salvo)
      return queryClient.invalidateQueries({ queryKey: checklistKeys.all, exact: true })
    },
  })
}

export function useExcluirChecklist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checklistsApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: checklistKeys.all }),
  })
}
