import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { relatoriosApi } from './api'
import type { FiltroRelatorio } from './types'

export const relatorioKeys = {
  tarefas: (filtro: FiltroRelatorio) => ['relatorio-tarefas', filtro] as const,
}

/** habilitado = período válido; mantém o resultado anterior na tela enquanto o novo carrega. */
export function useRelatorioTarefas(filtro: FiltroRelatorio, habilitado: boolean) {
  return useQuery({
    queryKey: relatorioKeys.tarefas(filtro),
    queryFn: () => relatoriosApi.tarefas(filtro),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  })
}
