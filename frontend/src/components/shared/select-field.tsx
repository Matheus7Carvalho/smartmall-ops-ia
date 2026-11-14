import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type Opcao = { valor: string; rotulo: string }

type SelectFieldProps<T extends FieldValues> = {
  name: FieldPath<T>
  id: string
  label: string
  opcoes: Opcao[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

/** Select do shadcn ligado ao React Hook Form, com rótulo e erro. Usar dentro de FormProvider. */
export function SelectField<T extends FieldValues>({ name, id, label, opcoes, placeholder = 'Selecione', className, disabled }: SelectFieldProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error} className={cn('gap-1.5', className)}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger id={id} className="w-full" aria-invalid={!!fieldState.error} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {opcoes.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>
                  {o.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
