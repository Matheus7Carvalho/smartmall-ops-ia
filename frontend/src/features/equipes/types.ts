/** Espelha EquipeResponse. */
export type Equipe = {
  id: string
  nome: string
  membros: { id: string; nome: string }[]
  dataCriacao: string
  dataAtualizacao: string | null
}

/** Espelha EquipeRequest. */
export type EquipeRequest = { nome: string; membrosIds: string[] }

/** Espelha UsuarioResponse (funcionários candidatos a membro). */
export type Funcionario = { id: string; nome: string; email: string }
