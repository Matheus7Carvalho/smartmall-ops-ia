import { api, type Page } from '@/lib/api'
import type { Usuario, UsuarioFiltros, UsuarioRequest } from './types'

export const usuariosApi = {
  listar: (pagina: number, filtros: UsuarioFiltros) => {
    const params = { page: pagina, size: 20, sort: 'nome', nome: filtros.nome || undefined, email: filtros.email || undefined, perfil: filtros.perfil || undefined, ativo: filtros.ativo || undefined }
    const caminho = Object.values(filtros).some(Boolean) ? '/usuario/filtrar' : '/usuario'
    return api.get<Page<Usuario>>(caminho, params)
  },
  buscar: (id: string) => api.get<Usuario>(`/usuario/${id}`),
  criar: (dados: UsuarioRequest) => api.post<Usuario>('/usuario', dados),
  atualizar: (id: string, dados: UsuarioRequest) => api.put<Usuario>(`/usuario/${id}`, dados),
  excluir: (id: string) => api.delete(`/usuario/${id}`),
}
