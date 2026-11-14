import { SearchXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from './empty-state'

/** Estado vazio de uma listagem filtrada (diferente de "nenhum cadastro"). */
export function SemResultado({ onLimpar }: { onLimpar: () => void }) {
  return (
    <EmptyState
      title="Nenhum resultado para os filtros."
      icon={SearchXIcon}
      action={
        <Button variant="outline" size="sm" onClick={onLimpar}>
          Limpar filtros
        </Button>
      }
    />
  )
}
