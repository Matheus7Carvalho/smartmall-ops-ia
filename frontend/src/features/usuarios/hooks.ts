import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { equipeKeys } from '@/features/equipes/hooks'
import { sessaoKey } from '@/features/auth/hooks'
import { usuariosApi } from './api'
import type { UsuarioFiltros, UsuarioRequest } from './types'

export const usuarioKeys = {
  all: ['usuarios'] as const,
  pagina: (numero: number, filtros: UsuarioFiltros) => ['usuarios', 'pagina', numero, filtros.nome, filtros.email, filtros.perfil, filtros.ativo] as const,
  detalhe: (id: string) => ['usuarios', 'detalhe', id] as const,
}

export function useUsuarios(pagina: number, filtros: UsuarioFiltros) {
  return useQuery({ queryKey: usuarioKeys.pagina(pagina, filtros), queryFn: () => usuariosApi.listar(pagina, filtros) })
}

export function useUsuario(id: string | undefined) {
  return useQuery({ queryKey: usuarioKeys.detalhe(id ?? ''), queryFn: () => usuariosApi.buscar(id!), enabled: !!id })
}

export function useSalvarUsuario(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: UsuarioRequest) => (id ? usuariosApi.atualizar(id, dados) : usuariosApi.criar(dados)),
    onSuccess: (salvo) => {
      queryClient.setQueryData(usuarioKeys.detalhe(salvo.id), salvo)
      // Perfil e estado ativo podem mudar para a própria sessão.
      queryClient.invalidateQueries({ queryKey: sessaoKey })
      queryClient.invalidateQueries({ queryKey: equipeKeys.funcionarios })
      return queryClient.invalidateQueries({ queryKey: usuarioKeys.all })
    },
  })
}

export function useExcluirUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: usuariosApi.excluir,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipeKeys.funcionarios })
      return queryClient.invalidateQueries({ queryKey: usuarioKeys.all })
    },
  })
}
