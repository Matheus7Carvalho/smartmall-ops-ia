import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { equipesApi } from './api'
import type { AusenciaRequest } from './disponibilidade'
import type { EquipeRequest } from './types'

export const equipeKeys = {
  all: ['equipes'] as const,
  detalhe: (id: string) => ['equipes', id] as const,
  funcionarios: ['funcionarios'] as const,
  disponibilidade: ['disponibilidade'] as const,
}

/** Situação de hoje dos funcionários. Atualiza a cada minuto (tarefas assumidas por outros). */
export function useDisponibilidade(habilitado = true) {
  return useQuery({ queryKey: equipeKeys.disponibilidade, queryFn: equipesApi.disponibilidade, enabled: habilitado, refetchInterval: 60_000 })
}

export function useRegistrarAusencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: AusenciaRequest) => equipesApi.registrarAusencia(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipeKeys.disponibilidade }),
  })
}

export function useEncerrarAusencia() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => equipesApi.encerrarAusencia(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipeKeys.disponibilidade }),
  })
}

export function useEquipes(habilitado = true) {
  return useQuery({ queryKey: equipeKeys.all, queryFn: equipesApi.listar, enabled: habilitado })
}

export function useEquipe(id: string | undefined) {
  return useQuery({ queryKey: equipeKeys.detalhe(id ?? ''), queryFn: () => equipesApi.buscar(id!), enabled: !!id })
}

export function useFuncionarios() {
  return useQuery({ queryKey: equipeKeys.funcionarios, queryFn: equipesApi.funcionarios })
}

export function useSalvarEquipe(id: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados: EquipeRequest) => (id ? equipesApi.atualizar(id, dados) : equipesApi.criar(dados)),
    onSuccess: (salva) => {
      queryClient.setQueryData(equipeKeys.detalhe(salva.id), salva)
      return queryClient.invalidateQueries({ queryKey: equipeKeys.all, exact: true })
    },
  })
}

export function useExcluirEquipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: equipesApi.excluir,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipeKeys.all }),
  })
}
