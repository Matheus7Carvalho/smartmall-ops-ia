import { CircleCheckIcon, CircleMinusIcon, LoaderIcon, UserCheckIcon, type LucideIcon } from 'lucide-react'
import type { Disponibilidade, SituacaoFuncionario } from '../disponibilidade'

type Indicador = { rotulo: string; valor: number; icone: LucideIcon }

const contar = (lista: Disponibilidade[], situacao: SituacaoFuncionario) => lista.filter((f) => f.situacao === situacao).length

/** Presentes = disponíveis + ocupados (quem não está com ausência registrada para hoje). */
export function IndicadoresDisponibilidade({ funcionarios }: { funcionarios: Disponibilidade[] }) {
  const disponiveis = contar(funcionarios, 'DISPONIVEL')
  const ocupados = contar(funcionarios, 'OCUPADO')
  const indicadores: Indicador[] = [
    { rotulo: 'Presentes', valor: disponiveis + ocupados, icone: UserCheckIcon },
    { rotulo: 'Disponíveis', valor: disponiveis, icone: CircleCheckIcon },
    { rotulo: 'Ocupados', valor: ocupados, icone: LoaderIcon },
    { rotulo: 'Indisponíveis', valor: contar(funcionarios, 'INDISPONIVEL'), icone: CircleMinusIcon },
  ]

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4" aria-label="Disponibilidade hoje">
      {indicadores.map(({ rotulo, valor, icone: Icone }) => (
        <div key={rotulo} className="flex items-center gap-3 rounded-lg border p-3 sm:p-4">
          <Icone className="hidden size-5 shrink-0 text-muted-foreground sm:block" aria-hidden />
          <div className="grid">
            <dt className="text-xs text-muted-foreground">{rotulo}</dt>
            <dd className="text-2xl font-semibold tabular-nums">{valor}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
