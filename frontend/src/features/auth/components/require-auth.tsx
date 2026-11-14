import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { ErrorState } from '@/components/shared/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessao } from '../hooks'

/** Redireciona para /login sem sessão, guardando a rota de origem. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: usuario, isPending, isError, refetch } = useSessao()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6" aria-busy="true">
        <Skeleton className="h-10 w-48" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <ErrorState message="Servidor indisponível." onRetry={() => refetch()} />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
