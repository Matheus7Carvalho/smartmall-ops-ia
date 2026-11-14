import { CircleAlertIcon } from 'lucide-react'
import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { FormActions } from './form-actions'

type CadastroFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  /** Nome acessível do formulário (ex.: "Equipamento"). */
  rotulo: string
  salvando: boolean
  erro?: string
  /** Persiste e retorna os valores salvos; undefined se falhar (o erro vem em `erro`). */
  onSubmit: (dados: T) => Promise<T | undefined>
  /** Chamado depois que o formulário assumiu os valores salvos (mensagem de sucesso, troca de rota). */
  onSalvo: () => void
  onCancel: () => void
  className?: string
  /** Desabilita os campos e troca as ações por "Voltar". */
  somenteLeitura?: boolean
  /** Ação principal além de Salvar, na barra fixa (FormActions). */
  acaoExtra?: ReactNode
  children: ReactNode
}

/**
 * Comportamento padrão de cadastro/edição (CLAUDE.md, "Telas de cadastro e edição"):
 * - Salvar persiste e permanece na tela; os valores salvos viram a nova base;
 * - Cancelar com alterações pede confirmação (FormActions);
 * - data-alterado expõe o estado aos testes E2E.
 */
export function CadastroForm<T extends FieldValues>({
  form,
  rotulo,
  salvando,
  erro,
  onSubmit,
  onSalvo,
  onCancel,
  className,
  somenteLeitura,
  acaoExtra,
  children,
}: CadastroFormProps<T>) {
  const [salvos, setSalvos] = useState<T>()

  const enviar = form.handleSubmit(async (dados) => {
    const resultado = await onSubmit(dados)
    if (resultado) setSalvos(resultado)
  })

  // O reset fica fora do handleSubmit porque o RHF sobrescreve o estado ao concluir o envio.
  // A mensagem de sucesso só sai depois do reset, para nunca haver "salvo" com alteração pendente.
  const avisarSalvo = useEffectEvent(onSalvo)
  useEffect(() => {
    if (!salvos) return
    form.reset(salvos)
    avisarSalvo()
  }, [salvos, form])

  return (
    <FormProvider {...form}>
      <form onSubmit={enviar} className={cn('grid max-w-6xl gap-6', className)} aria-label={rotulo} data-alterado={form.formState.isDirty}>
        {erro && (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}
        {/* display:contents mantém o layout em grade; disabled bloqueia todos os campos de uma vez. */}
        <fieldset disabled={somenteLeitura} className="contents">
          {children}
        </fieldset>
        <FormActions alterado={form.formState.isDirty} salvando={salvando} onCancel={onCancel} somenteLeitura={somenteLeitura} extra={acaoExtra} />
      </form>
    </FormProvider>
  )
}
