import type { Tom } from '@/lib/tons'

/** Espelha SituacaoFuncionario: calculada no servidor (ausência > tarefa em execução > disponível). */
export type SituacaoFuncionario = 'DISPONIVEL' | 'OCUPADO' | 'INDISPONIVEL'

/** Motivos genéricos. LGPD: sem "atestado" nem texto livre, para não registrar dado de saúde. */
export type MotivoAusencia = 'FOLGA' | 'FERIAS' | 'AFASTAMENTO' | 'TREINAMENTO' | 'OUTRO'

export type Ausencia = { id: string; motivo: MotivoAusencia; inicio: string; fim: string }

/** Espelha FuncionarioDisponibilidadeResponse. Só nome e vínculos operacionais (sem e-mail). */
export type Disponibilidade = {
  id: string
  nome: string
  equipes: { id: string; nome: string }[]
  situacao: SituacaoFuncionario
  tarefaAtual: { id: string; equipamento: string; equipe: string; dataHoraPrevista: string } | null
  tarefasEmExecucao: number
  /** A vigente; sem ela, a próxima agendada. */
  ausencia: Ausencia | null
}

/** Espelha AusenciaRequest. */
export type AusenciaRequest = { usuarioId: string; inicio: string; fim: string; motivo: MotivoAusencia }

export const situacaoFuncionarioInfo: Record<SituacaoFuncionario, { rotulo: string; singular: string; plural: string; tom: Tom }> = {
  DISPONIVEL: { rotulo: 'Disponível', singular: 'disponível', plural: 'disponíveis', tom: 'sucesso' },
  OCUPADO: { rotulo: 'Ocupado', singular: 'ocupado', plural: 'ocupados', tom: 'andamento' },
  INDISPONIVEL: { rotulo: 'Indisponível', singular: 'indisponível', plural: 'indisponíveis', tom: 'neutro' },
}

export const SITUACOES_FUNCIONARIO = Object.keys(situacaoFuncionarioInfo) as SituacaoFuncionario[]

export const motivoAusenciaRotulo: Record<MotivoAusencia, string> = {
  FOLGA: 'Folga',
  FERIAS: 'Férias',
  AFASTAMENTO: 'Afastamento',
  TREINAMENTO: 'Treinamento',
  OUTRO: 'Outro',
}

export const MOTIVOS_AUSENCIA = Object.keys(motivoAusenciaRotulo) as MotivoAusencia[]

/** Período máximo de uma ausência, igual ao do servidor (DisponibilidadeService.DIAS_MAXIMOS). */
export const DIAS_MAXIMOS_AUSENCIA = 366
