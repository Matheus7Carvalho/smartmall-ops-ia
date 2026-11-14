import { api } from '@/lib/api'
import type { FiltroRelatorio, RelatorioTarefas } from './types'

export const relatoriosApi = {
  tarefas: (filtro: FiltroRelatorio) => api.get<RelatorioTarefas>('/relatorio/tarefas', filtro),
}
