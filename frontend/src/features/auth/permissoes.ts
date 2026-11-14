import type { Perfil } from './types'

export function temPerfil(perfil: Perfil | undefined, permitidos: readonly Perfil[] | undefined) {
  if (!permitidos) return true
  return perfil !== undefined && permitidos.includes(perfil)
}
