/** Espelha ResumoCentralResponse do backend. */
export type ResumoCentral = {
  /** Ativas = em execução + em análise. */
  tarefas: { ativas: number; emExecucao: number; emAnalise: number }
  /** Em operação = equipes com ao menos uma tarefa em execução. */
  equipes: { emOperacao: number; total: number }
  /** percentualOperando: inteiro de 0 a 100. */
  equipamentos: { total: number; operando: number; percentualOperando: number }
  /** Urgentes = equipamentos inoperantes. */
  alertas: { total: number; urgentes: number; equipamentosInoperantes: number; equipamentosEmAtencao: number; tarefasAtrasadas: number }
}
