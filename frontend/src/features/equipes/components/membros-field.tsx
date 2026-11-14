import { Controller, useFormContext } from 'react-hook-form'
import { ErrorState } from '@/components/shared/error-state'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useFuncionarios } from '../hooks'
import type { EquipeForm } from '../schemas'

/** Seleção de membros entre os funcionários ativos, em grade de caixas de marcação. */
export function MembrosField() {
  const { control } = useFormContext<EquipeForm>()
  const funcionarios = useFuncionarios()

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-sm font-medium">Membros</legend>
      {funcionarios.isPending && <Skeleton className="h-24 w-full" />}
      {funcionarios.isError && <ErrorState onRetry={() => funcionarios.refetch()} />}
      {funcionarios.data?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum funcionário ativo.</p>}
      {funcionarios.data && funcionarios.data.length > 0 && (
        <Controller
          control={control}
          name="membrosIds"
          render={({ field, fieldState }) => {
            const marcados = new Set(field.value)
            const alternar = (id: string, marcar: boolean) => {
              const proximo = new Set(marcados)
              if (marcar) proximo.add(id)
              else proximo.delete(id)
              field.onChange([...proximo].sort())
            }
            return (
              <>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {funcionarios.data.map((f) => (
                    <Label
                      key={f.id}
                      htmlFor={`membro-${f.id}`}
                      className="flex cursor-pointer items-center gap-3 rounded-md border p-3 font-normal has-data-[state=checked]:border-primary/40 has-data-[state=checked]:bg-primary/5"
                    >
                      <Checkbox id={`membro-${f.id}`} checked={marcados.has(f.id)} onCheckedChange={(v) => alternar(f.id, v === true)} />
                      <span className="grid leading-tight">
                        <span className="font-medium">{f.nome}</span>
                        <span className="truncate text-xs text-muted-foreground">{f.email}</span>
                      </span>
                    </Label>
                  ))}
                </div>
                <FieldError errors={[fieldState.error]} />
              </>
            )
          }}
        />
      )}
    </fieldset>
  )
}
