import { MapPinOffIcon } from 'lucide-react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { SimulatedBadge } from '@/components/shared/simulated-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IndicadoresCentral } from '@/features/central/components/indicadores-central'
import { PisoSelect } from '@/features/pisos/components/piso-select'
import { usePisos } from '@/features/pisos/hooks'

export function CentralPage() {
  const { data: pisos, isPending, isError, refetch } = usePisos()
  const [selecionado, setSelecionado] = useState<string>()

  const pisoId = selecionado ?? pisos?.[0]?.id
  const piso = pisos?.find((p) => p.id === pisoId)

  return (
    <>
      <PageHeader title="Central de Controle" />

      <IndicadoresCentral />

      {isPending && <Skeleton className="h-64 w-full" />}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {pisos && pisos.length === 0 && <EmptyState title="Nenhum piso cadastrado" />}

      {pisos && piso && (
        <section aria-labelledby="mapa-titulo" className="grid gap-4">
          <PisoSelect pisos={pisos} value={pisoId} onChange={setSelecionado} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle id="mapa-titulo">{piso.nome}</CardTitle>
              <SimulatedBadge />
            </CardHeader>
            <CardContent>
              <EmptyState title="Sem marcadores neste piso" icon={MapPinOffIcon} />
            </CardContent>
          </Card>
        </section>
      )}
    </>
  )
}
