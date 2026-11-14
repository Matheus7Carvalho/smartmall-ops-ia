import { useQuery } from '@tanstack/react-query'
import { centralApi } from './api'

export const centralKeys = {
  resumo: ['central-resumo'] as const,
}

/** A Central fica aberta acompanhando a operação: atualiza a cada 30 s. */
export function useResumoCentral() {
  return useQuery({ queryKey: centralKeys.resumo, queryFn: centralApi.resumo, refetchInterval: 30_000 })
}
