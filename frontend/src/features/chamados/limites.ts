/** Iguais aos limites de AprovarChamadoRequest e ArquivarChamadoRequest. */
export const LIMITE_CHAMADO = {
  duracao: { min: 1, max: 1440 },
  motivoArquivamento: 500,
} as const
