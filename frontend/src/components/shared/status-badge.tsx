import { Badge } from '@/components/ui/badge'
import { seloDoTom, type Tom } from '@/lib/tons'
import { cn } from '@/lib/utils'

export type { Tom } from '@/lib/tons'

/** Status com cor e texto padronizados. O texto sempre acompanha a cor (não depende só de cor). */
export function StatusBadge({ tom, children, className }: { tom: Tom; children: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', seloDoTom[tom], className)}>
      {children}
    </Badge>
  )
}
