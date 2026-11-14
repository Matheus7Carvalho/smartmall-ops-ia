import { ShieldXIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { podeAcessar } from '@/components/layout/navigation'
import { EmptyState } from '@/components/shared/empty-state'
import { useSessao } from '../hooks'

type RequirePerfilProps = {
  /** Rota do item de menu; os perfis permitidos vêm de navigation.ts. */
  rota: string
  children: ReactNode
}

/** Bloqueio de interface. A autorização efetiva é feita no backend. */
export function RequirePerfil({ rota, children }: RequirePerfilProps) {
  const { data: usuario } = useSessao()

  if (!podeAcessar(usuario?.perfil, rota)) {
    return <EmptyState title="Acesso não permitido para o seu perfil." icon={ShieldXIcon} />
  }

  return children
}
