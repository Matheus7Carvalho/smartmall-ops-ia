import { useQuery } from '@tanstack/react-query'
import { pisosApi } from './api'

export const pisoKeys = {
  all: ['pisos'] as const,
}

export function usePisos() {
  return useQuery({ queryKey: pisoKeys.all, queryFn: pisosApi.listar })
}
