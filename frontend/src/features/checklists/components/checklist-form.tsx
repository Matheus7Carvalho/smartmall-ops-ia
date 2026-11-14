import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { LIMITE } from '../limites'
import { checklistSchema, type ChecklistForm as ChecklistFormValues } from '../schemas'
import { ChecklistItensEditor } from './checklist-itens-editor'

type ChecklistFormProps = {
  defaultValues: ChecklistFormValues
  salvando: boolean
  erro?: string
  onSubmit: (dados: ChecklistFormValues) => Promise<ChecklistFormValues | undefined>
  onSalvo: () => void
  onCancel: () => void
}

export function ChecklistForm({ defaultValues, ...acoes }: ChecklistFormProps) {
  const form = useForm<ChecklistFormValues>({ resolver: zodResolver(checklistSchema), defaultValues })
  const erroNome = form.formState.errors.nome
  const nome = useWatch({ control: form.control, name: 'nome' })

  return (
    <CadastroForm form={form} rotulo="Modelo de checklist" {...acoes}>
      <Field data-invalid={!!erroNome} className="max-w-xl">
        <FieldLabel htmlFor="checklist-nome">Nome</FieldLabel>
        <LimitedInput
          id="checklist-nome"
          required
          maxLength={LIMITE.nome}
          length={nome?.length ?? 0}
          counter="always"
          enterKeyHint="next"
          aria-invalid={!!erroNome}
          {...form.register('nome')}
          // Enter no nome leva à primeira pergunta em vez de enviar o formulário.
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault()
              form.setFocus('itens.0.pergunta')
            }
          }}
        />
        <FieldError errors={[erroNome]} />
      </Field>

      <ChecklistItensEditor />
    </CadastroForm>
  )
}
