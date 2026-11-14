import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type OpcaoVisao<T extends string> = { valor: T; rotulo: string; icone: LucideIcon }

type AlternarVisaoProps<T extends string> = {
  opcoes: readonly OpcaoVisao<T>[]
  valor: T
  onChange: (valor: T) => void
}

/** Alterna entre formas de ver a mesma tela (ex.: Calendário/Kanban, Equipes/Funcionários). */
export function AlternarVisao<T extends string>({ opcoes, valor, onChange }: AlternarVisaoProps<T>) {
  return (
    <div role="group" aria-label="Visualização" className="flex rounded-lg border p-0.5">
      {opcoes.map(({ valor: opcao, rotulo, icone: Icone }) => (
        <Button
          key={opcao}
          type="button"
          size="sm"
          variant={valor === opcao ? 'secondary' : 'ghost'}
          aria-pressed={valor === opcao}
          onClick={() => onChange(opcao)}
        >
          <Icone aria-hidden data-icon="inline-start" />
          {rotulo}
        </Button>
      ))}
    </div>
  )
}
