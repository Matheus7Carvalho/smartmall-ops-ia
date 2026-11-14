import { api, ApiError } from '@/lib/api'
import type { LoginRequest, UsuarioSessao } from './types'

export const authApi = {
  entrar: (dados: LoginRequest) => api.post<UsuarioSessao>('/auth/login', dados),
  sair: () => api.post<void>('/auth/logout'),
  /** null quando não há sessão. */
  sessao: () =>
    api.get<UsuarioSessao>('/auth/sessao').catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }),
}
