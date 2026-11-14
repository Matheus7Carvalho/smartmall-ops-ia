export type Perfil = 'ADMINISTRADOR' | 'SUPERVISOR' | 'FUNCIONARIO'

export const perfilLabel: Record<Perfil, string> = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  FUNCIONARIO: 'Funcionário',
}

/** Espelha UsuarioResponse. */
export type UsuarioSessao = {
  id: string
  nome: string
  email: string
  perfil: Perfil
}

export type LoginRequest = {
  email: string
  senha: string
}
