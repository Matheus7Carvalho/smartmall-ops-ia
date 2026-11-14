export const LIMITE = {
  /** Período máximo de uma consulta de tarefas (TarefaService.MAX_DIAS_CONSULTA). */
  diasConsulta: 93,
  /** Observação do responsável e texto da avaliação (@Size dos requests, colunas VARCHAR(500)). */
  observacao: 500,
  /** Resposta de texto sem máximo próprio no item (coluna TAREFA_ITEM.RESPOSTA). */
  respostaTexto: 500,
  /** Resposta numérica (ExecucaoTarefaService.MAX_NUMERO). */
  numero: 999_999_999,
  /** Imagem de evidência (ExecucaoTarefaService.MAX_BYTES_EVIDENCIA). */
  bytesEvidencia: 5 * 1024 * 1024,
  /** Imagens por envio para análise (ExecucaoTarefaService.MAX_EVIDENCIAS_POR_ENVIO). */
  evidenciasPorEnvio: 10,
} as const
