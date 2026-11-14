/**
 * Grade compartilhada entre o cabeçalho e as linhas de itens.
 * Celular: cartão em 4 linhas. Desktop (md+): uma linha por item, alinhada ao cabeçalho.
 * Áreas: h = alça, n = número, p = pergunta, t = tipo, m = máx. caracteres, o = obrigatório, a = ações.
 */
export const ITEM_GRID = [
  'grid items-start gap-x-2 gap-y-3',
  "grid-cols-[auto_minmax(0,1fr)_auto] [grid-template-areas:'h_n_a'_'p_p_p'_'t_t_o'_'m_m_m']",
  "md:grid-cols-[1.75rem_1.75rem_minmax(0,1fr)_9.5rem_7rem_5.5rem_6.5rem] md:gap-y-0 md:[grid-template-areas:'h_n_p_t_m_o_a']",
].join(' ')

export const AREA = {
  alca: '[grid-area:h]',
  numero: '[grid-area:n]',
  pergunta: '[grid-area:p]',
  tipo: '[grid-area:t]',
  max: '[grid-area:m]',
  obrigatorio: '[grid-area:o]',
  acoes: '[grid-area:a]',
} as const
