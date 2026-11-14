import type { UseQueryResult } from '@tanstack/react-query'
import { FileQuestionIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'

type RegistroLoaderProps = {
  /** false em cadastro novo: renderiza direto. */
  edicao: boolean
  consulta: UseQueryResult<unknown>
  naoEncontrado: string
  children: ReactNode
}

/** Estados de carregamento, erro e "não encontrado" de uma tela de edição. */
export function RegistroLoader({ edicao, consulta, naoEncontrado, children }: RegistroLoaderProps) {
  if (!edicao) return children
  if (consulta.isPending) return <Skeleton className="h-64 w-full max-w-6xl" />
  if (consulta.isError) {
    return consulta.error instanceof ApiError && consulta.error.status === 404 ? (
      <EmptyState title={naoEncontrado} icon={FileQuestionIcon} />
    ) : (
      <ErrorState onRetry={() => consulta.refetch()} />
    )
  }
  return children
}
