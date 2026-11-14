import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { equipamentosApi } from './api'
import type { EquipamentoRequest } from './types'

export const equipamentoKeys = {
  all: ['equipamentos'] as const,
  detalhe: (id: string) => ['equipamentos', id] as const,
}

export function useEquipamentos() {
  return useQuery({ queryKey: equipamentoKeys.all, queryFn: equipamentosApi.listar })
}

export function useEquipamento(id: string | undefined) {
  return useQuery({ queryKey: equipamentoKeys.detalhe(id ?? ''), queryFn: () => equipamentosApi.buscar(id!), enabled: !!id })
}

export function useSalvarEquipamento(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: EquipamentoRequest) => (id ? equipamentosApi.atualizar(id, dados) : equipamentosApi.criar(dados)),
    onSuccess: (salvo) => {
      queryClient.setQueryData(equipamentoKeys.detalhe(salvo.id), salvo)
      return queryClient.invalidateQueries({ queryKey: equipamentoKeys.all, exact: true })
    },
  })
}

export function useExcluirEquipamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: equipamentosApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipamentoKeys.all }),
  })
}
