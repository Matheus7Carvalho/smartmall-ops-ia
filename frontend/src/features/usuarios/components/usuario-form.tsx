import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { SelectField } from '@/components/shared/select-field'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { perfilLabel } from '@/features/auth/types'
import { LIMITE } from '../limites'
import { usuarioSchema, type UsuarioFormValores } from '../schemas'

type Props = {
  edicao: boolean
  defaultValues: UsuarioFormValores
  salvando: boolean
  erro?: string
  onSubmit: (dados: UsuarioFormValores) => Promise<UsuarioFormValores | undefined>
  onSalvo: () => void
  onCancel: () => void
}

const perfis = (['ADMINISTRADOR', 'SUPERVISOR', 'FUNCIONARIO'] as const).map((valor) => ({ valor, rotulo: perfilLabel[valor] }))

export function UsuarioForm({ edicao, defaultValues, ...acoes }: Props) {
  const form = useForm<UsuarioFormValores>({ resolver: zodResolver(usuarioSchema(edicao)), defaultValues })
  const { errors } = form.formState
  const [nome, email, senha] = useWatch({ control: form.control, name: ['nome', 'email', 'senha'] })

  return (
    <CadastroForm form={form} rotulo="Membro" className="max-w-3xl" {...acoes}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.nome} className="gap-1.5">
          <FieldLabel htmlFor="usuario-nome">Nome</FieldLabel>
          <LimitedInput id="usuario-nome" required maxLength={LIMITE.nome} length={nome?.length ?? 0} aria-invalid={!!errors.nome} {...form.register('nome')} />
          <FieldError errors={[errors.nome]} />
        </Field>
        <Field data-invalid={!!errors.email} className="gap-1.5">
          <FieldLabel htmlFor="usuario-email">E-mail</FieldLabel>
          <LimitedInput id="usuario-email" required type="email" autoComplete="email" maxLength={LIMITE.email} length={email?.length ?? 0} aria-invalid={!!errors.email} {...form.register('email')} />
          <FieldError errors={[errors.email]} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.senha} className="gap-1.5">
          <FieldLabel htmlFor="usuario-senha">Senha{edicao ? ' (deixe em branco para manter)' : ''}</FieldLabel>
          <LimitedInput id="usuario-senha" type="password" autoComplete="new-password" required={!edicao} maxLength={LIMITE.senha} length={senha?.length ?? 0} aria-invalid={!!errors.senha} {...form.register('senha')} />
          <FieldError errors={[errors.senha]} />
        </Field>
        <SelectField<UsuarioFormValores> name="perfil" id="usuario-perfil" label="Perfil" opcoes={perfis} />
      </div>

      <Controller
        control={form.control}
        name="ativo"
        render={({ field }) => (
          <label htmlFor="usuario-ativo" className="flex w-fit cursor-pointer items-center gap-3 text-sm font-medium">
            <Checkbox id="usuario-ativo" checked={field.value} onCheckedChange={(valor) => field.onChange(valor === true)} onBlur={field.onBlur} />
            Membro ativo
          </label>
        )}
      />
    </CadastroForm>
  )
}
