export type TipoResposta = 'SIM_NAO' | 'TEXTO' | 'NUMERO'

export const tiposResposta: { valor: TipoResposta; rotulo: string }[] = [
  { valor: 'SIM_NAO', rotulo: 'Sim/Não' },
  { valor: 'TEXTO', rotulo: 'Texto' },
  { valor: 'NUMERO', rotulo: 'Número' },
]

export const tipoRespostaLabel = Object.fromEntries(tiposResposta.map((t) => [t.valor, t.rotulo])) as Record<TipoResposta, string>

export const MAX_ITENS = 50
export const MAX_CARACTERES_TEXTO = 500

/** Espelha ChecklistItemResponse. */
export type ChecklistItem = {
  id: string
  ordem: number
  pergunta: string
  tipoResposta: TipoResposta
  obrigatorio: boolean
  maxCaracteres: number | null
}

/** Espelha ChecklistResponse. */
export type Checklist = {
  id: string
  nome: string
  itens: ChecklistItem[]
  dataCriacao: string
  dataAtualizacao: string | null
}

/** Espelha ChecklistRequest. A ordem do array é a ordem dos itens. */
export type ChecklistRequest = {
  nome: string
  itens: {
    pergunta: string
    tipoResposta: TipoResposta
    obrigatorio: boolean
    maxCaracteres?: number
  }[]
}
