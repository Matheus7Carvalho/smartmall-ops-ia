import type { Tom } from '@/lib/tons'

export type CategoriaItem = 'PECA' | 'FERRAMENTA' | 'CONSUMIVEL' | 'EPI' | 'OUTROS'
export type Unidade = 'UN' | 'PAR' | 'CX' | 'PCT' | 'M' | 'L' | 'KG'
export type TipoMovimentacao = 'ENTRADA' | 'RETIRADA'

/** Espelha ItemEstoqueResponse. */
export type ItemEstoque = {
  id: string
  codigo: string
  nome: string
  descricao: string | null
  categoria: CategoriaItem
  unidade: Unidade
  estoqueMinimo: number
  localizacao: string | null
  saldo: number
  dataCriacao: string
  dataAtualizacao: string | null
}

/** Espelha ItemEstoqueRequest. O saldo não entra: só muda por movimentação. */
export type ItemEstoqueRequest = {
  codigo: string
  nome: string
  descricao: string
  categoria: CategoriaItem
  unidade: Unidade
  estoqueMinimo: number
  localizacao: string
}

export type Resumo = { id: string; codigo: string; nome: string }

/** Espelha MovimentacaoResponse. Do usuário, só o nome. */
export type Movimentacao = {
  id: string
  item: Resumo
  unidade: Unidade
  tipo: TipoMovimentacao
  quantidade: number
  saldoApos: number
  dataHora: string
  usuario: string
  equipamento: Resumo | null
  observacao: string | null
}

/** Espelha MovimentacaoRequest. */
export type MovimentacaoRequest = { quantidade: number; equipamentoId?: string; observacao?: string }

export type FiltroMovimentacoes = { de: string; ate: string; itemId?: string; equipamentoId?: string; tipo?: TipoMovimentacao }

export const categoriasItem: { valor: CategoriaItem; rotulo: string }[] = [
  { valor: 'PECA', rotulo: 'Peça' },
  { valor: 'FERRAMENTA', rotulo: 'Ferramenta' },
  { valor: 'CONSUMIVEL', rotulo: 'Consumível' },
  { valor: 'EPI', rotulo: 'EPI' },
  { valor: 'OUTROS', rotulo: 'Outros' },
]
export const categoriaItemRotulo = Object.fromEntries(categoriasItem.map((c) => [c.valor, c.rotulo])) as Record<CategoriaItem, string>

export const unidades: { valor: Unidade; rotulo: string }[] = [
  { valor: 'UN', rotulo: 'Unidade (un)' },
  { valor: 'PAR', rotulo: 'Par' },
  { valor: 'CX', rotulo: 'Caixa (cx)' },
  { valor: 'PCT', rotulo: 'Pacote (pct)' },
  { valor: 'M', rotulo: 'Metro (m)' },
  { valor: 'L', rotulo: 'Litro (L)' },
  { valor: 'KG', rotulo: 'Quilo (kg)' },
]
/** Abreviação ao lado das quantidades ("26 un"). */
export const unidadeCurta: Record<Unidade, string> = { UN: 'un', PAR: 'par', CX: 'cx', PCT: 'pct', M: 'm', L: 'L', KG: 'kg' }

export const tiposMovimentacao: { valor: TipoMovimentacao; rotulo: string; tom: Tom }[] = [
  { valor: 'ENTRADA', rotulo: 'Entrada', tom: 'sucesso' },
  { valor: 'RETIRADA', rotulo: 'Retirada', tom: 'info' },
]
export const tipoInfo = Object.fromEntries(tiposMovimentacao.map((t) => [t.valor, t])) as Record<TipoMovimentacao, (typeof tiposMovimentacao)[number]>

export type SituacaoSaldo = 'NORMAL' | 'BAIXO' | 'ZERADO'

export const situacoesSaldo: { valor: SituacaoSaldo; rotulo: string; tom: Tom }[] = [
  { valor: 'NORMAL', rotulo: 'Normal', tom: 'sucesso' },
  { valor: 'BAIXO', rotulo: 'Baixo', tom: 'atencao' },
  { valor: 'ZERADO', rotulo: 'Zerado', tom: 'perigo' },
]
export const situacaoSaldoInfo = Object.fromEntries(situacoesSaldo.map((s) => [s.valor, s])) as Record<SituacaoSaldo, (typeof situacoesSaldo)[number]>

/** Zerado: sem saldo. Baixo: abaixo do estoque mínimo. */
export function situacaoSaldo(item: Pick<ItemEstoque, 'saldo' | 'estoqueMinimo'>): SituacaoSaldo {
  if (item.saldo === 0) return 'ZERADO'
  if (item.saldo < item.estoqueMinimo) return 'BAIXO'
  return 'NORMAL'
}

/** Igual ao servidor (MovimentacaoEstoqueService.MAX_DIAS). */
export const MAX_DIAS_HISTORICO = 366
