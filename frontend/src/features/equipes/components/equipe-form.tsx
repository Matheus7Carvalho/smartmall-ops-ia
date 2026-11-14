import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { LIMITE } from '../limites'
import { equipeSchema, type EquipeForm as Valores } from '../schemas'
import { MembrosField } from './membros-field'

type EquipeFormProps = {
  defaultValues: Valores
  salvando: boolean
  erro?: string
  onSubmit: (dados: Valores) => Promise<Valores | undefined>
  onSalvo: () => void
  onCancel: () => void
}

export function EquipeForm({ defaultValues, ...acoes }: EquipeFormProps) {
  const form = useForm<Valores>({ resolver: zodResolver(equipeSchema), defaultValues })
  const erroNome = form.formState.errors.nome
  const nome = useWatch({ control: form.control, name: 'nome' })

  return (
    <CadastroForm form={form} rotulo="Equipe" {...acoes}>
      <Field data-invalid={!!erroNome} className="max-w-xl gap-1.5">
        <FieldLabel htmlFor="equipe-nome">Nome</FieldLabel>
        <LimitedInput
          id="equipe-nome"
          required
          maxLength={LIMITE.nome}
          length={nome?.length ?? 0}
          counter="always"
          aria-invalid={!!erroNome}
          {...form.register('nome')}
        />
        <FieldError errors={[erroNome]} />
      </Field>
      <MembrosField />
    </CadastroForm>
  )
}
