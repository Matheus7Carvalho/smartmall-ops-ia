import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from './api'

export const sessaoKey = ['sessao'] as const

export function useSessao() {
  return useQuery({ queryKey: sessaoKey, queryFn: authApi.sessao, staleTime: Infinity })
}

export function useEntrar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.entrar,
    onSuccess: (usuario) => queryClient.setQueryData(sessaoKey, usuario),
  })
}

export function useSair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.sair,
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(sessaoKey, null)
    },
  })
}
