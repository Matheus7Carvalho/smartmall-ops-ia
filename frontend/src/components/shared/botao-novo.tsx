import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useOrigemAtual } from '@/lib/navegacao'

/** Ação primária de criar registro. Leva a origem, para o Cancelar voltar à tela atual (com filtros). */
export function BotaoNovo({ para, children }: { para: string; children: string }) {
  const origem = useOrigemAtual()
  return (
    <Button asChild>
      <Link to={para} state={origem}>
        <PlusIcon aria-hidden />
        {children}
      </Link>
    </Button>
  )
}
