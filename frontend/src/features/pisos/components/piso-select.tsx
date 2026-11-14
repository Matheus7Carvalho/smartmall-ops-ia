import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Piso } from '../types'

type PisoSelectProps = {
  pisos: Piso[]
  value: string | undefined
  onChange: (id: string) => void
}

export function PisoSelect({ pisos, value, onChange }: PisoSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="piso-select">Piso</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="piso-select" className="w-full sm:w-64">
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {pisos.map((piso) => (
            <SelectItem key={piso.id} value={piso.id}>
              {piso.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
