import type { Condicao } from '@/features/equipamentos/types'

/** Espelha RelatorioTarefasResponse.Contagem. taxaConclusao = concluídas / (total − canceladas), de 0 a 100. */
export type Contagem = {
  total: number
  agendadas: number
  atrasadas: number
  emExecucao: number
  emAnalise: number
  concluidas: number
  canceladas: number
  comReprovacao: number
  taxaConclusao: number
}

/** Espelha RelatorioTarefasResponse. Só dados agregados, sem dados pessoais. */
export type RelatorioTarefas = {
  de: string
  ate: string
  totais: Contagem
  porEquipe: { id: string; nome: string; contagem: Contagem }[]
  porEquipamento: { id: string; codigo: string; nome: string; condicao: Condicao; contagem: Contagem }[]
}

export type FiltroRelatorio = { de: string; ate: string; equipeId?: string }

/** Igual ao servidor (RelatorioService.MAX_DIAS). */
export const MAX_DIAS_RELATORIO = 366
