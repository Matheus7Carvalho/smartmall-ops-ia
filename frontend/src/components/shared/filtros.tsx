import { FilterXIcon, SearchIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Limite de texto dos filtros (guarda de limites: todo campo tem maxlength). */
export const LIMITE_FILTRO = 100

type BarraFiltrosProps = { ativos: number; onLimpar: () => void; children: ReactNode }

/** Linha de filtros de uma listagem. role="search" identifica a região para leitores de tela. */
export function BarraFiltros({ ativos, onLimpar, children }: BarraFiltrosProps) {
  return (
    <div role="search" aria-label="Filtros" className="flex flex-wrap items-end gap-3">
      {children}
      {ativos > 0 && (
        <Button type="button" variant="ghost" onClick={onLimpar}>
          <FilterXIcon aria-hidden />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}

function Rotulo({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
      {children}
    </Label>
  )
}

type FiltroTextoProps = { id: string; label: string; valor: string; onChange: (valor: string) => void; className?: string }

export function FiltroTexto({ id, label, valor, onChange, className }: FiltroTextoProps) {
  return (
    <div className={cn('grid w-full gap-1.5 sm:w-48', className)}>
      <Rotulo htmlFor={id}>{label}</Rotulo>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input id={id} type="search" maxLength={LIMITE_FILTRO} value={valor} onChange={(e) => onChange(e.target.value)} className="pl-8" />
      </div>
    </div>
  )
}

const TODOS = '__todos__'

type FiltroSelectProps = {
  id: string
  label: string
  valor: string
  onChange: (valor: string) => void
  opcoes: { valor: string; rotulo: string }[]
  todos?: string
  className?: string
}

export function FiltroSelect({ id, label, valor, onChange, opcoes, todos = 'Todos', className }: FiltroSelectProps) {
  return (
    <div className={cn('grid w-full gap-1.5 sm:w-44', className)}>
      <Rotulo htmlFor={id}>{label}</Rotulo>
      <Select value={valor || TODOS} onValueChange={(v) => onChange(v === TODOS ? '' : v)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{todos}</SelectItem>
          {opcoes.map((o) => (
            <SelectItem key={o.valor} value={o.valor}>
              {o.rotulo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

type FiltroDataProps = { id: string; label: string; valor: string; onChange: (valor: string) => void; min?: string; max?: string }

export function FiltroData({ id, label, valor, onChange, min, max }: FiltroDataProps) {
  return (
    <div className="grid w-full gap-1.5 sm:w-40">
      <Rotulo htmlFor={id}>{label}</Rotulo>
      <Input id={id} type="date" value={valor} min={min || undefined} max={max || undefined} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
