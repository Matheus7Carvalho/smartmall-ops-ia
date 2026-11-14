import type { Perfil } from '@/features/auth/types'

/** Espelha UsuarioResponse. A senha nunca vem da API. */
export type Usuario = {
  id: string
  nome: string
  email: string
  perfil: Perfil
  ativo: boolean
}

export type UsuarioRequest = {
  nome: string
  email: string
  perfil: Perfil
  ativo: boolean
  senha?: string
}

export type UsuarioFiltros = { nome: string; email: string; perfil: string; ativo: string }
