import { Navigate } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { itensPermitidos } from '@/components/layout/navigation'
import { useSessao } from '@/features/auth/hooks'

/** Envia para o primeiro módulo permitido ao perfil. */
export function HomeRedirect() {
  const { data: usuario } = useSessao()
  const primeiro = itensPermitidos(usuario?.perfil)[0]

  if (primeiro) return <Navigate to={primeiro.to} replace />

  return (
    <>
      <PageHeader title="Início" />
      <EmptyState title="Nenhum módulo disponível para o seu perfil." />
    </>
  )
}
