/** Iguais ao ItemEstoqueRequest e ao MovimentacaoRequest do backend e às colunas do banco. */
export const LIMITE = {
  codigo: 20,
  nome: 100,
  descricao: 500,
  localizacao: 100,
  minimo: { min: 0, max: 100000 },
  quantidade: { min: 1, max: 100000 },
  observacao: 200,
} as const
