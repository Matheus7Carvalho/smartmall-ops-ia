/** Iguais ao PlanoManutencaoRequest do backend e às colunas/checks do banco. */
export const LIMITE = {
  intervalo: { min: 1, max: 12 },
  duracao: { min: 15, max: 720 },
  observacoes: 500,
} as const
