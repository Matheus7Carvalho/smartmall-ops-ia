import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightIcon, CircleAlertIcon, Loader2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api'
import { useEntrar } from '../hooks'
import { LIMITE_LOGIN, loginSchema, type LoginForm as LoginFormValues } from '../schemas'
import type { UsuarioSessao } from '../types'
import { DemoAccess } from './demo-access'

type LoginFormProps = {
  onSuccess: (usuario: UsuarioSessao) => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const entrar = useEntrar()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  })
  const { errors } = form.formState

  const submit = form.handleSubmit((dados) => entrar.mutate(dados, { onSuccess }))

  const entrarComo = (email: string, senha: string) => {
    form.reset({ email, senha })
    void submit()
  }

  const erro = entrar.error instanceof ApiError ? entrar.error.message : entrar.error && 'Não foi possível entrar.'

  return (
    <div className="grid gap-6">
      <form onSubmit={submit} aria-labelledby="login-titulo">
        <FieldGroup>
          {erro && (
            <Alert variant="destructive">
              <CircleAlertIcon aria-hidden />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              className="h-11 rounded-lg px-3.5"
              required
              maxLength={LIMITE_LOGIN.email}
              aria-invalid={!!errors.email}
              {...form.register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={!!errors.senha}>
            <FieldLabel htmlFor="senha">Senha</FieldLabel>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              className="h-11 rounded-lg px-3.5"
              required
              maxLength={LIMITE_LOGIN.senha}
              aria-invalid={!!errors.senha}
              {...form.register('senha')}
            />
            <FieldError errors={[errors.senha]} />
          </Field>
          <Button type="submit" size="lg" className="h-11 rounded-lg font-semibold" disabled={entrar.isPending}>
            {entrar.isPending && <Loader2Icon className="animate-spin" aria-hidden />}
            Entrar
            {!entrar.isPending && <ArrowRightIcon aria-hidden data-icon="inline-end" />}
          </Button>
        </FieldGroup>
      </form>
      <DemoAccess disabled={entrar.isPending} onSelect={entrarComo} />
    </div>
  )
}
