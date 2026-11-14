export type Frequencia = 'UNICA' | 'DIARIA' | 'SEMANAL' | 'MENSAL'

export const frequencias: { valor: Frequencia; rotulo: string; unidade: [string, string] }[] = [
  { valor: 'UNICA', rotulo: 'Única', unidade: ['', ''] },
  { valor: 'DIARIA', rotulo: 'Diária', unidade: ['dia', 'dias'] },
  { valor: 'SEMANAL', rotulo: 'Semanal', unidade: ['semana', 'semanas'] },
  { valor: 'MENSAL', rotulo: 'Mensal', unidade: ['mês', 'meses'] },
]

/** Espelha Resumo do backend (referência curta a uma entidade relacionada). */
export type Resumo = { id: string; nome: string; codigo: string | null }

/** Espelha ManutencaoProgramadaResponse: recorrência que gera tarefas. */
export type ManutencaoProgramada = {
  id: string
  equipamento: Resumo
  checklist: Resumo
  equipe: Resumo
  frequencia: Frequencia
  intervalo: number
  dataInicio: string
  horario: string
  duracaoMinutos: number
  dataFim: string | null
  observacoes: string | null
  ativo: boolean
  /** Próxima tarefa agendada. */
  proximaData: string | null
  dataCriacao: string
  dataAtualizacao: string | null
}

/** Espelha ManutencaoProgramadaRequest. */
export type ManutencaoProgramadaRequest = {
  equipamentoId: string
  checklistId: string
  equipeId: string
  frequencia: Frequencia
  intervalo: number
  dataInicio: string
  horario: string
  duracaoMinutos: number
  dataFim: string | null
  observacoes: string | null
}

export const nomeDaProgramada = (p: Pick<ManutencaoProgramada, 'equipamento'>) => `${p.equipamento.codigo} · ${p.equipamento.nome}`
