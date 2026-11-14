import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** Identifica dados, rotas ou classificações demonstrativas (RNF07). */
export function SimulatedBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="border-warning text-warning-foreground">
          Simulado
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Dado demonstrativo</TooltipContent>
    </Tooltip>
  )
}
